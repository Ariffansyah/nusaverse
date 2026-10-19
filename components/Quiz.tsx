"use client";

import Image from "next/image";
import { useState } from "react";
import { kinds, provinces, type Question } from "@/data/cultureData";
import { saveStamps } from "@/app/actions";
import { addStamp, usePassport } from "@/lib/passport";
import { play } from "@/lib/sfx";
import { shuffle } from "@/lib/shuffle";

export function Quiz({ slug, name, questions }: { slug: string; name: string; questions: Question[] }) {
  const stamps = usePassport();
  const [answers, setAnswers] = useState<number[] | null>(null);
  const [round, setRound] = useState(0);
  const passMark = Math.ceil((questions.length * 2) / 3);
  const scoreOf = (a: number[]) => a.filter((x, i) => x === questions[i].answer).length;
  const score = answers ? scoreOf(answers) : 0;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const picked = questions.map((_, i) => Number(data.get(`q${i}`)));
    setAnswers(picked);
    if (scoreOf(picked) >= passMark) {
      addStamp(slug);
      saveStamps([slug]); // tamu: diabaikan server
      // cap mendarat (animasi cap-jatuh), lalu jingle
      play("cap", 0.12);
      play("lulus", 0.35);
    } else play("salah");
  }

  return (
    <section>
      <p className="text-sm text-sogan-2">
        Benar minimal {passMark} dari {questions.length} untuk mendapat cap paspor.
        {stamps?.includes(slug) && !answers && " Kamu sudah punya cap ini, tapi boleh main lagi."}
      </p>

      <form key={round} onSubmit={submit} className="mt-4 space-y-6">
        {questions.map((q, i) => (
          <fieldset key={q.q} disabled={!!answers}>
            <legend className="font-bold">
              {i + 1}. {q.q}
            </legend>
            <div className="mt-2 divide-y-2 divide-sogan overflow-hidden rounded-md border-2 border-sogan bg-kertas">
              {q.options.map((opt, j) => {
                const isAnswer = answers && j === q.answer;
                const wrongPick = answers && answers[i] === j && j !== q.answer;
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-3 text-sm has-checked:bg-kunyit has-disabled:cursor-default ${isAnswer ? "kilap font-semibold text-bata" : ""} ${wrongPick ? "goyang line-through" : ""}`}
                  >
                    <input type="radio" name={`q${i}`} value={j} required className="size-4 accent-bata" />
                    {opt}
                    {isAnswer && <span className="ml-auto text-xs">jawaban benar</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {!answers && (
          <button type="submit" className="tekan w-full rounded-md bg-bata px-4 py-2.5 font-display text-2xl text-white hover:bg-sogan">
            Periksa jawaban
          </button>
        )}
      </form>

      <div role="status" className="mt-6">
        {answers && score >= passMark && (
          <div className="flex items-center gap-5">
            <span className="cap cap-baru size-24 shrink-0 p-2 font-display text-sm leading-tight font-semibold">
              Cap {name}
            </span>
            <p>
              Skor {score}/{questions.length}. Cap sudah masuk ke paspor budayamu.
            </p>
          </div>
        )}
        {answers && score < passMark && (
          <p>
            Skor {score}/{questions.length}. Butuh {passMark} jawaban benar untuk mendapat cap.
          </p>
        )}
        {answers && (
          <button
            type="button"
            onClick={() => {
              setAnswers(null);
              setRound((r) => r + 1);
            }}
            className="tekan mt-4 rounded-md bg-kertas px-4 py-3 text-sm font-bold hover:bg-kunyit"
          >
            Ulangi kuis
          </button>
        )}
      </div>
    </section>
  );
}

const ROUNDS = 10;
const BEST_KEY = "nusaverse:tebak";

// Tebak asal: foto koleksi dari provinsi acak, pilih provinsinya. Satu soal per provinsi; satu pengecoh dari pulau yang sama
// supaya tidak bisa ditebak dari pulaunya saja. Foto yang judulnya memuat nama provinsi (Mie Aceh) tidak dipakai.
function makeRounds() {
  const photos = provinces.flatMap((p) =>
    p.exhibits.filter((e) => e.source.type === "commons" && !e.title.toLowerCase().includes(p.name.toLowerCase())).map((e) => ({ e, p })),
  );
  const picked: typeof photos = [];
  for (const x of shuffle(photos)) if (picked.length < ROUNDS && !picked.some((y) => y.p === x.p)) picked.push(x);
  return picked.map(({ e, p }) => {
    const near = shuffle(provinces.filter((o) => o.island === p.island && o !== p)).slice(0, 1);
    const far = shuffle(provinces.filter((o) => o !== p && !near.includes(o))).slice(0, 3 - near.length);
    return { e, p, options: shuffle([p, ...near, ...far]) };
  });
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function GuessGame({ onVisit }: { onVisit: (slug: string) => void }) {
  const [rounds, setRounds] = useState(makeRounds);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(readBest);

  function answer(slug: string) {
    setPick(slug);
    const right = slug === rounds[i].p.slug;
    play(right ? "benar" : "salah");
    setScore(score + +right);
    setStreak(right ? streak + 1 : 0);
  }

  function next() {
    setPick(null);
    setI(i + 1);
    if (i + 1 === rounds.length) {
      play("cap", 0.12); // skor akhir tampil sebagai cap
      if (score >= 7) play("lulus", 0.35);
    }
    if (i + 1 < rounds.length || score <= best) return;
    setBest(score);
    try {
      localStorage.setItem(BEST_KEY, String(score));
    } catch {}
  }

  function restart() {
    setRounds(makeRounds());
    setI(0);
    setScore(0);
    setStreak(0);
  }

  if (i === rounds.length) {
    return (
      <section role="status" className="text-center">
        <p className="cap cap-baru size-28 p-2 font-display text-4xl">
          {score}/{rounds.length}
        </p>
        <p className="mt-4 text-lg">{score === rounds.length ? "Sempurna! Kamu kenal betul Nusantara." : score >= 7 ? "Hebat, hampir semua tepat." : "Jelajahi ruang pamernya, lalu coba lagi."}</p>
        <p className="mt-1 text-sm text-sogan-2">Skor terbaikmu di perangkat ini: {Math.max(best, score)}</p>
        <button type="button" autoFocus onClick={restart} className="tekan mt-6 rounded-md bg-bata px-5 py-2.5 font-display text-2xl text-white hover:bg-sogan">
          Main lagi
        </button>
      </section>
    );
  }

  const { e, p, options } = rounds[i];
  return (
    <section>
      <p className="flex flex-wrap justify-between gap-2 text-sm font-bold text-sogan-2">
        <span>
          Soal {i + 1}/{rounds.length} · Skor {score}
          {streak > 1 && ` · ${streak} benar beruntun!`}
        </span>
        {best > 0 && <span>Terbaik {best}</span>}
      </p>
      <div className="relative mt-3 aspect-[4/3] max-h-[42dvh] w-full overflow-hidden rounded-md border-3 border-sogan bg-malam">
        <Image key={e.id} src={`/images/${e.id}.jpg`} alt={e.title} fill sizes="(min-width: 56rem) 52rem, 100vw" className="object-contain" />
      </div>
      <p className="mt-3 text-xs font-bold text-bata">{kinds[e.kind]}</p>
      <h3 className="font-display text-2xl">{e.title}</h3>
      <p className="mt-1">Koleksi ini berasal dari provinsi mana?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const right = pick && o === p;
          const wrong = pick === o.slug && o !== p;
          return (
            <button
              key={o.slug}
              type="button"
              disabled={!!pick}
              onClick={() => answer(o.slug)}
              className={`rounded-md border-2 border-sogan px-4 py-3 text-left font-bold enabled:hover:bg-kunyit ${right ? "kilap bg-kunyit" : wrong ? "goyang bg-kertas-2 line-through" : "bg-kertas"}`}
            >
              {o.name}
              {right && <span className="float-right text-sm font-medium">jawaban benar</span>}
            </button>
          );
        })}
      </div>
      {pick && (
        <div role="status" className="mt-4 border-t-2 border-sogan pt-4">
          <p className="font-bold">{pick === p.slug ? "Tepat!" : `Kurang tepat, ini dari ${p.name}.`}</p>
          <p className="mt-1 leading-relaxed">{e.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" autoFocus onClick={next} className="tekan rounded-md bg-bata px-4 py-2.5 font-display text-xl text-white hover:bg-sogan">
              {i + 1 < rounds.length ? "Soal berikutnya" : "Lihat skor"}
            </button>
            <button type="button" onClick={() => onVisit(p.slug)} className="tekan rounded-md bg-kertas px-4 py-2.5 text-sm font-bold hover:bg-kunyit">
              Kunjungi ruang {p.name}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
