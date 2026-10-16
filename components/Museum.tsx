"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Center, ContactShadows, Environment, useGLTF, useProgress, useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from "react";
import { Box3, CanvasTexture, Group, Object3D, PlaneGeometry, RepeatWrapping, Vector3, type Mesh, type PerspectiveCamera } from "three";
import { ComicPass } from "@/components/ComicPass";
import { polyhaven } from "@/data/assets";
import type { Exhibit } from "@/data/cultureData";

const W = 16; // lebar aula (m)
const H = 7; // tinggi langit-langit; cukup tinggi supaya judul ruangan tidak tertutup atap rumah adat
const BAY = 6; // jarak antar-koleksi di sepanjang dinding
const EYE = 1.6;
const SPEED = 3.2; // m/detik, Shift = lari
const LOOK = 0.0022; // radian per piksel gerakan mouse saat kursor terkunci
const PITCH = 1.2; // batas mendongak/menunduk
const REACH = 12; // jarak maksimum koleksi bisa dibidik (titik pandang tur pusat 8,5 m)
const MOVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"]);

type View = { x: number; z: number; yaw: number };
// base: tinggi alas; y: titik tengah koleksi yang dibidik crosshair; reach: toleransi bidikan (m)
type Spot = { exhibit: Exhibit; index: number; x: number; z: number; y: number; base: number; rotY: number; radius: number; reach: number; view: View };
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

// Chrome mengembalikan Promise (bisa ditolak tanpa gestur pengguna), Firefox tidak: gagal = pemain klik lagi.
const lockPointer = (el: HTMLElement) => void Promise.resolve(el.requestPointerLock()).catch(() => {});

// Koleksi pertama di tengah ujung aula, sisanya berselang kiri-kanan di sepanjang dinding (foto digantung, model di atas alas).
function layout(exhibits: Exhibit[]) {
  const [center, ...rest] = exhibits;
  const length = 16 + Math.ceil(rest.length / 2) * BAY;
  const spots: Spot[] = rest.map((exhibit, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = length / 2 - 5 - Math.floor(i / 2) * BAY;
    const isImage = exhibit.source.type === "commons";
    const base = isImage ? 0 : exhibit.height > 1.2 ? 0.15 : 1;
    const yaw = side === -1 ? Math.PI / 2 : -Math.PI / 2; // menghadap ke dinding
    return {
      exhibit,
      index: i + 1,
      x: side * (isImage ? W / 2 - 0.02 : W / 2 - 2.2),
      z,
      y: isImage ? 1.75 : base + exhibit.height / 2,
      base,
      rotY: yaw,
      radius: isImage ? 0 : 0.9,
      reach: isImage ? 1.1 : 0.9,
      view: { x: side * (isImage ? W / 2 - 3.8 : W / 2 - 5.2), z, yaw },
    };
  });
  const cz = -length / 2 + 6.5;
  spots.unshift({
    exhibit: center,
    index: 0,
    x: 0,
    z: cz,
    y: 0.4 + center.height / 2,
    base: 0.4,
    rotY: 0,
    radius: 3.6,
    reach: 3.2,
    view: { x: 0, z: cz + 8.5, yaw: 0 },
  });
  return { spots, length };
}

