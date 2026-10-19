"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { MainMenu } from "@/components/MainMenu";
import { MuseumLoader } from "@/components/MuseumLoader";
import { VolumeControl } from "@/components/Volume";
import { MapStamps, PassportBook, StampCount } from "@/components/Passport";
import { GuessGame, Quiz } from "@/components/Quiz";
import { findProvince, islands, provinces, type Province } from "@/data/cultureData";
import { useMissions, usePassport, useSeen } from "@/lib/passport";
import { play } from "@/lib/sfx";

type Screen = "menu" | "map" | "museum";
type PanelId = "jeda" | "info" | "kuis" | "tebak" | "cerita" | "paspor" | "peringkat" | "akun" | "kredit";
type OpenPanel = (id: PanelId) => void;

const panelTitle: Record<PanelId, string> = {
  jeda: "Menu",
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
const museumKeys: Record<string, PanelId> = { escape: "jeda", m: "jeda", i: "info", k: "kuis", p: "paspor" };

// Tombol HUD: kertas bergaris tinta, terbaca di atas adegan 3D. Tombol utama: merah dengan bayangan kunyit, satu-satunya aksi besar per layar.
const hudButton = "tekan flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-kertas px-3 py-2 text-sm font-bold text-sogan hover:bg-kunyit";
const bigButton = "tekan rounded-md bg-bata px-5 py-3 font-display text-2xl text-white [--bayang:var(--kunyit)] hover:bg-sogan";
const menuItem = "rounded-md px-4 py-3 text-left text-lg font-medium hover:bg-kunyit";

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
        }
        return;
      }
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
        if ((e.target as Element).closest("button, input, [data-slug]")) play("klik");
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
            {/* kotak narasi kuning ala komik */}
            <div className="komik turun rounded-sm bg-kunyit px-3 py-1.5 text-sogan">
              <p className="text-xs font-bold">Ruang pamer</p>
              <p className="font-display text-2xl leading-tight">{province.name}</p>
            </div>
            <div className="pointer-events-auto flex gap-1.5">
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
            <nav aria-label="Menu jeda" className="grid gap-1 sm:grid-cols-2" onKeyDown={arrowNav}>
              <button type="button" data-autofocus onClick={() => setPanel(null)} className="tekan rounded-md bg-bata px-4 py-3 text-left font-display text-2xl text-white hover:bg-sogan">
                Lanjutkan
              </button>
              {(
                [
                  ["info", "Tentang provinsi"],
                  ["kuis", "Kuis"],
                  ["tebak", "Tebak asal"],
                  ["cerita", "Cerita warga"],
                  ["paspor", "Paspor budaya"],
                  ["peringkat", "Peringkat"],
                  ["akun", "Akun"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setPanel(id)} className={menuItem}>
                  {label}
                </button>
              ))}
              {fullscreen.supported && (
                <button type="button" onClick={fullscreen.toggle} className={menuItem}>
                  {fullscreen.on ? "Keluar layar penuh" : "Layar penuh"}
                </button>
              )}
              <button type="button" onClick={() => go("map")} className={menuItem}>
                Pilih ruang lain
              </button>
              <button type="button" onClick={() => go("menu")} className={menuItem}>
                Menu utama
              </button>
            </nav>
          )}
          {/* di luar <nav>: panah atas/bawah di sana memindah fokus, jadi akan menelan tombol panah penggeser */}
          {panel === "jeda" && (
            <VolumeControl
              className="mt-4 border-t-2 border-sogan pt-4 accent-bata"
              buttonClass="tekan rounded-md bg-kertas px-3 py-2 text-sm font-bold hover:bg-kunyit"
            />
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

function MapScreen(props: { map: ReactNode; slug: string; onPick: (slug: string) => void; onEnter: () => void; onBack: () => void; onPanel: OpenPanel }) {
  const { slug, onPick, onEnter } = props;
  const province = findProvince(slug)!;
  const stamps = usePassport();
  const seen = useSeen();
  const missions = useMissions();
  const seenHere = province.exhibits.filter((e) => seen?.includes(e.id)).length;
  // Peta dirender di server; provinsi dikenali dari atribut data-slug pada elemen yang diklik.
  const slugOf = (target: EventTarget) => {
    const s = (target as Element).closest("[data-slug]")?.getAttribute("data-slug");
    return s && findProvince(s) ? s : null;
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
          onClick={(e) => {
            const s = slugOf(e.target);
            if (s) onPick(s);
          }}
          onDoubleClick={(e) => slugOf(e.target) && onEnter()}
          onKeyDown={(e) => {
            const s = slugOf(e.target);
            if (!s || (e.key !== "Enter" && e.key !== " ")) return;
            e.preventDefault();
            if (s === slug) onEnter();
            else onPick(s);
          }}
        >
          <MapStamps />
          <style>{`.peta [data-slug="${slug}"] path{fill:var(--kertas);stroke:var(--bata);stroke-width:1.5;animation:denyut 1.1s ease-in-out infinite alternate}`}</style>
          {props.map}
        </div>

        <aside className="komik rounded-md bg-kertas p-5 text-sogan [--bayang:var(--bata)]">
          <div className="grid gap-3 lg:max-h-[42vh] lg:overflow-y-auto" aria-label="Daftar ruang pamer">
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
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div key={slug} className="ganti">
            <h2 className="mt-5 font-display text-4xl">{province.name}</h2>
            <p className="mt-1 text-sm text-sogan-2">
              {seenHere}/{province.exhibits.length} koleksi dilihat · {missions?.includes(slug) ? "★ misi selesai" : "misi belum selesai"} ·{" "}
              {stamps?.includes(slug) ? "cap sudah didapat" : "belum ada cap"}
            </p>
            <p className="mt-3 leading-relaxed">{province.summary}</p>
          </div>
          <button type="button" onClick={onEnter} className={`${bigButton} mt-5 w-full`}>
            Masuk ruang pamer
          </button>
        </aside>
      </div>
    </section>
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
