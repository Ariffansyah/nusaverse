"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { MainMenu } from "@/components/MainMenu";
import { MuseumLoader } from "@/components/MuseumLoader";
import { VolumeControl } from "@/components/Volume";
import { MapStamps, PassportBook, StampCount } from "@/components/Passport";
import { GuessGame, Quiz } from "@/components/Quiz";
import { findProvince, islands, provinces, type Province } from "@/data/cultureData";
import { useMissions, usePassport, useSeen } from "@/lib/passport";
import { play, playRecording, stopRecording, useRecording } from "@/lib/sfx";

type Screen = "menu" | "map" | "museum";
type PanelId = "jeda" | "pindah" | "info" | "kuis" | "tebak" | "cerita" | "paspor" | "peringkat" | "akun" | "kredit";
type OpenPanel = (id: PanelId) => void;

const panelTitle: Record<PanelId, string> = {
  jeda: "Jeda",
  pindah: "Pindah ruang pamer",
  info: "Tentang provinsi",
  kuis: "Kuis",
  tebak: "Tebak asal",
  cerita: "Cerita warga",
  paspor: "Paspor budaya",
  peringkat: "Peringkat penjelajah",
  akun: "Akun",
  kredit: "Kredit aset",
};

// Pintasan keyboard di ruang pamer; berguna saat kursor terkunci dan tombol HUD tidak bisa diklik.
const museumKeys: Record<string, PanelId> = { escape: "jeda", m: "jeda", t: "pindah", i: "info", k: "kuis", p: "paspor" };

// Tombol HUD: kertas bergaris tinta, terbaca di atas adegan 3D. Tombol utama: merah dengan bayangan kunyit, satu-satunya aksi besar per layar.
const hudButton = "tekan flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-kertas px-3 py-2 text-sm font-bold text-sogan hover:bg-kunyit";
const bigButton = "tekan rounded-md bg-bata px-5 py-3 font-display text-2xl text-white [--bayang:var(--kunyit)] hover:bg-sogan";
const kbd = "rounded border-2 border-current px-1.5 font-sans text-xs font-bold";

// Panah atas/bawah memindah fokus antar tombol menu, seperti menu game.
function arrowNav(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
}

// Status layar penuh dibaca dari browser, jadi tetap benar saat pemain keluar lewat Esc/F11.
const onFullscreenChange = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
};
function useFullscreen() {
  const on = useSyncExternalStore(onFullscreenChange, () => !!document.fullscreenElement, () => false);
  // iPhone Safari tidak mendukung layar penuh untuk halaman: tombolnya disembunyikan
  const supported = useSyncExternalStore(onFullscreenChange, () => document.fullscreenEnabled, () => false);
  const toggle = () => {
    if (on) return void document.exitFullscreen().catch(() => {});
    // Chrome/Edge: kunci Esc supaya Esc membuka menu jeda (tahan Esc untuk keluar layar penuh), seperti game browser lain
    const keyboard = (navigator as Navigator & { keyboard?: { lock?: (keys: string[]) => Promise<void> } }).keyboard;
    document.documentElement
      .requestFullscreen()
      .then(() => keyboard?.lock?.(["Escape"]))
      .catch(() => {});
  };
  return { on, supported, toggle };
}

