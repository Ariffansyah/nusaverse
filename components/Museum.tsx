"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Center, ContactShadows, Environment, useGLTF, useProgress, useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BackSide,
  Box3,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Ray,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector3,
  type BufferGeometry,
  type Mesh,
  type PerspectiveCamera,
} from "three";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { ComicPass } from "@/components/ComicPass";
import { furniture, polyhaven } from "@/data/assets";
import { kinds, type Exhibit, type Island } from "@/data/cultureData";
import { finishMission, markSeen, useMissions, useSeen } from "@/lib/passport";
import { shuffle } from "@/lib/shuffle";

// Aula galeri: lorong berkubah tong (barrel vault) dengan rusuk di tiap petak, berujung apsis setengah lingkaran
// beratap setengah kubah tempat koleksi utama berdiri.
const W = 16; // lebar aula (m)
const R = W / 2; // jari-jari apsis
const HW = 5.6; // tinggi dinding; di atasnya lengkung kubah
const RISE = 2.6; // tinggi lengkung kubah di atas dinding (penampang setengah elips)
const BAY = 6; // jarak antar-koleksi di sepanjang dinding
const EYE = 1.6;
const SPEED = 3.2; // m/detik, Shift = lari
const LOOK = 0.0022; // radian per piksel gerakan mouse saat kursor terkunci
const PITCH = 1.2; // batas mendongak/menunduk
const REACH = 12; // jarak maksimum koleksi bisa dibidik (titik pandang tur pusat 8,5 m)
const MOVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"]);

type View = { x: number; z: number; yaw: number; pitch: number }; // pitch: tur menunduk/mendongak ke tengah koleksi
// base: tinggi alas; y: titik tengah koleksi, sasaran lampu sorot; lamp: lampu sorot `from` meter di depan koleksi, menempel di kubah setinggi `top`
// grand: model bangunan di lorong, tampil besar di atas panggung lebar
type Spot = {
  exhibit: Exhibit;
  index: number;
  x: number;
  z: number;
  y: number;
  base: number;
  rotY: number;
  radius: number;
  grand: boolean;
  lamp: { from: number; top: number };
  view: View;
};
type Blocker = { x: number; z: number; r: number }; // alas, bangku, dan pot yang tidak bisa ditembus pemain
// Objek 3D tiap koleksi (indeks = spot.index) untuk bidikan, dan koleksi di bawah mouse saat kursor tidak terkunci.
type Pick = { targets: (Object3D | null)[]; hover: number | null };
type Input = {
  keys: Set<string>;
  x: number;
  z: number;
  yaw: number;
  pitch: number;
  drag: { x: number; y: number } | null;
  tour: View | null;
  zoom: boolean;
  bob: number; // fase ayunan kepala saat berjalan
  bobAmp: number;
};

const clampPitch = (p: number) => Math.max(-PITCH, Math.min(PITCH, p));
// Gerak hiasan (spanduk berayun, alas berputar) dimatikan kalau pengguna meminta gerak minimal.
const CALM = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Tinggi permukaan dalam kubah di posisi x, untuk menempelkan lampu dan tali spanduk.
const vaultY = (x: number) => HW + RISE * Math.sqrt(Math.max(0, 1 - (x / R) ** 2));
// Warna karpet lorong dan lis dinding, khas tiap pulau.
const accents: Record<Island, string> = {
  Sumatra: "#9a2418",
  Jawa: "#26405e",
  "Bali & Nusa Tenggara": "#a8561b",
  Kalimantan: "#1d5a45",
  Sulawesi: "#6d2f5f",
  Maluku: "#7c4a1e",
  Papua: "#3d4a1c",
};
const aimRay = new Ray();
const aimBox = new Box3();
const aimHit = new Vector3();

// Chrome mengembalikan Promise (bisa ditolak tanpa gestur pengguna), Firefox tidak: gagal = pemain klik lagi.
const lockPointer = (el: HTMLElement) => void Promise.resolve(el.requestPointerLock()).catch(() => {});

// Koleksi pertama di tengah apsis, sisanya berselang kiri-kanan di sepanjang dinding lorong (foto digantung, model di atas alas).
function layout(exhibits: Exhibit[]) {
  const [center, ...rest] = exhibits;
  const bays = Math.ceil(rest.length / 2);
  const length = 16 + bays * BAY;
  const spots: Spot[] = rest.map((exhibit, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = length / 2 - 5 - Math.floor(i / 2) * BAY;
    const isImage = exhibit.source.type === "commons";
    const grand = !isImage && exhibit.kind === "bangunan";
    const base = isImage ? 0 : grand ? 0.3 : exhibit.height > 1.2 ? 0.15 : 1;
    const yaw = side === -1 ? Math.PI / 2 : -Math.PI / 2; // menghadap ke dinding
    const x = side * (W / 2 - (isImage ? 0.02 : grand ? 2.6 : 2.2));
    const y = isImage ? 1.75 : base + exhibit.height / 2;
    const vx = side * (W / 2 - (isImage ? 3.8 : grand ? 7.4 : 5.2)); // panggung dilihat dari seberang karpet supaya muat di layar
    const from = grand ? 3 : 2.2; // lampu di depan koleksi, ke arah tengah lorong
    return {
      exhibit,
      index: i + 1,
      x,
      z,
      y,
      base,
      rotY: yaw,
      radius: isImage ? 0 : grand ? 2.4 : 0.9,
      grand,
      lamp: { from, top: vaultY(x - side * from) - 0.15 },
      view: { x: vx, z, yaw, pitch: Math.atan2(y - EYE, Math.abs(x - vx)) },
    };
  });
  const cz = -length / 2 + 6.5; // pusat apsis
  const cy = 0.4 + center.height / 2;
  spots.unshift({
    exhibit: center,
    index: 0,
    x: 0,
    z: cz,
    y: cy,
    base: 0.4,
    rotY: 0,
    radius: 3.6,
    grand: false,
    lamp: { from: 5.5, top: vaultY(0) - 0.15 },
    view: { x: 0, z: cz + 8.5, yaw: 0, pitch: Math.atan2(cy - EYE, 8.5) },
  });
  // Rusuk kubah tepat di antara pasangan koleksi; bangku di tengah lorong pada rusuk berselang; pot mengapit pintu dan mulut apsis.
  const ribs = Array.from({ length: bays + 1 }, (_, k) => length / 2 - 2 - k * BAY);
  const benches = ribs.slice(1, -1).filter((_, k) => k % 2 === 0);
  const plants = [length / 2 - 1.2, cz + 1.2].flatMap((z) => [-1, 1].map((side) => ({ x: side * (R - 1.1), z })));
  const blockers: Blocker[] = [
    ...spots.filter((s) => s.radius).map((s) => ({ x: s.x, z: s.z, r: s.radius })),
    ...benches.map((z) => ({ x: 0, z, r: 1 })),
    ...plants.map((p) => ({ ...p, r: 0.55 })),
  ];
  return { spots, length, cz, ribs, benches, plants, blockers };
}

