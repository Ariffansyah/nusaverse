"use client";

import { useState } from "react";
import type { Question } from "@/data/cultureData";
import { saveStamps } from "@/app/actions";
import { addStamp, usePassport } from "@/lib/passport";

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
    }
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
                    className={`flex cursor-pointer items-center gap-3 px-3 py-3 text-sm has-checked:bg-kunyit has-disabled:cursor-default ${isAnswer ? "font-semibold text-bata" : ""} ${wrongPick ? "line-through" : ""}`}
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
