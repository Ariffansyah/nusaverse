"use client";

import dynamic from "next/dynamic";
import { catchError, type ErrorInfo } from "next/error";
import type { ComponentProps } from "react";

// ssr:false hanya boleh di Client Component. three.js baru diunduh saat pemain masuk ruang pamer.
const Museum = dynamic(() => import("@/components/Museum"), {
  ssr: false,
  loading: () => <p className="grid size-full place-items-center bg-malam text-kertas/80">Membuka ruang pamer…</p>,
});

const MuseumBoundary = catchError((_: object, { reset }: ErrorInfo) => (
  <div role="alert" className="grid size-full place-content-center gap-4 bg-malam p-6 text-center text-kertas">
    <p>Ruang pamer 3D gagal dimuat. Browser ini mungkin tidak mendukung WebGL.</p>
    <button type="button" onClick={reset} className="mx-auto rounded-md bg-bata px-4 py-3 text-sm font-medium text-white hover:bg-sogan">
      Coba muat lagi
    </button>
  </div>
));

export function MuseumLoader(props: ComponentProps<typeof Museum>) {
  return (
    <MuseumBoundary>
      <Museum {...props} />
    </MuseumBoundary>
  );
}