export function Game(slots: { map: ReactNode; account: ReactNode; leaderboard: ReactNode; credits: ReactNode; stories: Record<string, ReactNode>; sync: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("menu");
  const [slug, setSlug] = useState(provinces[0].slug);
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [sweep, setSweep] = useState(0); // naik tiap pindah layar: memutar ulang sapuan tinta
  const fullscreen = useFullscreen();
  const hovered = useRef<Element | null>(null); // tombol menu yang sedang disorot: bunyi sorot sekali per masuk
  const province = findProvince(slug)!;
  // Pemandu suara: narasi provinsi yang sudah direkam (pnpm guide), diputar seperti rekaman koleksi.
  const guideUrl = `/audio/pemandu/${slug}.mp3`;
  const guiding = useRecording() === guideUrl;
  const toggleGuide = () => (guiding ? stopRecording() : playRecording(guideUrl));
  const onGuideKey = useEffectEvent(toggleGuide);

  // Pemandu berhenti saat pemain keluar dari ruang pamer atau pindah provinsi.
  useEffect(() => () => stopRecording("/audio/pemandu/"), [screen, slug]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      // Esc selalu menutup panel (dari menu jeda = lanjut main). Ditangani sendiri, bukan oleh <dialog>: Chrome mengabaikan
      // Esc bawaan pada dialog yang dibuka tanpa gestur pengguna, padahal menu jeda dibuka oleh lepasnya kunci kursor.
      if (panel) {
        if (key === "escape") {
          e.preventDefault();
          setPanel(null);
        } else if (panel === "jeda" && museumKeys[key]) setPanel(museumKeys[key]); // pintasan yang tertera di menu jeda
        return;
      }
      if (screen === "museum" && key === "g") return onGuideKey();
      const hotkey = museumKeys[key];
      if (screen === "museum" && hotkey) {
        e.preventDefault(); // tanpa ini, aksi bawaan Esc yang sama langsung menutup dialog yang baru dibuka
        setPanel(hotkey);
      }
      if (screen === "map" && key === "escape") setScreen("menu");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, panel]);

  // Browser tanpa Keyboard Lock memakai Esc untuk keluar layar penuh tanpa memberi tahu halaman: anggap itu jeda.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && screen === "museum") setPanel((open) => open ?? "jeda");
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [screen]);

  // Panel komik ditempel: bunyi kertas. Di sini, bukan di efek Panel, supaya tidak berbunyi dua kali di Strict Mode.
  useEffect(() => {
    if (panel) play("buka");
  }, [panel]);

  // Kode museum (three.js) diunduh sambil pemain memilih ruang.
  useEffect(() => {
    if (screen === "map") void import("@/components/Museum");
  }, [screen]);

  const go = (next: Screen) => {
    play("balik"); // bunyi halaman dibalik, bersama sapuan tinta
    setPanel(null);
    setScreen(next);
    setSweep((n) => n + 1);
  };

  return (
    // Bunyi antarmuka dipasang sekali di sini, bukan di tiap tombol: klik untuk semua tombol/pilihan/provinsi di peta,
    // sorot untuk butir menu (disorot penunjuk atau dipindah dengan keyboard).
    <main
      className="game fixed inset-0 overflow-hidden bg-malam text-kertas"
      onClickCapture={(e) => {
        if ((e.target as Element).closest("button:not([data-nada]), input, [data-slug]")) play("klik");
      }}
      onPointerOver={(e) => {
        const item = (e.target as Element).closest("nav button");
        if (item && item !== hovered.current) play("sorot");
        hovered.current = item;
      }}
      onFocus={(e) => {
        if (e.target.matches("nav button:focus-visible")) play("sorot");
      }}
    >
      {slots.sync}

      {screen === "menu" && (
        <MainMenu
          onStart={(picked) => {
            if (picked) setSlug(picked);
            go("map");
          }}
          onPanel={setPanel}
          arrowNav={arrowNav}
          bigButton={bigButton}
        />
      )}

      {screen === "map" && (
        <MapScreen map={slots.map} slug={slug} onPick={setSlug} onEnter={() => go("museum")} onBack={() => go("menu")} onPanel={setPanel} />
      )}

      {screen === "museum" && (
        <>
          <MuseumLoader
            key={slug}
            slug={slug}
            name={province.name}
            island={province.island}
            summary={province.summary}
            exhibits={province.exhibits}
            active={panel === null}
            onPause={() => setPanel((open) => open ?? "jeda")}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
            {/* kotak narasi kuning ala komik; diklik untuk pindah ruang */}
            <button
              type="button"
              onClick={() => setPanel("pindah")}
              aria-label={`Ruang pamer ${province.name}. Pindah ruang`}
              className="komik turun pointer-events-auto rounded-sm bg-kunyit px-3 py-1.5 text-left text-sogan hover:bg-kertas"
            >
              <span className="block text-xs font-bold">Ruang pamer · ganti ▾</span>
              <span className="block font-display text-2xl leading-tight">{province.name}</span>
            </button>
            <div className="pointer-events-auto flex gap-1.5">
              <button type="button" onClick={toggleGuide} aria-pressed={guiding} className={hudButton}>
                {guiding ? "■ Hentikan" : "▶ Pemandu"}
              </button>
              <button type="button" onClick={() => setPanel("info")} className={hudButton}>
                Info
              </button>
              <button type="button" onClick={() => setPanel("kuis")} className={hudButton}>
                Kuis
              </button>
              <button type="button" onClick={() => setPanel("jeda")} className={hudButton}>
                Menu
              </button>
            </div>
          </div>
        </>
      )}

      {sweep > 0 && (
        <div key={sweep} aria-hidden className="sapuan">
          <span />
        </div>
      )}

      {panel && (
        <Panel key={panel} title={panel === "kuis" ? `Kuis ${province.name}` : panelTitle[panel]} onClose={() => setPanel(null)}>
          {panel === "jeda" && (
            <PauseMenu
              province={province}
              fullscreen={fullscreen}
              onResume={() => setPanel(null)}
              onPanel={setPanel}
              onMap={() => go("map")}
              onHome={() => go("menu")}
            />
          )}
          {panel === "pindah" && (
            <>
              <p className="mb-4 text-sogan-2">Pilih provinsi untuk langsung masuk ke ruang pamernya.</p>
              <ProvinceList
                slug={slug}
                className="grid gap-4 sm:grid-cols-2"
                onPick={(s) => {
                  if (s === slug) return setPanel(null);
                  setSlug(s);
                  go("museum");
                }}
              />
            </>
          )}
          {panel === "info" && <ProvinceInfo province={province} />}
          {panel === "kuis" && <Quiz slug={province.slug} name={province.name} questions={province.quiz} />}
          {panel === "tebak" && (
            <GuessGame
              onVisit={(s) => {
                setSlug(s);
                go("map");
              }}
            />
          )}
          {panel === "cerita" && slots.stories[slug]}
          {panel === "paspor" && (
            <PassportBook
              onVisit={(s) => {
                setSlug(s);
                go("map");
              }}
            />
          )}
          {panel === "peringkat" && slots.leaderboard}
          {panel === "akun" && slots.account}
          {panel === "kredit" && slots.credits}
        </Panel>
      )}
    </main>
  );
}

