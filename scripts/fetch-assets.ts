// pnpm assets: unduh model (Sketchfab, butuh SKETCHFAB_TOKEN di .env.local), foto (Wikimedia Commons),
// tekstur dan HDRI (Poly Haven). File yang sudah ada dilewati, jadi aman dijalankan ulang.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { furniture, polyhaven, props } from "../data/assets.ts";
import { provinces } from "../data/cultureData.ts";

try {
  process.loadEnvFile(".env.local");
} catch {}
const token = process.env.SKETCHFAB_TOKEN;
const UA = { "User-Agent": "NusaVerse/0.1 (hackathon asset fetch)" };

for (const dir of ["public/models", "public/images", "public/textures", "public/hdr"]) mkdirSync(dir, { recursive: true });

// Sketchfab dan Commons membalas 429 kalau terlalu cepat: tunggu lalu coba lagi.
async function fetchRetry(url: string, init?: RequestInit) {
  let res = await fetch(url, init);
  for (let wait = 10; res.status === 429 && wait <= 80; wait *= 2) {
    console.warn(`dibatasi server, coba lagi ${wait} detik`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    res = await fetch(url, init);
  }
  return res;
}

// File besar dari CDN kadang putus di tengah ("other side closed"): ulangi sampai 3 kali.
async function download(url: string, dest: string, headers: Record<string, string> = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { ...UA, ...headers } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    } catch (e) {
      if (attempt === 3) throw e;
      console.warn(`unduhan gagal, ulang (${attempt}/3)`);
    }
  }
}

async function sketchfabModel(id: string, uid: string, opts: { simplify?: number; join?: boolean } = {}) {
  const out = `public/models/${id}.glb`;
  if (existsSync(out)) return;
  if (!token) return console.warn(`lewati ${id}: SKETCHFAB_TOKEN belum diisi di .env.local`);

  const res = await fetchRetry(`https://api.sketchfab.com/v3/models/${uid}/download`, { headers: { Authorization: `Token ${token}` } });
  if (!res.ok) throw new Error(`Sketchfab ${id} (${uid}): ${res.status} ${await res.text()}`);
  const links: { glb?: { url: string }; gltf: { url: string } } = await res.json();

  const tmp = mkdtempSync(join(tmpdir(), "nusaverse-"));
  try {
    let input = join(tmp, "in.glb");
    if (links.glb) await download(links.glb.url, input);
    else {
      await download(links.gltf.url, join(tmp, "in.zip"));
      execFileSync("unzip", ["-q", join(tmp, "in.zip"), "-d", tmp]);
      input = join(tmp, readdirSync(tmp).find((f) => f.endsWith(".gltf"))!);
    }
    // material spec-gloss lama tidak didukung three.js lagi (tekstur hilang, model jadi putih): ubah ke metal-rough dulu
    const metalRough = join(tmp, "mr.glb");
    execFileSync("pnpm", ["dlx", "@gltf-transform/cli", "metalrough", input, metalRough], { stdio: ["ignore", "ignore", "inherit"] });
    optimize(metalRough, out, opts);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function optimize(input: string, out: string, opts: { simplify?: number; join?: boolean }) {
  const args = ["dlx", "@gltf-transform/cli", "optimize", input, out, "--compress", "meshopt", "--texture-compress", "webp", "--texture-size", "1024"];
  // Batas galat dilonggarkan ke 1% ukuran model: dengan batas bawaan, jahitan UV model fotogrametri/AI menghentikan
  // penyederhanaan jauh sebelum rasionya tercapai (model sejuta segitiga tetap sejuta).
  if (opts.simplify) args.push("--simplify-ratio", String(opts.simplify), "--simplify-error", "0.01");
  if (opts.join === false) args.push("--join", "false", "--flatten", "false", "--palette", "false");
  execFileSync("pnpm", args, { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`model ${basename(out, ".glb")}: ${(statSync(out).size / 1e6).toFixed(1)} MB`);
}

// Model Poly Haven berupa .gltf + .bin + tekstur terpisah: unduh semuanya dengan path aslinya, lalu padatkan jadi .glb.
async function polyhavenModel(slug: string, simplify?: number) {
  const out = `public/models/${slug}.glb`;
  if (existsSync(out)) return;
  const { gltf } = await (await fetch(`https://api.polyhaven.com/files/${slug}`, { headers: UA })).json();
  const main: { url: string; include: Record<string, { url: string }> } = gltf["1k"].gltf;
  const tmp = mkdtempSync(join(tmpdir(), "nusaverse-"));
  try {
    for (const [path, file] of Object.entries(main.include)) {
      mkdirSync(dirname(join(tmp, path)), { recursive: true });
      await download(file.url, join(tmp, path));
    }
    await download(main.url, join(tmp, `${slug}.gltf`));
    optimize(join(tmp, `${slug}.gltf`), out, { simplify });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function commonsImage(id: string, file: string) {
  const out = `public/images/${id}.jpg`;
  if (existsSync(out)) return;
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=1280&titles=${encodeURIComponent(`File:${file}`)}`;
  const data = await (await fetchRetry(api, { headers: UA })).json();
  const info = (Object.values(data.query.pages)[0] as { imageinfo?: { thumburl: string }[] }).imageinfo?.[0];
  if (!info) throw new Error(`Commons: file tidak ditemukan "${file}"`);
  await download(info.thumburl, out);
  console.log(`foto ${id}`);
  await new Promise((r) => setTimeout(r, 1500)); // Commons membatasi laju request
}

async function polyhavenFiles() {
  for (const slug of [polyhaven.floor, polyhaven.wall]) {
    const files = await (await fetch(`https://api.polyhaven.com/files/${slug}`, { headers: UA })).json();
    for (const [map, key] of [["diff", "Diffuse"], ["nor", "nor_gl"], ["rough", "Rough"]]) {
      const out = `public/textures/${slug}_${map}.jpg`;
      if (!existsSync(out)) await download(files[key]["1k"].jpg.url, out);
    }
  }
  const out = `public/hdr/${polyhaven.hdri}.hdr`;
  if (!existsSync(out)) {
    const files = await (await fetch(`https://api.polyhaven.com/files/${polyhaven.hdri}`, { headers: UA })).json();
    await download(files.hdri["1k"].hdr.url, out);
  }
}

await polyhavenFiles();
await polyhavenModel(furniture.bench);
await polyhavenModel(furniture.plant, 0.3);
for (const p of props) await sketchfabModel(p.id, p.source.uid, { join: false });
for (const e of provinces.flatMap((p) => p.exhibits)) {
  if (e.source.type === "sketchfab") await sketchfabModel(e.id, e.source.uid, { simplify: e.source.simplify });
  else await commonsImage(e.id, e.source.file);
}
console.log("selesai");