// Layar museum penuh. `active` false saat panel game terbuka: keyboard berhenti menggerakkan pemain.
// onPause: pemain melepas kursor terkunci (Esc/pindah jendela); game membuka menu jeda.
export default function Museum(props: { name: string; summary: string; exhibits: Exhibit[]; active: boolean; onPause: () => void }) {
  const { name, summary, exhibits, active } = props;
  const { spots, length } = useMemo(() => layout(exhibits), [exhibits]);
  const input = useRef<Input>({ keys: new Set(), x: 0, z: length / 2 - 2.5, yaw: 0, pitch: 0, drag: null, tour: null, zoom: false, bob: 0, bobAmp: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const relock = useRef(false); // kursor terkunci saat jeda: kunci lagi waktu lanjut
  const aimRef = useRef<number | null>(null);
  const [aim, setAim] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<number>>(new Set());
  const { active: loading, progress } = useProgress();

  // Satu pintu untuk membuka keterangan koleksi: dari tur, klik, atau bidikan crosshair.
  const select = (i: number | null) => {
    setSelected(i);
    if (i !== null) setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
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

  const visit = (i: number) => {
    select(i);
    input.current.tour = spots[i].view;
  };
  const step = (dir: number) => visit(((selected ?? (dir > 0 ? -1 : 0)) + dir + spots.length) % spots.length);
  const shown = selected === null ? null : spots[selected].exhibit;
  const allSeen = seen.size === spots.length;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={`Ruang pamer 3D ${name}. Klik untuk mengunci kursor dan melihat sekeliling dengan mouse. W A S D atau panah untuk berjalan, Shift untuk berlari, E untuk melihat keterangan koleksi di tengah layar.`}
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
          <Hall name={name} length={length} />
          <Environment files={`/hdr/${polyhaven.hdri}.hdr`} environmentIntensity={0.7} />
        </Suspense>
        <hemisphereLight args={["#ffffff", "#9a8774", 1.2]} />
        {spots.map((s) => (
          <Suspense key={s.exhibit.id} fallback={null}>
            <ExhibitView spot={s} onSelect={visit} />
          </Suspense>
        ))}
        <Walker
          inputRef={input}
          length={length}
          spots={spots}
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
        <p className="balon pointer-events-none absolute top-1/2 left-1/2 mt-8 hidden -translate-x-1/2 bg-kertas px-3 py-1.5 text-sm font-bold whitespace-nowrap text-sogan pointer-fine:block">
          <kbd className="rounded border-2 border-sogan px-1.5 font-sans text-xs">E</kbd>
          {locked && " / klik"} · {spots[aim].exhibit.title}
        </p>
      )}
      {active && !loading && !locked && (
        <p className="komik pointer-events-none absolute bottom-20 left-1/2 hidden -translate-x-1/2 rounded-sm bg-kunyit px-4 py-2 font-bold text-sogan pointer-fine:block">
          Klik untuk melihat sekeliling
        </p>
      )}

      {shown && (
        <section
          aria-live="polite"
          className="komik absolute inset-x-3 top-24 max-h-[40%] overflow-y-auto rounded-md bg-kertas p-4 text-sogan sm:inset-x-auto sm:left-3 sm:max-h-[50%] sm:w-96"
        >
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
              : `${seen.size}/${spots.length} koleksi dilihat`}
        </p>
        <button type="button" onClick={() => step(1)} aria-label="Koleksi berikutnya" className="size-11 shrink-0 rounded-sm hover:bg-kunyit">
          ▶
        </button>
      </nav>

      <p className="pointer-events-none absolute right-3 bottom-3 hidden max-w-xs rounded-md bg-malam/80 px-3 py-2 text-xs leading-relaxed text-kertas pointer-fine:block">
        W A S D jalan · Shift lari · E lihat koleksi · tahan klik kanan untuk zoom · I info · K kuis · Esc menu
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
            <p className="judul-komik mt-1 font-display text-6xl">{name}</p>
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

function Walker(props: { inputRef: React.RefObject<Input>; length: number; spots: Spot[]; onAim: (i: number | null) => void }) {
  const { inputRef, length, spots } = props;
  const aimed = useRef<number | null>(null);
  const calm = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
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
      s.pitch -= s.pitch * t;
      if (Math.hypot(s.tour.x - s.x, s.tour.z - s.z) < 0.02) s.tour = null;
    } else {
      const sin = Math.sin(s.yaw);
      const cos = Math.cos(s.yaw);
      s.x += (-sin * fwd + cos * strafe) * speed * dt;
      s.z += (-cos * fwd - sin * strafe) * speed * dt;
    }

    // ayunan kepala saat berjalan, mereda saat berhenti; dimatikan kalau pengguna meminta gerak minimal
    const walking = !s.tour && (fwd !== 0 || strafe !== 0) && !calm;
    s.bobAmp += (+walking - s.bobAmp) * Math.min(1, dt * 8);
    if (walking) s.bob += dt * speed * 2.6;

    const fov = s.zoom ? 30 : 60;
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov += (fov - camera.fov) * Math.min(1, dt * 12);
      camera.updateProjectionMatrix();
    }

    // ponytail: tabrakan lingkaran per alas + batas dinding; cukup untuk aula kotak, pakai physics kalau ruangan bercabang
    s.x = Math.max(-W / 2 + 0.5, Math.min(W / 2 - 0.5, s.x));
    s.z = Math.max(-length / 2 + 0.5, Math.min(length / 2 - 0.5, s.z));
    for (const sp of spots) {
      const dx = s.x - sp.x;
      const dz = s.z - sp.z;
      const d = Math.hypot(dx, dz);
      const min = sp.radius + 0.4;
      if (sp.radius && d < min && d > 0) {
        s.x = sp.x + (dx / d) * min;
        s.z = sp.z + (dz / d) * min;
      }
    }
    camera.position.set(s.x, EYE + Math.sin(s.bob) * 0.035 * s.bobAmp, s.z);
    camera.rotation.set(s.pitch, s.yaw, 0, "YXZ");

    // Koleksi yang dibidik crosshair: jarak tegak lurus terkecil dari garis pandang ke titik tengah koleksi.
    const cp = Math.cos(s.pitch);
    const fx = -Math.sin(s.yaw) * cp;
    const fy = Math.sin(s.pitch);
    const fz = -Math.cos(s.yaw) * cp;
    let hit: number | null = null;
    let best = Infinity;
    for (const sp of spots) {
      const dx = sp.x - s.x;
      const dy = sp.y - EYE;
      const dz = sp.z - s.z;
      const along = dx * fx + dy * fy + dz * fz;
      if (along <= 0 || along > REACH) continue;
      const off = Math.hypot(dx - fx * along, dy - fy * along, dz - fz * along);
      if (off < sp.reach && off < best) {
        best = off;
        hit = sp.index;
      }
    }
    if (hit !== aimed.current) {
      aimed.current = hit;
      props.onAim(hit);
    }
  });
  return null;
}

