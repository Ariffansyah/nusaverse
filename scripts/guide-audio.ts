// pnpm guide: bacakan naskah pemandu tiap provinsi (guideScript) jadi public/audio/pemandu/{slug}.mp3 lewat Gemini TTS.
// Butuh GEMINI_API_KEY di .env.local (https://aistudio.google.com/apikey) dan ffmpeg.
// Naskah yang sudah dibacakan dicatat di data/pemandu.json: provinsi yang naskahnya tidak berubah dilewati, jadi aman
// dijalankan ulang, termasuk setelah kuota harian habis di tengah jalan.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { guideScript, provinces } from "../data/cultureData.ts";

// Dibaca langsung dari .env.local: process.loadEnvFile tidak menimpa variabel shell yang sudah ada walau isinya kosong.
const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
const key = process.env.GEMINI_API_KEY || local.GEMINI_API_KEY;
if (!key) throw new Error("Isi GEMINI_API_KEY di .env.local dulu (buat di https://aistudio.google.com/apikey)");

const MODEL = "gemini-3.8-flash-tts";
const VOICE = "Sulafat"; // suara hangat; pilihan lain ada di dokumentasi Gemini TTS
const STYLE = "pemandu museum yang ramah dan tenang, bahasa Indonesia baku yang jelas, tempo sedang";
const DIR = "public/audio/pemandu";
const MANIFEST = "data/pemandu.json";

type Step = { type: string; content?: { type: string; data?: string }[] };

async function speak(text: string) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": key!, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        input: [{ type: "user_input", content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style: STYLE }] }] }],
        response_format: { type: "audio" },
        generation_config: { speech_config: [{ voice: VOICE }] },
      }),
    });
    if (res.status === 429 && attempt < 5) {
      const error = await res.text();
      // kuota harian (free tier: 10 narasi per hari) tidak pulih dengan menunggu: berhenti, lanjutkan besok
      if (/per day/i.test(error)) throw new Error(`kuota harian Gemini habis, jalankan pnpm guide lagi besok. ${error}`);
      const wait = Number(error.match(/"retryDelay":\s*"(\d+)/)?.[1] ?? 30 * attempt);
      console.warn(`kena batas laju, coba lagi ${wait} detik`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const body: { steps?: Step[] } = await res.json();
    const audio = body.steps
      ?.filter((s) => s.type === "model_output")
      .flatMap((s) => s.content ?? [])
      .filter((c) => c.type === "audio")
      .at(-1)?.data;
    if (!audio) throw new Error(`Gemini tidak mengembalikan audio: ${JSON.stringify(body).slice(0, 300)}`);
    return Buffer.from(audio, "base64");
  }
}

// Gemini mengirim WAV 24 kHz mono (atau PCM mentah tanpa header): jadikan MP3 suara mono yang ringan.
function toMp3(audio: Buffer, out: string) {
  const tmp = mkdtempSync(join(tmpdir(), "nusaverse-"));
  try {
    const wav = audio.subarray(0, 4).toString() === "RIFF";
    const input = join(tmp, wav ? "in.wav" : "in.pcm");
    writeFileSync(input, audio);
    const format = wav ? [] : ["-f", "s16le", "-ar", "24000", "-ac", "1"];
    execFileSync("ffmpeg", ["-v", "error", "-y", ...format, "-i", input, "-af", "loudnorm=I=-18:TP=-1.5", "-ac", "1", "-ar", "24000", "-b:a", "48k", out]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

mkdirSync(DIR, { recursive: true });
const done: Record<string, string> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
for (const p of provinces) {
  const text = guideScript(p);
  const out = join(DIR, `${p.slug}.mp3`);
  if (done[p.slug] === text && existsSync(out)) continue;
  console.log(`pemandu ${p.slug} (${text.length} karakter)`);
  toMp3(await speak(text), out);
  done[p.slug] = text;
  writeFileSync(MANIFEST, JSON.stringify(done, null, 2) + "\n");
}
console.log("selesai");
