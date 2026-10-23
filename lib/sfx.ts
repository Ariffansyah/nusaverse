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

// Rekaman panjang (suara koleksi, narasi pemandu): satu saja yang berbunyi; yang baru menggantikan yang lama.
let recording: Promise<AudioBufferSourceNode | undefined> | undefined;
let recordingUrl: string | null = null;

// only: hentikan hanya kalau rekaman yang sedang berbunyi berasal dari folder itu (mis. kartu koleksi ditutup,
// narasi pemandu jalan terus).
export function stopRecording(only?: string) {
  if (only && !recordingUrl?.startsWith(only)) return;
  void recording?.then((src) => src?.stop());
  recording = undefined;
  if (recordingUrl) {
    recordingUrl = null;
    notify();
  }
}

export function playRecording(url: string) {
  stopRecording();
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
  if (muted) stopRecording();
  notify();
  play("klik"); // umpan balik saat suara dinyalakan lagi (saat dibisukan, play() diam)
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
export const useMuted = () => [useSyncExternalStore(subscribe, () => muted, () => false), toggleMuted] as const;
export const useVolume = () => useSyncExternalStore(subscribe, () => volume, () => 1);
export const useRecording = () => useSyncExternalStore(subscribe, () => recordingUrl, () => null);