// Plane dengan UV diskalakan: tekstur berulang tiap `tile` meter tanpa meng-clone tekstur per dinding.
function tiledPlane(w: number, h: number, tile = 3) {
  const g = new PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / tile, (uv.getY(i) * h) / tile);
  return g;
}

function Hall({ name, length }: { name: string; length: number }) {
  const t = polyhaven;
  // hanya warna dasar: normal/roughness map membuat kilap dan bintik yang jadi belang setelah filter komik
  const [floor, wall] = useTexture(
    [`/textures/${t.floor}_diff.jpg`, `/textures/${t.wall}_diff.jpg`],
    (loaded) => loaded.forEach((tex) => (tex.wrapS = tex.wrapT = RepeatWrapping)),
  );
  const geo = useMemo(() => ({ floor: tiledPlane(W, length), side: tiledPlane(length, H), end: tiledPlane(W, H) }), [length]);

  const walls = [
    { pos: [-W / 2, H / 2, 0], rot: Math.PI / 2, width: length, geo: geo.side },
    { pos: [W / 2, H / 2, 0], rot: -Math.PI / 2, width: length, geo: geo.side },
    { pos: [0, H / 2, -length / 2], rot: 0, width: W, geo: geo.end },
    { pos: [0, H / 2, length / 2], rot: Math.PI, width: W, geo: geo.end },
  ] as const;

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} geometry={geo.floor}>
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      {walls.map((w, i) => (
        <mesh key={i} position={w.pos} rotation-y={w.rot} geometry={w.geo}>
          <meshStandardMaterial map={wall} color="#ffffff" />
        </mesh>
      ))}
      <mesh position-y={H} rotation-x={Math.PI / 2}>
        <planeGeometry args={[W, length]} />
        <meshStandardMaterial color="#4a3426" />
      </mesh>
      {/* list kayu di kaki dinding */}
      {walls.map((w, i) => (
        <mesh key={`list-${i}`} position={[w.pos[0], 0.1, w.pos[2]]} rotation-y={w.rot}>
          <boxGeometry args={[w.width, 0.2, 0.06]} />
          <meshStandardMaterial color="#17120e" />
        </mesh>
      ))}
      <Plaque title={`Ruang Pamer ${name}`} position={[0, 6.1, -length / 2 + 0.03]} width={7} height={1.1} titleOnly />
    </group>
  );
}

