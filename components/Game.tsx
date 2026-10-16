"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { MuseumLoader } from "@/components/MuseumLoader";
import { MapStamps, PassportBook, StampCount } from "@/components/Passport";
import { Quiz } from "@/components/Quiz";
import { findProvince, islands, provinces, type Province } from "@/data/cultureData";
import { usePassport } from "@/lib/passport";

type Screen = "menu" | "map" | "museum";
type PanelId = "jeda" | "info" | "kuis" | "cerita" | "paspor" | "peringkat" | "akun" | "kredit";
type OpenPanel = (id: PanelId) => void;

const panelTitle: Record<PanelId, string> = {
  jeda: "Menu",
  info: "Tentang provinsi",
  kuis: "Kuis",
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
  const fullscreen = useFullscreen();
  const province = findProvince(slug)!;

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (panel || e.ctrlKey || e.metaKey || e.altKey) return; // <dialog> menangani Esc-nya sendiri
      const key = e.key.toLowerCase();
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

  // Kode museum (three.js) diunduh sambil pemain memilih ruang.
  useEffect(() => {
    if (screen === "map") void import("@/components/Museum");
  }, [screen]);

  const go = (next: Screen) => {
    setPanel(null);
    setScreen(next);
  };

  return (
    <main className="game fixed inset-0 overflow-hidden bg-malam text-kertas">
      {slots.sync}

      {screen === "menu" && (
        <MainMenu
          onStart={() => {
            if (fullscreen.supported && !fullscreen.on) fullscreen.toggle();
            go("map");
          }}
          onPanel={setPanel}
        />
      )}

      {screen === "map" && (
        <MapScreen map={slots.map} slug={slug} onPick={setSlug} onEnter={() => go("museum")} onBack={() => go("menu")} onPanel={setPanel} />
      )}

      {screen === "museum" && (
        <>
          <MuseumLoader
            key={slug}
            name={province.name}
            summary={province.summary}
            exhibits={province.exhibits}
            active={panel === null}
            onPause={() => setPanel((open) => open ?? "jeda")}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
            {/* kotak narasi kuning ala komik */}
            <div className="komik rounded-sm bg-kunyit px-3 py-1.5 text-sogan">
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
          {panel === "info" && <ProvinceInfo province={province} />}
          {panel === "kuis" && <Quiz slug={province.slug} name={province.name} questions={province.quiz} />}
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

function MainMenu({ onStart, onPanel }: { onStart: () => void; onPanel: OpenPanel }) {
  const item = "flex items-center justify-between gap-3 rounded-md px-5 py-3 text-left text-lg font-medium text-kertas hover:bg-kertas hover:text-sogan";
  return (
    <section className="relative grid h-full items-center">
      <Image src="/images/foto-kecak.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-60 contrast-125 saturate-150" />
      {/* gelap di sisi teks supaya judul dan menu tetap terbaca di atas foto; titik raster membuat foto terasa dicetak */}
      <div className="absolute inset-0 bg-malam/75 sm:bg-transparent sm:bg-linear-to-r sm:from-malam sm:via-malam/85 sm:to-malam/25" />
      <div className="halftone absolute inset-0" />
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10">
        <p className="komik inline-block -rotate-2 rounded-sm bg-kunyit px-3 py-1 font-bold text-sogan">Museum budaya Nusantara</p>
        <h1 className="judul-komik mt-3 font-display text-7xl sm:text-9xl">NusaVerse</h1>
        <p className="mt-4 max-w-md text-lg text-kertas/85">
          Jelajahi {provinces.length} ruang pamer 3D, jawab kuisnya, dan kumpulkan cap paspor budaya.
        </p>
        <nav aria-label="Menu utama" className="mt-10 flex max-w-xs flex-col gap-1.5" onKeyDown={arrowNav}>
          <button type="button" autoFocus onClick={onStart} className={`${bigButton} text-left`}>
            Mulai jelajah
          </button>
          <button type="button" onClick={() => onPanel("paspor")} className={item}>
            Paspor budaya <StampCount />
          </button>
          <button type="button" onClick={() => onPanel("peringkat")} className={item}>
            Peringkat penjelajah
          </button>
          <button type="button" onClick={() => onPanel("akun")} className={item}>
            Akun
          </button>
          <button type="button" onClick={() => onPanel("kredit")} className={item}>
            Kredit aset
          </button>
        </nav>
      </div>
    </section>
  );
}

function MapScreen(props: { map: ReactNode; slug: string; onPick: (slug: string) => void; onEnter: () => void; onBack: () => void; onPanel: OpenPanel }) {
  const { slug, onPick, onEnter } = props;
  const province = findProvince(slug)!;
  const stamps = usePassport();
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
          <style>{`.peta [data-slug="${slug}"] path{fill:var(--kertas);stroke:var(--bata);stroke-width:1.5}`}</style>
          {props.map}
        </div>

        <aside className="komik rounded-md bg-kertas p-5 text-sogan [--bayang:var(--bata)]">
          <div className="grid gap-3" aria-label="Daftar ruang pamer">
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
          <h2 className="mt-5 font-display text-4xl">{province.name}</h2>
          <p className="mt-1 text-sm text-sogan-2">
            {province.exhibits.length} koleksi · {stamps?.includes(slug) ? "cap sudah didapat" : "belum ada cap"}
          </p>
          <p className="mt-3 leading-relaxed">{province.summary}</p>
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
      className="komik m-auto max-h-[92dvh] w-[min(56rem,calc(100%-1.5rem))] overflow-y-auto rounded-md bg-kertas p-0 text-sogan [--bayang:var(--bata)] backdrop:bg-black/70"
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
      </dl>
      <h3 className="mt-8 font-display text-xl font-semibold">Sejarah singkat</h3>
      <p className="mt-2 leading-relaxed">{p.history}</p>
    </>
  );
}
