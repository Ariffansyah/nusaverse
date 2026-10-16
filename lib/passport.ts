import { useSyncExternalStore } from "react";
import { provinces } from "@/data/cultureData";

const KEY = "nusaverse:paspor";
const valid = new Set(provinces.map((p) => p.slug));
const listeners = new Set<() => void>();
let raw: string | null | undefined; // undefined = belum pernah dibaca
let stamps: string[] = [];

function read() {
  let next: string | null = null;
  try {
    next = localStorage.getItem(KEY);
  } catch {} // ponytail: storage diblokir (mode privat) = paspor kosong, tambah fallback memori kalau perlu
  if (next !== raw) {
    raw = next;
    try {
      const parsed: unknown = JSON.parse(next ?? "[]");
      stamps = Array.isArray(parsed) ? parsed.filter((s) => valid.has(s)) : [];
    } catch {
      stamps = [];
    }
  }
  return stamps;
}

function write(next: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // sinkron antar-tab
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function addStamp(slug: string) {
  const current = read();
  if (!current.includes(slug)) write([...current, slug]);
}

export const clearStamps = () => write([]);

export const getStamps = () => read();

// Gabungkan cap dari akun (server) ke paspor lokal.
export function mergeStamps(slugs: string[]) {
  const current = read();
  const merged = [...new Set([...current, ...slugs.filter((s) => valid.has(s))])];
  if (merged.length !== current.length) write(merged);
}

// null saat render server/hydration: paspor belum terbaca, bukan kosong
export const usePassport = () => useSyncExternalStore(subscribe, read, () => null);
