import { useSyncExternalStore } from "react";
import { provinces } from "@/data/cultureData";

// Himpunan id di localStorage, tersinkron antar-komponen dan antar-tab. Id yang tidak dikenal (data lama) dibuang.
function setStore(key: string, valid: ReadonlySet<string>) {
  const listeners = new Set<() => void>();
  let raw: string | null | undefined; // undefined = belum pernah dibaca
  let items: string[] = [];

  function get() {
    let next: string | null = null;
    try {
      next = localStorage.getItem(key);
    } catch {} // ponytail: storage diblokir (mode privat) = kosong, tambah fallback memori kalau perlu
    if (next !== raw) {
      raw = next;
      try {
        const parsed: unknown = JSON.parse(next ?? "[]");
        items = Array.isArray(parsed) ? parsed.filter((s) => valid.has(s)) : [];
      } catch {
        items = [];
      }
    }
    return items;
  }

  function write(next: string[]) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  }

  return {
    get,
    add(ids: string[]) {
      const current = get();
      const merged = [...new Set([...current, ...ids.filter((s) => valid.has(s))])];
      if (merged.length !== current.length) write(merged);
    },
    clear: () => write([]),
    subscribe(listener: () => void) {
      listeners.add(listener);
      window.addEventListener("storage", listener); // sinkron antar-tab
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
      };
    },
  };
}

const slugs = new Set(provinces.map((p) => p.slug));
const stamps = setStore("nusaverse:paspor", slugs); // lulus kuis
const seen = setStore("nusaverse:koleksi", new Set(provinces.flatMap((p) => p.exhibits.map((e) => e.id)))); // keterangan dibuka
const missions = setStore("nusaverse:misi", slugs); // misi kurator selesai

export const addStamp = (slug: string) => stamps.add([slug]);
export const getStamps = stamps.get;
export const clearStamps = stamps.clear; // keluar akun: cap milik akun tidak tertinggal di perangkat
// Gabungkan cap dari akun (server) ke paspor lokal.
export const mergeStamps = stamps.add;
export const markSeen = (id: string) => seen.add([id]);
export const finishMission = (slug: string) => missions.add([slug]);

// Hapus semua progres di perangkat ini; cap di akun tetap ada.
export function clearProgress() {
  stamps.clear();
  seen.clear();
  missions.clear();
}

// null saat render server/hydration: belum terbaca, bukan kosong
const none = () => null;
export const usePassport = () => useSyncExternalStore(stamps.subscribe, stamps.get, none);
export const useSeen = () => useSyncExternalStore(seen.subscribe, seen.get, none);
export const useMissions = () => useSyncExternalStore(missions.subscribe, missions.get, none);