// Provinsi terpilih timbul dari papan seperti halaman buku pop-up: LAPIS salinan bentuknya ditumpuk dengan translateZ,
// lapisan teratas kertas. Bentuk dan letaknya dibaca dari peta SVG (dirender server) yang sudah ada di DOM.
const LAPIS = 10;
type Shape = { slug: string; d: string; viewBox: string; place: CSSProperties; pin: CSSProperties; board: CSSProperties };

function readShape(board: HTMLElement, slug: string): Shape | null {
  const path = board.querySelector<SVGPathElement>(`[data-slug="${slug}"] path`);
  const vb = path?.ownerSVGElement?.viewBox.baseVal;
  if (!path || !vb) return null;
  const b = path.getBBox();
  const pad = 2; // ruang untuk garis tepi
  const x = (v: number) => ((v - vb.x) / vb.width) * 100;
  const y = (v: number) => ((v - vb.y) / vb.height) * 100;
  const cx = x(b.x + b.width / 2);
  const cy = y(b.y + b.height / 2);
  return {
    slug,
    d: path.getAttribute("d") ?? "",
    viewBox: `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`,
    place: { left: `${x(b.x - pad)}%`, top: `${y(b.y - pad)}%`, width: `${((b.width + 2 * pad) / vb.width) * 100}%`, height: `${((b.height + 2 * pad) / vb.height) * 100}%` },
    pin: { left: `${cx}%`, top: `${cy}%`, "--ax": `${-Math.min(88, Math.max(12, cx))}%` } as CSSProperties,
    // menukik: papan digeser supaya provinsi ini ada di tengah, lalu diperbesar
    board: { "--dx": `${50 - cx}%`, "--dy": `${50 - cy}%` } as CSSProperties,
  };
}

