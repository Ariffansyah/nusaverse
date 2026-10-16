import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Halaman ini belum ada di NusaVerse.</h1>
      <p className="mt-3 text-lg text-sogan-2">Semua ruang pamer bisa dibuka dari menu game.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-bata px-5 py-3 font-medium text-white hover:bg-sogan">
        Kembali ke game
      </Link>
    </section>
  );
}