// Petunjuk misi: keterangan koleksi dengan kata-kata dari judulnya disamarkan.
const clueOf = (e: Exhibit) =>
  (e.title.match(/[\p{L}']{4,}/gu) ?? []).reduce((text, word) => text.replace(new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, "giu"), "▢▢▢"), e.description);
// Bantuan: huruf pertama tiap kata judul, sisanya garis.
const initialsOf = (title: string) => title.replace(/(\p{L})(\p{L}*)/gu, (_, first: string, rest: string) => first + "_".repeat(rest.length));
// Lebih dari seperempat kata tersamar = petunjuk tak terpecahkan; koleksi itu tidak dijadikan sasaran.
const clueReadable = (e: Exhibit) => {
  const clue = clueOf(e);
  return (clue.match(/▢▢▢/g)?.length ?? 0) * 4 <= clue.split(" ").length;
};

// Misi kurator: tiga koleksi yang dicari dari petunjuk, jenisnya berbeda-beda kalau bisa.
// Koleksi pusat tidak ikut: terlalu mudah ditebak.
function pickTargets(spots: Spot[]) {
  const pool = shuffle(spots.slice(1).filter((s) => clueReadable(s.exhibit)));
  const picked: Spot[] = [];
  for (const s of pool) if (picked.length < 3 && !picked.some((p) => p.exhibit.kind === s.exhibit.kind)) picked.push(s);
  for (const s of pool) if (picked.length < 3 && !picked.includes(s)) picked.push(s);
  return picked.map((s) => s.index);
}

// Layar museum penuh. `active` false saat panel game terbuka: keyboard berhenti menggerakkan pemain.
// onPause: pemain melepas kursor terkunci (Esc/pindah jendela); game membuka menu jeda.
export default function Museum(props: {
  slug: string;
  name: string;
  island: Island;
  summary: string;
  exhibits: Exhibit[];
  active: boolean;
  onPause: () => void;
}) {
  const { slug, name, summary, exhibits, active } = props;
  const { spots, length, cz, ribs, benches, plants, blockers } = useMemo(() => layout(exhibits), [exhibits]);
  const input = useRef<Input>({ keys: new Set(), x: 0, z: length / 2 - 2.5, yaw: 0, pitch: 0, drag: null, tour: null, zoom: false, bob: 0, bobAmp: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const relock = useRef(false); // kursor terkunci saat jeda: kunci lagi waktu lanjut
  const aimRef = useRef<number | null>(null);
  const pickRef = useRef<Pick>({ targets: [], hover: null });
  const [aim, setAim] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [targets, setTargets] = useState(() => pickTargets(spots));
  const [found, setFound] = useState(0); // jumlah sasaran misi yang sudah ditemukan, berurutan
  const [hint, setHint] = useState(false);
  const [missionOpen, setMissionOpen] = useState(true); // kartu misi bisa dilipat supaya tidak menutupi pandangan
  const seenIds = useSeen();
  const missionDone = useMissions()?.includes(slug);
  const seen = spots.filter((s) => seenIds?.includes(s.exhibit.id)).length;
  const target = found < targets.length ? spots[targets[found]] : null;
  const { active: loading, progress } = useProgress();

  // Satu pintu untuk membuka keterangan koleksi: dari tur, klik, atau bidikan crosshair.
  // browsing: dibuka lewat tombol tur ◀ ▶, tidak dihitung sebagai menemukan sasaran misi.
  const select = (i: number | null, browsing = false) => {
    setSelected(i);
    if (i === null) return;
    markSeen(spots[i].exhibit.id);
    if (browsing || i !== target?.index) return;
    setFound(found + 1);
    setHint(false);
    if (found + 1 === targets.length) finishMission(slug);
  };
  const newMission = () => {
    setTargets(pickTargets(spots));
    setFound(0);
    setHint(false);
  };
  const inspect = useEffectEvent(() => select(aimRef.current));
  const pause = useEffectEvent(() => props.onPause());

  useEffect(() => {
    activeRef.current = active;
    const root = rootRef.current;
    if (!active) {
      input.current.keys.clear();
      if (document.pointerLockElement) {
        relock.current = true;
        document.exitPointerLock();
      }
    } else if (relock.current && root) {
      relock.current = false;
      lockPointer(root); // berhasil kalau panel ditutup dengan klik (gestur pengguna)
    }
  }, [active]);

  // Keyboard di window: game layar penuh, tidak perlu fokus ke canvas dulu.
  useEffect(() => {
    const keys = input.current.keys;
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!activeRef.current) return;
      if (key === "e" && !e.repeat) return inspect();
      if (key === "h") return setHint(true);
      if (!MOVE_KEYS.has(key)) return;
      e.preventDefault();
      keys.add(key);
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const clear = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  // Mode first-person: klik mengunci kursor, gerakan mouse langsung memutar kepala.
  useEffect(() => {
    const root = rootRef.current!;
    const s = input.current;
    const look = (e: MouseEvent) => {
      if (document.pointerLockElement !== root) return;
      const k = LOOK * (s.zoom ? 0.5 : 1);
      s.yaw -= e.movementX * k;
      s.pitch = clampPitch(s.pitch - e.movementY * k);
      s.tour = null;
    };
    const change = () => {
      const on = document.pointerLockElement === root;
      setLocked(on);
      if (on) return;
      s.zoom = false;
      // Esc bawaan browser melepas kunci tanpa event keydown: anggap pemain minta jeda.
      if (activeRef.current) {
        relock.current = true;
        pause();
      }
    };
    document.addEventListener("mousemove", look);
    document.addEventListener("pointerlockchange", change);
    return () => {
      document.removeEventListener("mousemove", look);
      document.removeEventListener("pointerlockchange", change);
      if (document.pointerLockElement === root) document.exitPointerLock();
    };
  }, []);

  const visit = (i: number, browsing = false) => {
    select(i, browsing);
    input.current.tour = spots[i].view;
  };
  const step = (dir: number) => visit(((selected ?? (dir > 0 ? -1 : 0)) + dir + spots.length) % spots.length, true);
  const shown = selected === null ? null : spots[selected].exhibit;
  const allSeen = seen === spots.length;
  // sasaran yang baru saja ditemukan: kartunya diberi cap "ketemu"
  const justFound = selected !== null && found > 0 && targets[found - 1] === selected;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={`Ruang pamer 3D ${name}. Klik untuk mengunci kursor dan melihat sekeliling dengan mouse. W A S D atau panah untuk berjalan, Shift untuk berlari, E untuk melihat keterangan koleksi di tengah layar, H untuk petunjuk misi kurator.`}
      className="relative size-full touch-none overflow-hidden bg-malam select-none"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => {
        if (e.button === 2) input.current.zoom = true; // tahan klik kanan untuk memperbesar
        else if (e.button === 0 && document.pointerLockElement === e.currentTarget) select(aimRef.current);
      }}
      onMouseUp={(e) => e.button === 2 && (input.current.zoom = false)}
      onPointerDown={(e) => {
        const root = e.currentTarget;
        if (document.pointerLockElement === root || (e.target as HTMLElement).tagName !== "CANVAS") return;
        if (e.pointerType === "mouse") {
          if (e.button === 0) lockPointer(root);
          return;
        }
        // layar sentuh: seret untuk menoleh
        root.setPointerCapture(e.pointerId);
        input.current.drag = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const s = input.current;
        if (!s.drag) return;
        s.yaw += (e.clientX - s.drag.x) * 0.004;
        s.pitch = clampPitch(s.pitch + (e.clientY - s.drag.y) * 0.004);
        s.drag = { x: e.clientX, y: e.clientY };
        s.tour = null;
      }}
      onPointerUp={() => (input.current.drag = null)}
    >
      <Canvas dpr={[1, 1.75]} gl={{ antialias: false }} camera={{ fov: 60, near: 0.1, far: 120, position: [0, EYE, length / 2 - 2.5] }}>
        <Suspense fallback={null}>
          <Hall name={name} length={length} cz={cz} ribs={ribs} accent={accents[props.island]} />
          <Environment files={`/hdr/${polyhaven.hdri}.hdr`} environmentIntensity={0.7} />
        </Suspense>
        <hemisphereLight args={["#ffffff", "#9a8774", 1.2]} />
        <Safe>
          <Suspense fallback={null}>
            {benches.map((z, k) => (
              <group key={z} position-z={z}>
                <Model id={furniture.bench} height={0.8} maxWidth={2} extraTurn={k % 2 ? -90 : 90} />
              </group>
            ))}
            {plants.map((p) => (
              <group key={`${p.x},${p.z}`} position={[p.x, 0, p.z]}>
                <Model id={furniture.plant} height={1.4} maxWidth={1} />
              </group>
            ))}
          </Suspense>
        </Safe>
        {spots.map((s) => (
          <Suspense key={s.exhibit.id} fallback={null}>
            <ExhibitView spot={s} onSelect={visit} pickRef={pickRef} />
          </Suspense>
        ))}
        <Walker
          inputRef={input}
          length={length}
          cz={cz}
          blockers={blockers}
          pickRef={pickRef}
          onAim={(i) => {
            aimRef.current = i;
            setAim(i);
          }}
        />
        <ComicPass />
      </Canvas>

      {locked && (
        <div
          aria-hidden
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-2 border-malam/60 bg-kertas transition-[width,height] duration-150 ${aim === null ? "size-2" : "size-3.5"}`}
        />
      )}
      {active && !loading && aim !== null && (
        <p key={`bidik-${aim}`} className="balon balon-pop pointer-events-none absolute top-1/2 left-1/2 mt-8 hidden -translate-x-1/2 bg-kertas px-3 py-1.5 text-sm font-bold whitespace-nowrap text-sogan pointer-fine:block">
          <kbd className="rounded border-2 border-sogan px-1.5 font-sans text-xs">E</kbd>
          {locked && " / klik"} · {spots[aim].exhibit.title}
        </p>
      )}
      {active && !loading && !locked && (
        <p className="komik ajak pointer-events-none absolute bottom-20 left-1/2 hidden -translate-x-1/2 rounded-sm bg-kunyit px-4 py-2 font-bold text-sogan pointer-fine:block">
          Klik untuk melihat sekeliling
        </p>
      )}

      {/* Satu slot kartu di kiri atas: keterangan koleksi yang dipilih, atau misi kurator kalau tidak ada yang dipilih. */}
      {shown ? (
        <section
          key={`kartu-${selected}`}
          aria-live="polite"
          className="komik kartu-masuk absolute inset-x-3 top-24 max-h-[40%] overflow-y-auto rounded-md bg-kertas p-4 text-sogan sm:inset-x-auto sm:left-3 sm:max-h-[50%] sm:w-96"
        >
          {justFound && (
            <p className="mb-3 flex items-center gap-3 rounded-sm bg-kunyit px-3 py-2 text-sm font-bold">
              <span className="cap cap-baru size-11 shrink-0 bg-kertas text-lg">✓</span>
              {found === targets.length ? `Misi selesai! Bintang kurator ${name} masuk paspor.` : `Ketemu! Sasaran misi ${found}/${targets.length}.`}
            </p>
          )}
          <p className="text-xs font-bold text-bata">{kinds[shown.kind]}</p>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl">{shown.title}</h2>
            <button type="button" onClick={() => setSelected(null)} className="tekan -mt-1 rounded-md bg-kertas px-3 py-1.5 text-sm font-bold hover:bg-kunyit" aria-label="Tutup keterangan">
              Tutup
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed">{shown.description}</p>
          <p className="mt-2 text-xs text-sogan-2">
            {shown.source.type === "sketchfab" ? "Model" : "Foto"}:{" "}
            <a href={shown.credit.url} target="_blank" rel="noreferrer" className="underline hover:text-bata">
              {shown.credit.author}
            </a>
            , {shown.credit.license}
          </p>
        </section>
      ) : (
        active &&
        !loading && (
          <section
            aria-label="Misi kurator"
            className={`komik kartu-masuk absolute top-24 left-3 rounded-md bg-kertas text-sogan ${missionOpen ? "right-3 p-4 sm:right-auto sm:w-96" : "w-60 px-4 py-2.5"}`}
          >
            <button
              type="button"
              aria-expanded={missionOpen}
              onClick={() => setMissionOpen(!missionOpen)}
              className="flex w-full items-center justify-between gap-3 text-left text-xs font-bold"
            >
              <span className="text-bata">Misi kurator</span>
              <span>
                {found}/{targets.length} ditemukan{missionDone && " · ★"} {missionOpen ? "▴" : "▾"}
              </span>
            </button>
            {!missionOpen ? null : target ? (
              <>
                <h2 className="mt-1 font-display text-xl">Temukan: {kinds[target.exhibit.kind]}</h2>
                <p className="mt-1 text-sm leading-relaxed">{clueOf(target.exhibit)}</p>
                {hint ? (
                  <p className="mt-2 font-mono text-sm font-bold tracking-wider">{initialsOf(target.exhibit.title)}</p>
                ) : (
                  <button type="button" onClick={() => setHint(true)} className="mt-2 text-sm font-bold underline hover:text-bata">
                    Minta petunjuk <kbd className="font-sans text-xs">(H)</kbd>
                  </button>
                )}
                <p className="mt-2 text-xs text-sogan-2">Bidik koleksinya lalu tekan E, atau ketuk koleksinya.</p>
              </>
            ) : (
              <>
                <h2 className="mt-1 font-display text-xl">Semua sasaran ditemukan!</h2>
                <p className="mt-1 text-sm">Bintang kurator {name} sudah tercatat di paspor. Jawab kuisnya untuk mendapat cap.</p>
                <button type="button" onClick={newMission} className="tekan mt-3 rounded-md bg-kertas px-3 py-2 text-sm font-bold hover:bg-kunyit">
                  Misi baru
                </button>
              </>
            )}
          </section>
        )
      )}

      {/* Navigasi koleksi ala game: sebelumnya / berikutnya, kamera berjalan sendiri ke koleksi itu */}
      <nav aria-label="Tur koleksi" className="komik absolute bottom-3 left-3 flex max-w-[calc(100%-12rem)] items-center gap-1 rounded-md bg-kertas p-1 text-sogan sm:max-w-md">
        <button type="button" onClick={() => step(-1)} aria-label="Koleksi sebelumnya" className="size-11 shrink-0 rounded-sm hover:bg-kunyit">
          ◀
        </button>
        <p className="min-w-0 flex-1 truncate px-1 text-sm font-bold" aria-live="polite">
          {shown
            ? `${selected! + 1}/${spots.length} · ${shown.title}`
            : allSeen
              ? "Semua koleksi sudah dilihat. Saatnya kuis!"
              : `${seen}/${spots.length} koleksi dilihat`}
        </p>
        <button type="button" onClick={() => step(1)} aria-label="Koleksi berikutnya" className="size-11 shrink-0 rounded-sm hover:bg-kunyit">
          ▶
        </button>
      </nav>

      <p className="pointer-events-none absolute right-3 bottom-3 hidden max-w-xs rounded-md bg-malam/80 px-3 py-2 text-xs leading-relaxed text-kertas pointer-fine:block">
        W A S D jalan · Shift lari · E lihat koleksi · H petunjuk misi · tahan klik kanan untuk zoom · I info · K kuis · Esc menu
      </p>

      <div className="absolute right-3 bottom-3 hidden grid-cols-3 gap-1.5 pointer-coarse:grid" aria-label="Kontrol berjalan">
        <span />
        <MoveButton inputRef={input} moveKey="w" label="Maju">
          ▲
        </MoveButton>
        <span />
        <MoveButton inputRef={input} moveKey="arrowleft" label="Menoleh ke kiri">
          ↺
        </MoveButton>
        <MoveButton inputRef={input} moveKey="s" label="Mundur">
          ▼
        </MoveButton>
        <MoveButton inputRef={input} moveKey="arrowright" label="Menoleh ke kanan">
          ↻
        </MoveButton>
      </div>

      {loading && (
        <div role="status" className="halftone absolute inset-0 grid place-items-center bg-malam px-6 text-center text-kertas">
          <div className="max-w-md">
            <p className="text-sm font-bold text-kertas/80">Memasuki ruang pamer</p>
            <p className="judul-komik judul-masuk mt-1 font-display text-6xl">{name}</p>
            <div className="mt-6 h-4 overflow-hidden rounded-sm border-2 border-kertas">
              <div className="h-full bg-bata transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-kertas/70">Memuat koleksi… {Math.round(progress)}%</p>
            <p className="mt-6 leading-relaxed text-kertas/85">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Tombol tahan-untuk-bergerak (layar sentuh); menulis ke set tombol yang sama dengan keyboard.
function MoveButton({ inputRef, moveKey, label, children }: { inputRef: React.RefObject<Input>; moveKey: string; label: string; children: ReactNode }) {
  const release = () => inputRef.current.keys.delete(moveKey);
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={() => inputRef.current.keys.add(moveKey)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className="size-12 rounded-md border-2 border-sogan bg-kertas text-lg text-sogan active:bg-kunyit"
    >
      {children}
    </button>
  );
}

function Walker(props: {
  inputRef: React.RefObject<Input>;
  length: number;
  cz: number;
  blockers: Blocker[];
  pickRef: React.RefObject<Pick>;
  onAim: (i: number | null) => void;
}) {
  const { inputRef, length, cz, blockers, pickRef } = props;
  const aimed = useRef<number | null>(null);
  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const s = inputRef.current;
    const dt = Math.min(delta, 0.1);
    const k = s.keys;
    const fwd = +(k.has("w") || k.has("arrowup")) - +(k.has("s") || k.has("arrowdown"));
    const strafe = +k.has("d") - +k.has("a");
    const turn = +k.has("arrowleft") - +k.has("arrowright");
    const speed = SPEED * (k.has("shift") ? 1.8 : 1);
    if (fwd || strafe || turn) s.tour = null;
    s.yaw += turn * 1.8 * dt;

    if (s.tour) {
      const t = 1 - Math.exp(-dt * 3);
      s.x += (s.tour.x - s.x) * t;
      s.z += (s.tour.z - s.z) * t;
      s.yaw += Math.atan2(Math.sin(s.tour.yaw - s.yaw), Math.cos(s.tour.yaw - s.yaw)) * t;
      s.pitch += (s.tour.pitch - s.pitch) * t;
      if (Math.hypot(s.tour.x - s.x, s.tour.z - s.z) < 0.02) s.tour = null;
    } else {
      const sin = Math.sin(s.yaw);
      const cos = Math.cos(s.yaw);
      s.x += (-sin * fwd + cos * strafe) * speed * dt;
      s.z += (-cos * fwd - sin * strafe) * speed * dt;
    }

    // ayunan kepala saat berjalan, mereda saat berhenti; dimatikan kalau pengguna meminta gerak minimal
    const walking = !s.tour && (fwd !== 0 || strafe !== 0) && !CALM;
    s.bobAmp += (+walking - s.bobAmp) * Math.min(1, dt * 8);
    if (walking) s.bob += dt * speed * 2.6;

    const fov = s.zoom ? 30 : 60;
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov += (fov - camera.fov) * Math.min(1, dt * 12);
      camera.updateProjectionMatrix();
    }

    // ponytail: tabrakan lingkaran per benda + batas dinding lorong dan lingkar apsis; pakai physics kalau ruangan bercabang
    s.x = Math.max(-W / 2 + 0.5, Math.min(W / 2 - 0.5, s.x));
    s.z = Math.min(length / 2 - 0.5, s.z);
    const apse = Math.hypot(s.x, s.z - cz);
    if (s.z < cz && apse > R - 0.5) {
      s.x *= (R - 0.5) / apse;
      s.z = cz + ((s.z - cz) * (R - 0.5)) / apse;
    }
    for (const b of blockers) {
      const dx = s.x - b.x;
      const dz = s.z - b.z;
      const d = Math.hypot(dx, dz);
      const min = b.r + 0.4;
      if (d < min && d > 0) {
        s.x = b.x + (dx / d) * min;
        s.z = b.z + (dz / d) * min;
      }
    }
    camera.position.set(s.x, EYE + Math.sin(s.bob) * 0.035 * s.bobAmp, s.z);
    camera.rotation.set(s.pitch, s.yaw, 0, "YXZ");

    // Koleksi yang dibidik. Kursor bebas: benda di bawah mouse. Selain itu: garis pandang (crosshair) ke kotak pembatas
    // tiap koleksi (dilonggarkan 20 cm untuk benda kecil), yang terdekat menang. Atap rumah adat atau ujung keris tetap kena.
    const pick = pickRef.current;
    let hit = document.pointerLockElement ? null : pick.hover;
    if (hit === null) {
      aimRay.set(camera.position, camera.getWorldDirection(aimHit));
      let best = REACH;
      pick.targets.forEach((g, i) => {
        if (!g || !aimRay.intersectBox(aimBox.setFromObject(g).expandByScalar(0.2), aimHit)) return;
        const d = aimHit.distanceTo(camera.position);
        if (d < best) {
          best = d;
          hit = i;
        }
      });
    }
    if (hit !== aimed.current) {
      aimed.current = hit;
      props.onAim(hit);
    }
  });
  return null;
}

// UV diskalakan: tekstur berulang tiap `tile` meter tanpa meng-clone tekstur per permukaan.
function tiled<T extends BufferGeometry>(g: T, w: number, h: number, tile = 3) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / tile, (uv.getY(i) * h) / tile);
  return g;
}

// Penampang lengkung kubah: setengah elips selebar aula. Dengan `thick` jadi pita lengkung (rusuk).
function arcShape(thick?: number) {
  const s = new Shape();
  s.absellipse(0, 0, R, RISE, 0, Math.PI, false);
  if (thick) s.absellipse(0, 0, R - thick, RISE - thick, Math.PI, 0, true);
  return s;
}

const WOOD = "#3f2614";
const INK = "#17120e";
const SKY = "#fff6e0"; // cahaya jendela kubah

function Hall({ name, length, cz, ribs, accent }: { name: string; length: number; cz: number; ribs: number[]; accent: string }) {
  const t = polyhaven;
  // hanya warna dasar: normal/roughness map membuat kilap dan bintik yang jadi belang setelah filter komik
  const [floor, wall] = useTexture(
    [`/textures/${t.floor}_diff.jpg`, `/textures/${t.wall}_diff.jpg`],
    (loaded) => loaded.forEach((tex) => (tex.wrapS = tex.wrapT = RepeatWrapping)),
  );
  const front = length / 2;
  const nave = front - cz; // lorong: dari dinding pintu sampai mulut apsis
  const mid = (front + cz) / 2;
  const carpet = { from: front - 1, to: cz + 4.45 }; // berhenti di cincin lantai sekeliling alas koleksi utama

  const geo = useMemo(() => {
    const rib = (thick: number, depth: number) =>
      new ExtrudeGeometry(arcShape(thick), { depth, bevelEnabled: false, curveSegments: 48 }).translate(0, 0, -depth / 2);
    // Jendela bundar di lereng setengah kubah apsis, menghadap ke dalam mengikuti normal permukaan elipsoid.
    const a = 0.8; // sudut dari puncak kubah
    const out = new Vector3(0, Math.cos(a) / RISE, -Math.sin(a) / R).normalize();
    return {
      floor: tiled(new PlaneGeometry(W, nave), W, nave),
      side: tiled(new PlaneGeometry(nave, HW), nave, HW),
      front: tiled(new PlaneGeometry(W, HW), W, HW),
      gable: tiled(new ShapeGeometry(arcShape(), 32), 1, 1), // UV bentuk = koordinat meter
      vault: tiled(new CylinderGeometry(1, 1, nave, 48, 1, true, Math.PI / 2, Math.PI), 18, nave).rotateX(Math.PI / 2).scale(R, RISE, 1),
      apseFloor: tiled(new CircleGeometry(R, 64, 0, Math.PI), 2 * R, 2 * R).rotateX(-Math.PI / 2),
      apseWall: tiled(new CylinderGeometry(R, R, HW, 64, 1, true, Math.PI / 2, Math.PI), Math.PI * R, HW),
      dome: tiled(new SphereGeometry(1, 48, 16, Math.PI, Math.PI, 0, Math.PI / 2), Math.PI * R, 9).scale(R, RISE, R),
      dado: new CylinderGeometry(R - 0.02, R - 0.02, 0.7, 64, 1, true, Math.PI / 2, Math.PI),
      rib: rib(0.35, 0.3),
      arch: rib(0.55, 0.6),
      oculus: {
        position: new Vector3(0, HW + RISE * Math.cos(a), -R * Math.sin(a)).addScaledVector(out, -0.04),
        quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), out.clone().negate()),
      },
    };
  }, [nave]);

  const plaster = <meshStandardMaterial map={wall} />;
  const plasterInside = <meshStandardMaterial map={wall} side={BackSide} />;
  const wood = <meshStandardMaterial color={WOOD} />;

  return (
    <group>
      {/* lantai, karpet lorong berwarna khas pulau, dan cincin di sekeliling alas koleksi utama */}
      <mesh rotation-x={-Math.PI / 2} position-z={mid} geometry={geo.floor}>
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <mesh position-z={cz} geometry={geo.apseFloor}>
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.008, (carpet.from + carpet.to) / 2]}>
        <planeGeometry args={[2.7, carpet.from - carpet.to]} />
        <meshStandardMaterial color="#ffc928" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, (carpet.from + carpet.to) / 2]}>
        <planeGeometry args={[2.4, carpet.from - carpet.to - 0.3]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.008, cz]}>
        <ringGeometry args={[4.1, 4.45, 64]} />
        <meshStandardMaterial color={INK} />
      </mesh>

      {/* dinding lorong dengan lis bawah berwarna khas pulau dan kornis kayu di kaki kubah */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * R, HW / 2, mid]} rotation-y={(-side * Math.PI) / 2} geometry={geo.side}>
            {plaster}
          </mesh>
          <mesh position={[side * (R - 0.02), 0.35, mid]}>
            <boxGeometry args={[0.04, 0.7, nave]} />
            <meshStandardMaterial color={accent} />
          </mesh>
          <mesh position={[side * (R - 0.05), 0.72, mid]}>
            <boxGeometry args={[0.1, 0.06, nave]} />
            <meshStandardMaterial color={INK} />
          </mesh>
          <mesh position={[side * (R - 0.15), HW - 0.12, mid]}>
            <boxGeometry args={[0.3, 0.24, nave]} />
            {wood}
          </mesh>
        </group>
      ))}

      {/* dinding pintu: bidang lengkung di atasnya menutup ujung kubah */}
      <mesh position={[0, HW / 2, front]} rotation-y={Math.PI} geometry={geo.front}>
        {plaster}
      </mesh>
      <mesh position={[0, HW, front]} rotation-y={Math.PI} geometry={geo.gable}>
        {plaster}
      </mesh>
      <mesh position={[0, 0.35, front - 0.02]}>
        <boxGeometry args={[W, 0.7, 0.04]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0, 1.6, front - 0.05]} rotation-y={Math.PI}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 1.75, front - 0.1]}>
          <boxGeometry args={[0.3, 3.5, 0.2]} />
          {wood}
        </mesh>
      ))}
      <mesh position={[0, 3.35, front - 0.1]}>
        <boxGeometry args={[3, 0.3, 0.2]} />
        {wood}
      </mesh>

      {/* kubah tong lorong, jendela atap memanjang di punggungnya, rusuk dan pilaster di antara pasangan koleksi */}
      <mesh position={[0, HW, mid]} geometry={geo.vault}>
        {plasterInside}
      </mesh>
      <mesh position={[0, HW + RISE - 0.04, mid]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[1.8, nave - 0.6]} />
        <meshBasicMaterial color={SKY} toneMapped={false} />
      </mesh>
      {ribs.map((z) => (
        <group key={z} position-z={z}>
          <mesh position-y={HW} geometry={geo.rib}>
            {wood}
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (R - 0.15), HW / 2, 0]}>
              <boxGeometry args={[0.3, HW, 0.3]} />
              {wood}
            </mesh>
          ))}
        </group>
      ))}

      {/* apsis: dinding melingkar, setengah kubah dengan jendela bundar, dan lengkung besar di mulutnya */}
      <group position-z={cz}>
        <mesh position-y={HW / 2} geometry={geo.apseWall}>
          {plasterInside}
        </mesh>
        <mesh position-y={0.35} geometry={geo.dado}>
          <meshStandardMaterial color={accent} side={BackSide} />
        </mesh>
        <mesh position-y={0.72} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[R - 0.05, 0.04, 6, 64, Math.PI]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position-y={HW - 0.12} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[R - 0.12, 0.13, 8, 64, Math.PI]} />
          {wood}
        </mesh>
        <mesh position-y={HW} geometry={geo.dome}>
          {plasterInside}
        </mesh>
        <mesh position={geo.oculus.position} quaternion={geo.oculus.quaternion}>
          <circleGeometry args={[1.3, 40]} />
          <meshBasicMaterial color={SKY} toneMapped={false} />
        </mesh>
        <mesh position={geo.oculus.position} quaternion={geo.oculus.quaternion}>
          <torusGeometry args={[1.3, 0.09, 8, 40]} />
          {wood}
        </mesh>
        <mesh position-y={HW} geometry={geo.arch}>
          {wood}
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (R - 0.225), HW / 2, 0]}>
            <boxGeometry args={[0.45, HW, 0.6]} />
            {wood}
          </mesh>
        ))}
      </group>
      <Banner title={`Ruang Pamer ${name}`} z={cz + 0.7} />
    </group>
  );
}

// Spanduk judul ruangan tergantung dari kubah di depan lengkung apsis, berayun pelan.
function Banner({ title, z }: { title: string; z: number }) {
  const ref = useRef<Group>(null);
  const top = vaultY(2.8) - 0.02;
  const bottom = 5.95; // bawah spanduk tetap di atas koleksi utama tertinggi
  useFrame(({ clock }) => {
    if (ref.current && !CALM) ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.7) * 0.04;
  });
  return (
    <group ref={ref} position={[0, top, z]}>
      {[-2.8, 2.8].map((x) => (
        <mesh key={x} position={[x, (bottom - top) / 2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, top - bottom, 6]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      ))}
      <mesh position={[0, bottom - 0.55 - top, -0.03]}>
        <boxGeometry args={[6.5, 1.2, 0.04]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <Plaque title={title} position={[0, bottom - 0.55 - top, 0]} width={6.4} height={1.1} titleOnly />
    </group>
  );
}

function ExhibitView({ spot, onSelect, pickRef }: { spot: Spot; onSelect: (i: number) => void; pickRef: React.RefObject<Pick> }) {
  const { exhibit } = spot;
  const isCenter = spot.index === 0;
  const isImage = exhibit.source.type === "commons";
  const big = exhibit.height > 1.2;
  const { base, grand } = spot;
  const stage = isCenter || grand; // dibidik dari modelnya saja, alas lebarnya bisa dimasuki pemain di sudutnya

  const target = (g: Group | null) => {
    pickRef.current.targets[spot.index] = g;
  };
  const events = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta < 6) onSelect(spot.index);
    },
    onPointerOver: () => {
      document.body.style.cursor = "pointer";
      pickRef.current.hover = spot.index;
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
      pickRef.current.hover = null;
    },
  };

  return (
    <group position={[spot.x, 0, spot.z]} rotation-y={spot.rotY}>
      <SpotLamp y={spot.y} {...spot.lamp} />
      {isImage ? (
        <Safe>
          <Suspense fallback={null}>
            <Photo exhibit={exhibit} events={events} target={target} />
          </Suspense>
        </Safe>
      ) : (
        <>
          <group {...events} ref={stage ? undefined : target}>
            {isCenter ? (
              <mesh position-y={0.2}>
                <cylinderGeometry args={[3.6, 3.7, 0.4, 64]} />
                <meshStandardMaterial color="#3f2614" roughness={0.6} />
              </mesh>
            ) : grand ? (
              <mesh position-y={0.15}>
                <boxGeometry args={[4.6, 0.3, 3.4]} />
                <meshStandardMaterial color="#3f2614" roughness={0.6} />
              </mesh>
            ) : big ? (
              <mesh position-y={0.075}>
                <boxGeometry args={[1.6, 0.15, 1.6]} />
                <meshStandardMaterial color="#3f2614" />
              </mesh>
            ) : (
              <Safe fallback={<BlockPedestal />}>
                <Suspense fallback={<BlockPedestal />}>
                  <Pedestal />
                </Suspense>
              </Safe>
            )}
            <group position-y={base} ref={stage ? target : undefined}>
              <Safe fallback={<Missing />}>
                <Suspense fallback={null}>
                  <Turntable on={!stage && !big}>
                    <Model
                      id={exhibit.id}
                      height={exhibit.height}
                      maxWidth={isCenter ? 6.6 : grand ? 4.2 : big ? 1.5 : 0.8}
                      maxDepth={grand ? 3 : undefined}
                      extraTurn={exhibit.turn}
                    />
                  </Turntable>
                  {stage && <ContactShadows scale={isCenter ? 8 : 5} blur={2.5} opacity={0.45} frames={1} position-y={0.01} />}
                </Suspense>
              </Safe>
            </group>
          </group>
          {isCenter ? (
            // podium keterangan di depan-kanan alas, menyerong ke arah pengunjung, tidak menghalangi pandangan
            <group position={[4.4, 0, 3.4]} rotation-y={-0.6}>
              <mesh position={[0, 0.42, 0.12]}>
                <boxGeometry args={[0.08, 0.84, 0.08]} />
                <meshStandardMaterial color="#3f2614" />
              </mesh>
              <Plaque title={exhibit.title} body={exhibit.description} position={[0, 1.0, 0]} rotationX={-0.5} width={1.6} height={0.8} />
            </group>
          ) : (
            // di dinding belakang, di samping alas atau panggung
            <Plaque title={exhibit.title} body={exhibit.description} position={[grand ? 3 : 1.5, 1.5, Math.abs(spot.x) - W / 2 + 0.03]} width={1.2} height={0.6} />
          )}
        </>
      )}
    </group>
  );
}

// maxWidth: batas lebar yang menghadap pengunjung; maxDepth: batas kedalaman ke arah pengunjung (bawaan = maxWidth).
function Model(props: { id: string; height: number; maxWidth: number; maxDepth?: number; extraTurn?: number }) {
  const { id, height, maxWidth, maxDepth = maxWidth, extraTurn = 0 } = props;
  const { scene } = useGLTF(`/models/${id}.glb`);
  const { model, scale, turn } = useMemo(() => {
    // Salinan per tampilan: scene dari cache useGLTF tetap bersih, jadi ukuran tidak dihitung dari model
    // yang sudah diskalakan saat ruang yang sama dibuka lagi. SkeletonUtils: model ber-rig (gajah) ikut tulangnya sendiri.
    const model = cloneSkinned(scene);
    const size = new Box3().setFromObject(model).getSize(new Vector3());
    // benda panjang (badik, kujang, jembatan) diputar supaya sisi panjangnya menghadap pengunjung
    const turn = (size.z > size.x * 1.3 ? Math.PI / 2 : 0) + (extraTurn * Math.PI) / 180;
    const c = Math.abs(Math.cos(turn));
    const s = Math.abs(Math.sin(turn));
    const width = c * size.x + s * size.z;
    const depth = s * size.x + c * size.z;
    return { model, turn, scale: Math.min(height / size.y, maxWidth / width, maxDepth / depth) };
  }, [scene, height, maxWidth, maxDepth, extraTurn]);
  return (
    <Center top>
      <primitive object={model} scale={scale} rotation-y={turn} />
    </Center>
  );
}

// Ambil mesh alas yang berada di tengah pack (|z| kecil), lengkap dengan transform dunianya.
function middlePedestal(scene: Object3D) {
  scene.updateMatrixWorld(true);
  const group = new Group();
  scene.traverse((o) => {
    if (!(o as Mesh).isMesh || Math.abs(new Box3().setFromObject(o).getCenter(new Vector3()).z) > 0.9) return;
    const m = (o as Mesh).clone();
    o.matrixWorld.decompose(m.position, m.quaternion, m.scale);
    group.add(m);
  });
  return group;
}

function Pedestal() {
  const { scene } = useGLTF("/models/pedestal.glb");
  const piece = useMemo(() => middlePedestal(scene), [scene]);
  const scale = useMemo(() => {
    const size = new Box3().setFromObject(piece).getSize(new Vector3());
    return 1 / size.y;
  }, [piece]);
  return (
    <Center top>
      <primitive object={piece} scale={scale} />
    </Center>
  );
}

const BlockPedestal = () => (
  <mesh position-y={0.5}>
    <boxGeometry args={[0.9, 1, 0.9]} />
    <meshStandardMaterial color="#3f2614" />
  </mesh>
);

// File model belum diunduh (pnpm assets) atau gagal dimuat.
const Missing = () => (
  <mesh position-y={0.25}>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshStandardMaterial color="#a23b26" wireframe />
  </mesh>
);

function Photo({ exhibit, events, target }: { exhibit: Exhibit; events: object; target: (g: Group | null) => void }) {
  const tex = useTexture(`/images/${exhibit.id}.jpg`);
  const img = tex.image as HTMLImageElement;
  const h = exhibit.height;
  const w = (h * img.width) / img.height;
  return (
    <group position={[0, 1.75, 0]} ref={target} {...events}>
      <mesh position-z={0.03}>
        <boxGeometry args={[w + 0.14, h + 0.14, 0.05]} />
        <meshStandardMaterial color="#2b1d14" />
      </mesh>
      <mesh position-z={0.06}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <Plaque title={exhibit.title} body={exhibit.description} position={[w / 2 + 0.8, -0.45, 0.04]} width={1.2} height={0.6} />
    </group>
  );
}

// Benda kecil di atas alas berputar pelan seperti di vitrin, supaya semua sisinya terlihat.
function Turntable({ on, children }: { on: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (on && !CALM && ref.current) ref.current.rotation.y += dt * 0.35;
  });
  return <group ref={ref}>{children}</group>;
}

// Lampu sorot menempel di kubah (`top`), `from` meter di depan koleksi, mengarah ke tengah koleksi.
function SpotLamp({ y, from, top }: { y: number; from: number; top: number }) {
  const target = useMemo(() => new Object3D(), []);
  return (
    <>
      <primitive object={target} position={[0, y, 0]} />
      <spotLight position={[0, top - 0.25, from]} target={target} angle={0.55} penumbra={0.7} intensity={45} decay={1.6} distance={14} color="#fff3dc" />
      <mesh position={[0, top, from]}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 20]} />
        <meshBasicMaterial color="#fff1d6" />
      </mesh>
    </>
  );
}

// Papan keterangan digambar ke canvas 2D dengan font halaman (Fraunces + Plus Jakarta Sans).
function Plaque(props: {
  title: string;
  body?: string;
  position: [number, number, number];
  width: number;
  height: number;
  rotationX?: number;
  titleOnly?: boolean;
}) {
  const { title, body = "", width, height, titleOnly } = props;
  const texture = useMemo(() => {
    const px = 512 / height;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * px);
    canvas.height = 512;
    const g = canvas.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const display = css.getPropertyValue("--font-bangers") || "sans-serif";
    const sans = css.getPropertyValue("--font-jakarta") || "sans-serif";
    // judul ruangan: kotak narasi kunyit; keterangan: kertas. Keduanya bergaris tinta seperti panel komik.
    g.fillStyle = titleOnly ? "#ffc928" : "#fff4dc";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.lineWidth = 28;
    g.strokeStyle = "#17120e";
    g.strokeRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#17120e";
    if (titleOnly) {
      g.font = `300px ${display}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(title, canvas.width / 2, 270, canvas.width - 80);
    } else {
      const pad = 44;
      g.font = `86px ${display}`;
      g.fillText(title, pad, 110, canvas.width - pad * 2);
      g.font = `38px ${sans}`;
      wrapText(g, body, pad, 185, canvas.width - pad * 2, 52);
    }
    const tex = new CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, [title, body, width, height, titleOnly]);

  return (
    <mesh position={props.position} rotation-x={props.rotationX ?? 0}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function wrapText(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > maxWidth && line) {
      g.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line = next;
  }
  g.fillText(line, x, y);
}

class Safe extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
