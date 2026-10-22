// pnpm check:data: gagal kalau data budaya tidak cocok dengan peta atau kuisnya rusak.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import indonesia from "@svg-maps/indonesia";
import { exhibitSounds } from "./assets.ts";
import { provinces } from "./cultureData.ts";

const mapIds = new Set(indonesia.locations.map((l: { id: string }) => l.id));
const slugs = new Set<string>();
const exhibitIds = new Set<string>();

for (const p of provinces) {
  // slug masuk ke URL dan selector CSS (MapStamps), jadi wajib aman
  assert.match(p.slug, /^[a-z0-9-]+$/, `${p.slug}: slug hanya boleh a-z, 0-9, -`);
  assert(!slugs.has(p.slug), `${p.slug}: slug duplikat`);
  slugs.add(p.slug);
  assert(mapIds.has(p.mapId), `${p.slug}: mapId ${p.mapId} tidak ada di peta`);
  assert(p.quiz.length > 0, `${p.slug}: kuis kosong`);
  assert(p.exhibits[0]?.source.type === "sketchfab", `${p.slug}: koleksi pertama (pusat ruangan) harus model`);
  for (const e of p.exhibits) {
    // id jadi nama file di public/, harus unik di semua provinsi
    assert.match(e.id, /^[a-z0-9-]+$/, `${e.id}: id koleksi hanya boleh a-z, 0-9, -`);
    assert(!exhibitIds.has(e.id), `${e.id}: id koleksi duplikat`);
    exhibitIds.add(e.id);
    assert(e.height > 0 && e.height < 5, `${e.id}: tinggi tampil harus 0-5 meter`);
  }
  for (const q of p.quiz) {
    assert(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${p.slug}: jawaban di luar pilihan untuk "${q.q}"`);
  }
}

// suara koleksi harus menempel pada koleksi yang ada, dan berkasnya sudah ada di public/
for (const [id, sound] of Object.entries(exhibitSounds)) {
  assert(exhibitIds.has(id), `suara ${id}: tidak ada koleksi dengan id ini`);
  for (const file of "clip" in sound ? [sound.clip] : sound.notes.map((n) => n.file)) {
    assert(existsSync(`public/audio/koleksi/${file}`), `suara ${id}: berkas ${file} tidak ada`);
  }
  if ("notes" in sound) assert(sound.notes.length <= 9, `suara ${id}: maksimal 9 nada (tombol 1-9)`);
}

console.log(`OK: ${provinces.length} provinsi valid, ${Object.keys(exhibitSounds).length} koleksi bersuara`);