function MapScreen(props: { map: ReactNode; slug: string; onPick: (slug: string) => void; onEnter: () => void; onBack: () => void; onPanel: OpenPanel }) {
  const { slug, onPick, onEnter } = props;
  const province = findProvince(slug)!;
  const stamps = usePassport();
  const seen = useSeen();
  const missions = useMissions();
  const seenHere = province.exhibits.filter((e) => seen?.includes(e.id)).length;
  const board = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<Shape | null>(null);
  const [landed, setLanded] = useState(false); // papan sudah mendarat: provinsi baru timbul setelahnya
  const [diving, setDiving] = useState(false);

  useLayoutEffect(() => {
    if (board.current) setShape(readShape(board.current, slug));
  }, [slug]);

  // Peta dirender di server; provinsi dikenali dari atribut data-slug pada elemen yang diklik.
  const slugOf = (target: EventTarget) => {
    const s = (target as Element).closest("[data-slug]")?.getAttribute("data-slug");
    return s && findProvince(s) ? s : null;
  };
  // Masuk: kamera menukik ke provinsi, lalu sapuan tinta (dipanggil dari animationend "selam").
  const enter = () => {
    if (diving) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return onEnter();
    setDiving(true);
  };

  return (
    <section className="halftone flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <button type="button" onClick={props.onBack} className={`${hudButton} [--bayang:var(--bata)]`} aria-label="Kembali ke menu utama">
          ← Menu
        </button>
        <h1 className="judul-komik text-center font-display text-2xl sm:text-4xl">Pilih ruang pamer</h1>
        <button type="button" onClick={() => props.onPanel("paspor")} className={`${hudButton} [--bayang:var(--bata)]`}>
          Paspor <StampCount />
        </button>
      </header>
      <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-3 pb-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:content-center-safe">
        <div
          className="papan-ruang pt-12 lg:pt-6"
          onClick={(e) => {
            const s = slugOf(e.target);
            if (s && !diving) onPick(s);
          }}
          onDoubleClick={(e) => slugOf(e.target) && enter()}
          onKeyDown={(e) => {
            const s = slugOf(e.target);
            if (!s || (e.key !== "Enter" && e.key !== " ")) return;
            e.preventDefault();
            if (s === slug) enter();
            else if (!diving) onPick(s);
          }}
          // papan sedikit condong mengikuti tetikus
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || diving || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const r = e.currentTarget.getBoundingClientRect();
            board.current?.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
            board.current?.style.setProperty("--rx", `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`);
          }}
          onPointerLeave={() => {
            board.current?.style.removeProperty("--ry");
            board.current?.style.removeProperty("--rx");
          }}
        >
          <div
            ref={board}
            className={`papan ${diving ? "selam" : ""}`}
            style={shape?.board}
            onAnimationEnd={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.animationName === "selam") onEnter();
              else setLanded(true);
            }}
          >
            <MapStamps />
            {/* lubang tinta yang ditinggalkan provinsi yang timbul */}
            <style>{`.peta [data-slug="${slug}"] path{fill:var(--sogan);stroke:var(--sogan)}`}</style>
            {props.map}
            {landed && shape?.slug === slug && (
              <div key={slug} aria-hidden className="timbul">
                {Array.from({ length: LAPIS }, (_, i) => (
                  <svg key={i} viewBox={shape.viewBox} style={{ ...shape.place, "--z": i + 1 } as CSSProperties} data-slug={i === LAPIS - 1 ? slug : undefined}>
                    <path d={shape.d} />
                  </svg>
                ))}
                <div className="pin" style={shape.pin}>
                  <p className="komik rounded-sm bg-kunyit px-2.5 py-0.5 font-display text-xl text-sogan [--bayang:var(--bata)] sm:text-2xl">{province.name}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-kertas/80">
            {[
              ["bg-kunyit", "Bisa dijelajahi"],
              ["bg-kertas", "Dipilih"],
              ["bg-bata", "Sudah dapat cap"],
            ].map(([swatch, label]) => (
              <span key={label} className="flex items-center gap-2">
                <span aria-hidden className={`size-3.5 rounded-sm border border-kertas/60 ${swatch}`} /> {label}
              </span>
            ))}
          </div>
        </div>

        <aside className="komik rounded-md bg-kertas p-5 text-sogan [--bayang:var(--bata)]">
          <ProvinceList slug={slug} onPick={onPick} className="grid gap-3 lg:max-h-[42vh] lg:overflow-y-auto" />
          <div key={slug} className="ganti">
            <h2 className="mt-5 font-display text-4xl">{province.name}</h2>
            <p className="mt-1 text-sm text-sogan-2">
              {seenHere}/{province.exhibits.length} koleksi dilihat · {missions?.includes(slug) ? "★ misi selesai" : "misi belum selesai"} ·{" "}
              {stamps?.includes(slug) ? "cap sudah didapat" : "belum ada cap"}
            </p>
            <p className="mt-3 leading-relaxed">{province.summary}</p>
          </div>
          <button type="button" onClick={enter} className={`${bigButton} mt-5 w-full`}>
            Masuk ruang pamer
          </button>
        </aside>
      </div>
    </section>
  );
}

