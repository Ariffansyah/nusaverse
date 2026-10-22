import { useSyncExternalStore } from "react";

// Efek suara game dari paket Kenney (CC0), disimpan di public/audio/sfx/{nama}.mp3.
// Diputar lewat Web Audio: latensi rendah dan bunyi boleh bertumpuk. Browser baru mengizinkan suara setelah pemain
// berinteraksi, jadi konteks audio dibuat di interaksi pertama; sebelum itu play() diam tanpa galat.
const names = ["klik", "sorot", "balik", "buka", "benar", "salah", "cap", "lulus", "langkah0", "langkah1", "langkah2"] as const;
export type Sfx = (typeof names)[number];

let ctx: AudioContext | undefined;
let out: GainNode;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const sfxUrl = (name: Sfx) => `/audio/sfx/${name}.mp3`;

// Diunduh dan didekode sekali per URL.
function load(url: string) {
  let buf = buffers.get(url);
  if (!buf) {
    buf = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx!.decodeAudioData(b))
      .catch(() => null);
    buffers.set(url, buf);
  }
  return buf;
}

// Dimuat saat pointerdown/keydown pertama, sebelum event click-nya, supaya bunyi klik pertama sudah siap.
function start() {
  if (ctx) return;
  ctx = new AudioContext();
  out = ctx.createGain();
  out.connect(ctx.destination);
  applyVolume();
  for (const n of names) void load(sfxUrl(n));
}
if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "keydown"]) window.addEventListener(type, start, { once: true, capture: true });
}

async function playUrl(url: string, delay = 0) {
  if (!ctx || muted) return;
  if (ctx.state !== "running") void ctx.resume();
  const buf = await load(url);
  if (!buf || !ctx || muted) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(out);
  src.start(ctx.currentTime + delay);
  return src;
}

// delay (detik): menyelaraskan bunyi dengan animasi, mis. cap yang baru mendarat.
export const play = (name: Sfx, delay = 0) => void playUrl(sfxUrl(name), delay);

// Nada alat musik yang dimainkan pemain: boleh bertumpuk seperti efek suara.
export const playNote = (url: string) => void playUrl(url);

// Rekaman koleksi (pertunjukan, alat musik): satu saja yang berbunyi, berhenti saat keterangannya ditutup.
let recording: Promise<AudioBufferSourceNode | undefined> | undefined;
let recordingUrl: string | null = null;

export function stopRecording() {
  void recording?.then((src) => src?.stop());
  recording = undefined;
  if (recordingUrl) {
    recordingUrl = null;
    notify();
  }
}

export function playRecording(url: string) {
  stopRecording();
  stopGuide();
  const current = playUrl(url);
  recording = current;
  recordingUrl = url;
  notify();
  void current.then((src) => {
    const done = () => {
      if (recording !== current) return;
      recording = undefined;
      recordingUrl = null;
      notify();
    };
    if (src) src.onended = done;
    else done();
  });
}

// Pemandu suara: naskah dibacakan suara bahasa Indonesia bawaan browser; tanpa suara itu tombolnya disembunyikan.
// Dibacakan per kalimat karena Chrome memutus satu ucapan panjang di tengah jalan.
const indonesianVoice = () =>
  typeof speechSynthesis === "undefined" ? undefined : speechSynthesis.getVoices().find((v) => /^id([-_]|$)/i.test(v.lang));
let guiding = false;
let guideRun = 0; // ucapan dari pembacaan yang sudah dihentikan tidak boleh mengubah status

export function stopGuide() {
  guideRun++;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  if (guiding) {
    guiding = false;
    notify();
  }
}

export function startGuide(text: string) {
  const voice = indonesianVoice();
  if (!voice || muted) return;
  stopRecording();
  stopGuide();
  const run = guideRun;
  const done = () => {
    if (run !== guideRun) return;
    guiding = false;
    notify();
  };
  const sentences = text.split(/(?<=[.!?])\s+/);
  sentences.forEach((sentence, i) => {
    const u = new SpeechSynthesisUtterance(sentence);
    u.voice = voice;
    u.lang = voice.lang;
    u.volume = volume;
    if (i === sentences.length - 1) u.onend = u.onerror = done;
    speechSynthesis.speak(u);
  });
  guiding = true;
  notify();
}

// Pilihan bisu dan volume (0–1) diingat di perangkat ini.
const KEY = "nusaverse:suara";
const VOLUME_KEY = "nusaverse:volume";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
let muted = false;
let volume = 1;
try {
  muted = typeof window !== "undefined" && localStorage.getItem(KEY) === "mati";
  volume = Number(localStorage.getItem(VOLUME_KEY) ?? 1);
  if (!(volume >= 0 && volume <= 1)) volume = 1; // nilai rusak di storage
} catch {}

// Kuadrat: kenyaringan terasa naik merata sepanjang penggeser, bukan melonjak di ujung bawah.
function applyVolume() {
  if (out) out.gain.value = 0.8 * volume ** 2;
}

export function setVolume(v: number) {
  volume = v;
  const unmute = muted && v > 0; // menggeser volume = ingin mendengar lagi
  if (unmute) muted = false;
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
    if (unmute) localStorage.removeItem(KEY);
  } catch {}
  applyVolume();
  notify();
}

function toggleMuted() {
  muted = !muted;
  try {
    if (muted) localStorage.setItem(KEY, "mati");
    else localStorage.removeItem(KEY);
  } catch {}
  if (muted) {
    stopRecording();
    stopGuide();
  }
  notify();
  play("klik"); // umpan balik saat suara dinyalakan lagi (saat dibisukan, play() diam)
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
// Daftar suara browser dimuat belakangan (Chrome): ikuti event voiceschanged.
const subscribeVoices = (l: () => void) => {
  if (typeof speechSynthesis === "undefined") return () => {};
  speechSynthesis.addEventListener("voiceschanged", l);
  return () => speechSynthesis.removeEventListener("voiceschanged", l);
};

export const useMuted = () => [useSyncExternalStore(subscribe, () => muted, () => false), toggleMuted] as const;
export const useVolume = () => useSyncExternalStore(subscribe, () => volume, () => 1);
export const useRecording = () => useSyncExternalStore(subscribe, () => recordingUrl, () => null);
export const useGuiding = () => useSyncExternalStore(subscribe, () => guiding, () => false);
export const useGuideVoice = () => useSyncExternalStore(subscribeVoices, () => !!indonesianVoice(), () => false);
