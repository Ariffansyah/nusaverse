"use client";

import { useEffect } from "react";
import { saveStamps } from "@/app/actions";
import { islands, provinces } from "@/data/cultureData";
import { clearStamps, getStamps, mergeStamps, usePassport } from "@/lib/passport";

// Setelah masuk: cap di akun turun ke perangkat, cap lokal yang belum ada naik ke akun.
export function PassportSync({ server }: { server: string[] }) {
  const key = server.join();
  useEffect(() => {
    const serverSet = new Set(key.split(",").filter(Boolean));
    const localOnly = getStamps().filter((s) => !serverSet.has(s));
    mergeStamps([...serverSet]);
    if (localOnly.length) saveStamps(localOnly);
  }, [key]);
  return null;
}

export function StampCount() {
  const stamps = usePassport();
  if (!stamps) return null;
  return (
    <span className="cap size-7 text-xs font-semibold">
      {stamps.length}
      <span className="sr-only"> cap terkumpul</span>
    </span>
  );
}

// Slug sudah divalidasi di lib/passport, aman disisipkan ke selector.
export function MapStamps() {
  const stamps = usePassport();
  if (!stamps?.length) return null;
  return <style>{stamps.map((s) => `.peta [data-slug="${s}"] path{fill:var(--bata)}`).join("")}</style>;
}

// onVisit: klik provinsi yang belum ada capnya, game membawa pemain ke peta dengan provinsi itu terpilih.
export function PassportBook({ onVisit }: { onVisit: (slug: string) => void }) {
  const stamps = usePassport();
  if (!stamps) return <p className="text-sogan-2">Membuka paspor…</p>;

  // Lencana pulau: semua provinsi di satu pulau sudah punya cap.
  const groups = islands.map((island) => {
    const list = provinces.filter((p) => p.island === island);
    return { island, list, got: list.filter((p) => stamps.includes(p.slug)).length };
  });
  const badges = groups.filter((g) => g.got === g.list.length).length;

  return (
    <>
      <p className="font-display text-2xl">
        {stamps.length} dari {provinces.length} provinsi · {badges} dari {islands.length} lencana pulau
      </p>
      {stamps.length === 0 && (
        <p className="mt-2 text-sogan-2">Belum ada cap. Masuk ke salah satu ruang pamer, lalu jawab kuisnya.</p>
      )}
      {groups.map(({ island, list, got }) => (
        <section key={island} className="mt-8">
          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl font-semibold">
            {island}
            <span className="font-sans text-sm font-normal text-sogan-2">
              {got}/{list.length}
            </span>
            {got === list.length && (
              <span className="rounded-full border-2 border-bata px-3 py-0.5 font-sans text-sm font-medium text-bata">Lencana {island}</span>
            )}
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {list.map((p) =>
              stamps.includes(p.slug) ? (
                <li key={p.slug} className="cap aspect-square p-4">
                  <span className="font-display text-lg leading-tight font-semibold">{p.name}</span>
                  <span className="mt-1 block text-xs">{p.house.name}</span>
                </li>
              ) : (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => onVisit(p.slug)}
                    className="grid aspect-square w-full place-content-center rounded-full border-2 border-dashed border-sogan/30 p-4 text-center text-sogan-2 transition-colors hover:border-bata hover:text-bata"
                  >
                    <span className="font-display text-lg leading-tight">{p.name}</span>
                    <span className="mt-1 text-xs">Kunjungi</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </section>
      ))}
      {stamps.length > 0 && (
        <button
          type="button"
          onClick={() => confirm("Hapus semua cap di paspor ini?") && clearStamps()}
          className="mt-10 rounded-md border border-sogan/30 px-4 py-3 text-sm font-medium hover:border-bata hover:text-bata"
        >
          Hapus semua cap
        </button>
      )}
    </>
  );
}