// Daftar provinsi per pulau: di layar peta dan di popup pindah ruang.
function ProvinceList({ slug, onPick, className }: { slug: string; onPick: (slug: string) => void; className: string }) {
  const stamps = usePassport();
  return (
    <div className={className} aria-label="Daftar ruang pamer">
      {islands.map((island) => (
        <div key={island} role="group" aria-label={island}>
          <p className="text-xs font-bold text-sogan-2">{island}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {provinces
              .filter((p) => p.island === island)
              .map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  aria-pressed={p.slug === slug}
                  onClick={() => onPick(p.slug)}
                  className={`rounded-md border-2 border-sogan px-3 py-2 text-sm font-bold ${p.slug === slug ? "bg-sogan text-kunyit" : "bg-kertas hover:bg-kunyit"}`}
                >
                  {p.name}
                  {stamps?.includes(p.slug) && (
                    <span className="ml-1">
                      ✓<span className="sr-only"> sudah dapat cap</span>
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const pauseItems = [
  {
    group: "Ruang ini",
    items: [
      ["info", "Tentang provinsi", "Rumah adat, tarian, musik", "I"],
      ["kuis", "Kuis", "Jawab benar, dapat cap", "K"],
      ["cerita", "Cerita warga", "Kisah dari penduduknya", ""],
    ],
  },
  {
    group: "Petualanganmu",
    items: [
      ["tebak", "Tebak asal", "Koleksi ini dari mana?", ""],
      ["paspor", "Paspor budaya", "Cap yang sudah terkumpul", "P"],
      ["peringkat", "Peringkat", "Penjelajah teratas", ""],
      ["akun", "Akun", "Simpan kemajuanmu", ""],
    ],
  },
] as const;

// Menu jeda: kartu "kamu di sini" dengan kemajuan ruang ini dan aksi utama di kiri, menu per tema di kanan.
function PauseMenu(props: {
  province: Province;
  fullscreen: ReturnType<typeof useFullscreen>;
  onResume: () => void;
  onPanel: OpenPanel;
  onMap: () => void;
  onHome: () => void;
}) {
  const { province, fullscreen } = props;
  const stamps = usePassport();
  const seen = useSeen();
  const missions = useMissions();
  const seenHere = province.exhibits.filter((e) => seen?.includes(e.id)).length;
  const small = "tekan rounded-md bg-kertas px-3 py-2 text-sm font-bold hover:bg-kunyit";
  const chip = (done: boolean | undefined, yes: string, no: string) => (
    <span className={`rounded-sm border-2 px-2 py-0.5 text-xs font-bold ${done ? "border-bata bg-bata text-white" : "border-kertas/40 text-kertas/80"}`}>{done ? yes : no}</span>
  );
  return (
    <>
      <nav aria-label="Menu jeda" className="grid gap-5 md:grid-cols-[16rem_1fr]" onKeyDown={arrowNav}>
        <div className="flex flex-col gap-3">
          <div className="komik halftone -rotate-1 rounded-md bg-sogan p-4 text-kertas [--bayang:var(--kunyit)]">
            <p className="text-xs font-bold text-kunyit">Kamu sedang di</p>
            <p className="judul-komik font-display text-4xl leading-none">{province.name}</p>
            <p className="mt-1 text-sm text-kertas/80">{province.island}</p>
            <p className="mt-3 text-xs font-bold">
              {seenHere}/{province.exhibits.length} koleksi dilihat
            </p>
            <div aria-hidden className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-kertas/40">
              <div className="h-full bg-kunyit" style={{ width: `${(seenHere / Math.max(1, province.exhibits.length)) * 100}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chip(stamps?.includes(province.slug), "Cap didapat", "Belum ada cap")}
              {chip(missions?.includes(province.slug), "★ Misi selesai", "Misi belum selesai")}
            </div>
          </div>
          <button type="button" data-autofocus onClick={props.onResume} className={`${bigButton} flex items-center justify-between`}>
            Lanjutkan <kbd className={kbd}>Esc</kbd>
          </button>
          <button
            type="button"
            onClick={() => props.onPanel("pindah")}
            className="tekan flex items-center justify-between rounded-md bg-kunyit px-5 py-3 font-display text-2xl text-sogan [--bayang:var(--bata)] hover:bg-kertas-2"
          >
            Pindah ruang <kbd className={kbd}>T</kbd>
          </button>
        </div>

        <div className="urut grid content-start gap-4">
          {pauseItems.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-1.5 text-xs font-bold text-sogan-2">{group}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map(([id, label, hint, key]) => (
                  <button key={id} type="button" onClick={() => props.onPanel(id)} className="tekan flex items-start justify-between gap-3 rounded-md bg-kertas px-4 py-2.5 text-left hover:bg-kunyit">
                    <span>
                      <span className="block font-bold">{label}</span>
                      <span className="block text-sm text-sogan-2">{hint}</span>
                    </span>
                    {key && <kbd className={kbd}>{key}</kbd>}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 border-t-2 border-dashed border-sogan/40 pt-4">
            {fullscreen.supported && (
              <button type="button" onClick={fullscreen.toggle} className={small}>
                {fullscreen.on ? "Keluar layar penuh" : "Layar penuh"}
              </button>
            )}
            <button type="button" onClick={props.onMap} className={small}>
              Peta Indonesia
            </button>
            <button type="button" onClick={props.onHome} className={small}>
              Menu utama
            </button>
          </div>
        </div>
      </nav>
      {/* di luar <nav>: panah atas/bawah di sana memindah fokus, jadi akan menelan tombol panah penggeser */}
      <VolumeControl className="mt-5 border-t-2 border-sogan pt-4 accent-bata" buttonClass={small} />
    </>
  );
}

// Panel game memakai <dialog> native: fokus terkunci di dalam, Esc menutup, latar museum tidak bisa diklik.
function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    // showModal memfokus tombol pertama (Tutup); arahkan ke pilihan utama panel kalau ada
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={title}
      className="komik panel-buka m-auto max-h-[92dvh] w-[min(56rem,calc(100%-1.5rem))] overflow-y-auto rounded-md bg-kertas p-0 text-sogan [--bayang:var(--bata)] backdrop:bg-black/70"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-3 border-sogan bg-kunyit px-5 py-2.5">
        <h2 className="font-display text-3xl">{title}</h2>
        <button type="button" onClick={() => ref.current?.close()} className="tekan rounded-md bg-kertas px-3 py-2 text-sm font-bold hover:bg-kertas-2">
          Tutup
        </button>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </dialog>
  );
}

function ProvinceInfo({ province: p }: { province: Province }) {
  const food = p.exhibits.filter((e) => e.kind === "kuliner").map((e) => e.title);
  const facts = [
    ["Rumah adat", p.house],
    ["Pakaian adat", p.attire],
    ["Tarian", p.dance],
  ] as const;
  return (
    <>
      <p className="text-lg text-sogan-2">{p.summary}</p>
      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        {facts.map(([label, item]) => (
          <div key={label}>
            <dt className="text-sm text-sogan-2">{label}</dt>
            <dd className="mt-1">
              <span className="font-display text-xl font-semibold">{item.name}</span>
              <span className="mt-1 block leading-relaxed">{item.description}</span>
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-sm text-sogan-2">Musik daerah</dt>
          <dd className="mt-1">
            <span className="font-display text-xl font-semibold">{p.music.song}</span>
            <span className="mt-1 block">Alat musik: {p.music.instrument}</span>
            {p.music.audio ? (
              <audio controls preload="none" src={p.music.audio} className="mt-3 w-full">
                <a href={p.music.audio}>Unduh lagu {p.music.song}</a>
              </audio>
            ) : (
              <span className="mt-2 block text-sm text-sogan-2">Rekaman belum tersedia.</span>
            )}
          </dd>
        </div>
        {food.length > 0 && (
          <div>
            <dt className="text-sm text-sogan-2">Kuliner di ruang pamer</dt>
            <dd className="mt-1 leading-relaxed">{food.join(", ")}</dd>
          </div>
        )}
      </dl>
      <h3 className="mt-8 font-display text-xl font-semibold">Sejarah singkat</h3>
      <p className="mt-2 leading-relaxed">{p.history}</p>
    </>
  );
}
