import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { moderateStory, setRole } from "@/app/actions";
import { findProvince, provinces } from "@/data/cultureData";
import { getViewer } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Ruang Kurator" };

const date = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
const smallButton = "rounded-md px-3 py-2.5 text-sm font-medium";

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/" className="inline-block py-3 text-sm font-medium text-sogan-2 hover:text-bata">
        ← Kembali ke NusaVerse
      </Link>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Ruang Kurator</h1>
      <Suspense fallback={<p className="mt-6 text-sogan-2">Memuat data kurator…</p>}>
        <Panel />
      </Suspense>
    </section>
  );
}

type Pending = { id: number; province: string; title: string; body: string; author: string; created_at: string };

async function Panel() {
  const viewer = await getViewer();
  if (!viewer) redirect("/");
  if (viewer.role !== "admin") {
    return <p className="mt-6 max-w-xl">Halaman ini khusus kurator. Minta kurator lain menjadikan akunmu kurator dari halaman ini.</p>;
  }

  const supabase = await supabaseServer();
  const [users, stamps, approved, pending, people] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    // ponytail: hitung per provinsi di JS; ganti RPC group by kalau cap sudah puluhan ribu
    supabase.from("stamps").select("province"),
    supabase.from("stories").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.rpc("pending_stories"),
    supabase.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  if (stamps.error || pending.error || people.error) return <p role="alert" className="mt-6 text-bata">Data kurator gagal dimuat. Coba muat ulang.</p>;

  const queue = pending.data as Pending[];
  const perProvince = provinces
    .map((p) => ({ name: p.name, count: stamps.data.filter((s) => s.province === p.slug).length }))
    .sort((a, b) => b.count - a.count);
  const top = Math.max(1, perProvince[0]?.count ?? 0);

  return (
    <div className="mt-8 space-y-14">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-sogan/15 py-6 sm:grid-cols-4">
        {[
          ["Akun terdaftar", users.count ?? 0],
          ["Cap diberikan", stamps.data.length],
          ["Cerita tayang", approved.count ?? 0],
          ["Menunggu tinjauan", queue.length],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-sogan-2">{label}</dt>
            <dd className={`font-display text-4xl ${label === "Menunggu tinjauan" && queue.length ? "text-bata" : ""}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-14 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="antrean">
          <h2 id="antrean" className="font-display text-2xl font-semibold">
            Antrean cerita warga
          </h2>
          {!queue.length && <p className="mt-2 text-sogan-2">Tidak ada cerita yang menunggu. Semua sudah ditinjau.</p>}
          <ul className="mt-4 space-y-6">
            {queue.map((s) => (
              <li key={s.id} className="rounded-lg bg-kertas-2 p-5">
                <p className="text-sm text-sogan-2">
                  {findProvince(s.province)?.name} · {s.author} · {date(s.created_at)}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed whitespace-pre-line">{s.body}</p>
                <form action={moderateStory} className="mt-4 flex gap-2">
                  <input type="hidden" name="id" value={s.id} />
                  <button name="status" value="approved" className={`${smallButton} bg-bata text-white hover:bg-sogan`}>
                    Setujui dan tayangkan
                  </button>
                  <button name="status" value="rejected" className={`${smallButton} border border-sogan/30 hover:border-bata hover:text-bata`}>
                    Tolak
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="populer">
          <h2 id="populer" className="font-display text-2xl font-semibold">
            Cap per provinsi
          </h2>
          <ul className="mt-4 space-y-3">
            {perProvince.map((p) => (
              <li key={p.name}>
                <div className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-sogan-2">{p.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-kertas-2">
                  <div className="h-2 rounded-full bg-bata" style={{ width: `${(p.count / top) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="pengguna">
        <h2 id="pengguna" className="font-display text-2xl font-semibold">
          Pengguna terbaru
        </h2>
        <ul className="mt-4 divide-y divide-sogan/10">
          {people.data.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
              <span>
                <span className="font-medium">{u.display_name}</span>
                <span className="block text-sm text-sogan-2">
                  {u.role === "admin" ? "Kurator" : "Pengguna"} · bergabung {date(u.created_at)}
                </span>
              </span>
              {u.id !== viewer.id && (
                <form action={setRole}>
                  <input type="hidden" name="user" value={u.id} />
                  <input type="hidden" name="role" value={u.role === "admin" ? "user" : "admin"} />
                  <button className={`${smallButton} border border-sogan/30 hover:border-bata hover:text-bata`}>
                    {u.role === "admin" ? "Cabut peran kurator" : "Jadikan kurator"}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
