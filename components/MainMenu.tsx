"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { StampCount } from "@/components/Passport";
import { provinces, type Exhibit, type Province } from "@/data/cultureData";
import { shuffle } from "@/lib/shuffle";

type PanelId = "tebak" | "paspor" | "peringkat" | "akun" | "kredit";
type Photo = Exhibit & { province: Province };

// Hanya koleksi foto Commons yang punya berkas di public/images/{id}.jpg.
const photos: Photo[] = provinces.flatMap((p) => p.exhibits.filter((e) => e.source.type === "commons").map((e) => ({ ...e, province: p })));
const photo = (id: string) => photos.find((p) => p.id === id)!;

// Latar berganti antar pertunjukan; urutan tetap supaya render server dan klien sama.
const slides = ["foto-kecak", "foto-festival-baliem", "foto-jaipong", "foto-borobudur", "foto-cakalele"].map(photo);
// Kartu tempel awal; tombol "Acak" menggantinya dengan pilihan acak.
const firstCards = ["foto-saman", "foto-borobudur", "foto-festival-baliem"].map(photo);

const title = "NusaVerse";

export function MainMenu({
  onStart,
  onPanel,
  arrowNav,
  bigButton,
}: {
  onStart: (slug?: string) => void;
  onPanel: (id: PanelId) => void;
  arrowNav: (e: KeyboardEvent<HTMLElement>) => void;
  bigButton: string;
}) {
  const item = "flex items-center justify-between gap-3 rounded-md px-5 py-3 text-left text-lg font-medium text-kertas hover:bg-kertas hover:text-sogan";
  const ref = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);
  const [cards, setCards] = useState(firstCards);
  const [deal, setDeal] = useState(0); // naik tiap acak: memutar ulang animasi kartu ditempel
  const [fact, setFact] = useState(0);

  // Latar dan fakta berganti sendiri; berhenti kalau pemain meminta gerak minimal.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bg = setInterval(() => setSlide((n) => (n + 1) % slides.length), 7000);
    const tip = setInterval(() => setFact((n) => (n + 1) % photos.length), 8000);
    return () => {
      clearInterval(bg);
      clearInterval(tip);
    };
  }, []);

  // Paralaks: posisi penunjuk ditulis langsung sebagai variabel CSS, tanpa render ulang.
  const onPointerMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  const current = slides[slide];
  const tip = photos[fact];

  return (
    <section ref={ref} onPointerMove={onPointerMove} className="sampul relative grid h-full grid-rows-[1fr_auto]">
      {/* slide sebelumnya tetap di bawah supaya pergantian berupa silang-pudar, bukan kedip hitam */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          key={`prev-${slide}`}
          src={`/images/${slides[(slide + slides.length - 1) % slides.length].id}.jpg`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60 contrast-125 saturate-150"
        />
        <Image key={slide} src={`/images/${current.id}.jpg`} alt="" fill priority={slide === 0} sizes="100vw" className="latar-masuk ken-burns object-cover opacity-60 contrast-125 saturate-150" />
      </div>
      {/* gelap di sisi teks supaya judul dan menu tetap terbaca di atas foto; titik raster membuat foto terasa dicetak */}
      <div className="absolute inset-0 bg-malam/75 sm:bg-transparent sm:bg-linear-to-r sm:from-malam sm:via-malam/85 sm:to-malam/25" />
      <div className="halftone absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 self-center px-6 py-6 sm:px-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="komik goyang-pelan inline-block -rotate-2 rounded-sm bg-kunyit px-3 py-1 font-bold text-sogan">Museum budaya Nusantara</p>
          <h1 aria-label={title} className="judul-komik judul-masuk mt-3 font-display text-7xl sm:text-9xl">
            {[...title].map((ch, i) => (
              <span key={i} aria-hidden className="huruf" style={{ "--i": i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-md text-lg text-kertas/85">
            Jelajahi {provinces.length} ruang pamer 3D, jawab kuisnya, dan kumpulkan cap paspor budaya.
          </p>

          {/* balon fakta: gampang dilewati, tapi memberi alasan untuk menunggu di menu */}
          <div className="balon relative mt-6 flex max-w-md items-start gap-3 bg-kertas px-4 py-3 text-sogan [@media(max-height:760px)]:hidden">
            <div key={fact} className="ganti min-w-0 flex-1" aria-live="polite">
              <p className="text-xs font-bold text-bata">
                Tahukah kamu? · {tip.province.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-snug">
                <b>{tip.title}</b> — {tip.description}
              </p>
            </div>
            {/* tombol di kolomnya sendiri supaya tidak menutupi teks fakta */}
            <button
              type="button"
              onClick={() => setFact((n) => (n + 1 + Math.floor(Math.random() * (photos.length - 1))) % photos.length)}
              className="tekan shrink-0 rotate-3 self-center rounded-md bg-kunyit px-2 py-0.5 font-display text-lg"
            >
              Lagi!
            </button>
          </div>

          <nav aria-label="Menu utama" className="urut mt-8 flex max-w-xs flex-col gap-1.5" onKeyDown={arrowNav}>
            <div className="relative">
              <button type="button" autoFocus onClick={() => onStart()} className={`${bigButton} w-full text-left`}>
                Mulai jelajah
              </button>
              <span aria-hidden className="ledakan pointer-events-none absolute -top-5 -right-6 grid size-16 place-content-center font-display text-xl text-sogan">
                Ayo!
              </span>
            </div>
            <button type="button" onClick={() => onPanel("tebak")} className={item}>
              Tebak asal
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

        {/* kartu koleksi tertempel: klik untuk langsung memilih provinsinya di peta */}
        <div className="relative hidden h-[30rem] w-[24rem] lg:block">
          {cards.map((c, i) => (
            <div key={`${deal}-${c.id}`} className={`tempel-kartu kartu-${i} absolute`} style={{ "--i": i } as CSSProperties}>
              <button type="button" onClick={() => onStart(c.province.slug)} className="kartu-koleksi komik group block w-56 bg-kertas p-2 pb-3 text-left text-sogan [--bayang:var(--bata)]">
                <span className="relative block aspect-[4/3] overflow-hidden border-2 border-sogan">
                  <Image src={`/images/${c.id}.jpg`} alt="" fill sizes="224px" className="object-cover transition-[scale] duration-300 group-hover:scale-110" />
                </span>
                <span className="mt-2 block font-display text-xl leading-tight">{c.title}</span>
                <span className="block text-xs font-bold text-sogan-2">
                  {c.province.name} <span className="text-bata opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">· kunjungi →</span>
                </span>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setCards(shuffle(photos).slice(0, 3));
              setDeal((n) => n + 1);
            }}
            className="tekan absolute right-2 bottom-0 -rotate-3 rounded-md bg-kunyit px-3 py-1 font-display text-xl text-sogan"
          >
            Acak koleksi ⟳
          </button>
        </div>
      </div>

      <p className="relative mx-auto w-full max-w-6xl px-6 pb-2 text-right text-xs text-kertas/60 sm:px-10">
        Di latar: {current.title}, {current.province.name}
      </p>

      {/* pita berjalan nama provinsi, seperti tepi strip komik */}
      <div aria-hidden className="pita relative -mx-4 -rotate-1 overflow-hidden border-y-3 border-sogan bg-kunyit py-1.5 text-sogan">
        <div className="pita-jalan flex w-max gap-6 font-display text-2xl whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span key={copy} className="flex gap-6">
              {provinces.map((p) => (
                <span key={p.slug} className="flex items-center gap-6">
                  {p.name}
                  <span className="text-bata">★</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