function ExhibitView({ spot, onSelect }: { spot: Spot; onSelect: (i: number) => void }) {
  const { exhibit } = spot;
  const isCenter = spot.index === 0;
  const isImage = exhibit.source.type === "commons";
  const big = exhibit.height > 1.2;
  const { base } = spot;

  const events = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta < 6) onSelect(spot.index);
    },
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = ""),
  };

  return (
    <group position={[spot.x, 0, spot.z]} rotation-y={spot.rotY}>
      <SpotLamp y={spot.y} from={isCenter ? 5.5 : 2.2} />
      {isImage ? (
        <Safe>
          <Suspense fallback={null}>
            <Photo exhibit={exhibit} events={events} />
          </Suspense>
        </Safe>
      ) : (
        <>
          <group {...events}>
            {isCenter ? (
              <mesh position-y={0.2}>
                <cylinderGeometry args={[3.6, 3.7, 0.4, 64]} />
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
            <group position-y={base}>
              <Safe fallback={<Missing />}>
                <Suspense fallback={null}>
                  <Model id={exhibit.id} height={exhibit.height} maxWidth={isCenter ? 6.6 : big ? 1.5 : 0.8} extraTurn={exhibit.turn} />
                  {isCenter && <ContactShadows scale={8} blur={2.5} opacity={0.45} frames={1} position-y={0.01} />}
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
            <Plaque title={exhibit.title} body={exhibit.description} position={[1.5, 1.5, -2.17]} width={1.2} height={0.6} />
          )}
        </>
      )}
    </group>
  );
}

function Model({ id, height, maxWidth, extraTurn = 0 }: { id: string; height: number; maxWidth: number; extraTurn?: number }) {
  const { scene } = useGLTF(`/models/${id}.glb`);
  const { model, scale, turn } = useMemo(() => {
    // Salinan per tampilan: scene dari cache useGLTF tetap bersih, jadi ukuran tidak dihitung dari model
    // yang sudah diskalakan saat ruang yang sama dibuka lagi.
    const model = scene.clone();
    const size = new Box3().setFromObject(model).getSize(new Vector3());
    // benda panjang (badik, kujang) diputar supaya sisi panjangnya menghadap pengunjung
    return { model, scale: Math.min(height / size.y, maxWidth / Math.max(size.x, size.z)), turn: size.z > size.x * 1.3 ? Math.PI / 2 : 0 };
  }, [scene, height, maxWidth]);
  return (
    <Center top>
      <primitive object={model} scale={scale} rotation-y={turn + (extraTurn * Math.PI) / 180} />
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

function Photo({ exhibit, events }: { exhibit: Exhibit; events: object }) {
  const tex = useTexture(`/images/${exhibit.id}.jpg`);
  const img = tex.image as HTMLImageElement;
  const h = exhibit.height;
  const w = (h * img.width) / img.height;
  return (
    <group position={[0, 1.75, 0]} {...events}>
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

// Lampu sorot di langit-langit, `from` meter di depan koleksi, mengarah ke tengah koleksi.
function SpotLamp({ y, from }: { y: number; from: number }) {
  const target = useMemo(() => new Object3D(), []);
  return (
    <>
      <primitive object={target} position={[0, y, 0]} />
      <spotLight position={[0, H - 0.3, from]} target={target} angle={0.55} penumbra={0.7} intensity={45} decay={1.6} distance={14} color="#fff3dc" />
      <mesh position={[0, H - 0.05, from]}>
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
