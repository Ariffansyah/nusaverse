// Isi panel game yang butuh server (sesi, database, cache). Dirender di app/page.tsx lalu dioper ke <Game> sebagai slot,
// jadi login/keluar cukup refresh() tanpa mereset layar game di klien.
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { AuthForms, LogoutButton, NameForm, StoryForm } from "@/components/Forms";
import { PassportSync } from "@/components/Passport";
import { props as museumProps, shellCredits } from "@/data/assets";
import { findProvince, provinces, type Credit } from "@/data/cultureData";
import { getViewer } from "@/lib/auth";
import { supabasePublic, supabaseReady, supabaseServer } from "@/lib/supabase";

// Butuh NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const notReady = <p>Fitur akun belum diaktifkan di server ini.</p>;
const statusLabel = { pending: "Menunggu tinjauan", approved: "Tayang", rejected: "Tidak disetujui" } as const;

export async function PassportSyncSlot() {
  const viewer = await getViewer();
  if (!viewer) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("stamps").select("province").eq("user_id", viewer.id);
  return <PassportSync server={(data ?? []).map((r) => r.province)} />;
}

export async function AccountPanel() {
  if (!supabaseReady) return notReady;
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <div className="grid gap-8 sm:grid-cols-[1fr_1.2fr]">
        <p className="text-sogan-2">
          Dengan akun, cap paspormu tersimpan di semua perangkat, namamu masuk papan peringkat, dan kamu bisa mengirim cerita budaya dari daerahmu.
        </p>
        <AuthForms />
      </div>
    );
  }

  const supabase = await supabaseServer();
  const [{ data: stamps }, { data: stories, error }] = await Promise.all([
    supabase.from("stamps").select("province").eq("user_id", viewer.id).order("created_at"),
    supabase.from("stories").select("id, province, title, status").eq("user_id", viewer.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <div className="space-y-6">
        <NameForm name={viewer.name} />
        <p>
          {stamps?.length
            ? `${stamps.length} cap di akunmu: ${stamps.map((s) => findProvince(s.province)?.name ?? s.province).join(", ")}.`
            : "Belum ada cap di akunmu. Selesaikan kuis di salah satu ruang pamer."}
        </p>
        {viewer.role === "admin" && (
          <a href="/admin" className="inline-block font-medium underline hover:text-bata">
            Buka Ruang Kurator
          </a>
        )}
        <LogoutButton />
      </div>
      <section>
        <h3 className="font-display text-xl font-semibold">Cerita yang kamu kirim</h3>
        {error && <p role="alert" className="mt-2 text-bata">Daftar cerita gagal dimuat.</p>}
        {!error && !stories?.length && <p className="mt-2 text-sogan-2">Belum ada. Kirim lewat panel Cerita warga di ruang pamer.</p>}
        <ul className="mt-3 divide-y divide-sogan/10">
          {stories?.map((s) => (
            <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2.5">
              <span>
                <span className="font-medium">{s.title}</span>
                <span className="block text-sm text-sogan-2">{findProvince(s.province)?.name}</span>
              </span>
              <span className={`text-sm font-medium ${s.status === "approved" ? "text-bata" : "text-sogan-2"}`}>
                {statusLabel[s.status as keyof typeof statusLabel]}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Di-cache beberapa menit dan disegarkan saat ada cap baru (updateTag("peringkat") di saveStamps).
export async function Leaderboard() {
  "use cache";
  cacheTag("peringkat");
  cacheLife("minutes");

  if (!supabaseReady) return notReady;
  const { data, error } = await supabasePublic().rpc("leaderboard", { p_limit: 20 });
  if (error) return <p role="alert" className="text-bata">Peringkat gagal dimuat. Coba lagi nanti.</p>;
  return (
    <>
      <p className="text-sogan-2">
        Diurutkan dari jumlah cap paspor. Kalau sama, yang lebih dulu mendapat cap terakhirnya berada di atas. Hanya akun yang masuk hitungan.
      </p>
      {!data.length && <p className="mt-6">Belum ada penjelajah berakun. Buat akun lewat menu Akun, lalu selesaikan kuis.</p>}
      <ol className="mt-4 divide-y divide-sogan/10">
        {data.map((row: { display_name: string; stamps: number }, i: number) => (
          <li key={i} className="flex items-center gap-4 py-2.5">
            <span className={`w-8 text-right font-display text-2xl ${i < 3 ? "text-bata" : "text-sogan-2"}`}>{i + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{row.display_name}</span>
            <span className="text-sm text-sogan-2">
              {row.stamps} dari {provinces.length} cap
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function CreditList({ items }: { items: { label: string; credit: Credit }[] }) {
  return (
    <ul className="mt-2 divide-y divide-sogan/10">
      {items.map(({ label, credit }) => (
        <li key={credit.url} className="py-2 text-sm">
          <span className="font-medium">{label}</span>:{" "}
          <a href={credit.url} target="_blank" rel="noreferrer" className="underline hover:text-bata">
            {credit.title}
          </a>{" "}
          oleh {credit.author}, {credit.license}
        </li>
      ))}
    </ul>
  );
}

export function Credits() {
  return (
    <>
      <p className="text-sogan-2">Model 3D, foto, dan peta di NusaVerse adalah karya orang lain yang dibagikan dengan lisensi terbuka. Terima kasih kepada para pembuatnya.</p>
      {provinces.map((p) => (
        <section key={p.slug} className="mt-6">
          <h3 className="font-display text-xl font-semibold">{p.name}</h3>
          <CreditList items={p.exhibits.map((e) => ({ label: e.title, credit: e.credit }))} />
        </section>
      ))}
      <section className="mt-6">
        <h3 className="font-display text-xl font-semibold">Ruang museum dan peta</h3>
        <CreditList
          items={[
            ...museumProps.map((p) => ({ label: "Alas pamer", credit: p.credit })),
            ...shellCredits.map((c) => ({ label: "Tekstur dan pencahayaan", credit: c })),
            {
              label: "Peta provinsi (34 provinsi, sebelum pemekaran Papua 2022)",
              credit: { title: "@svg-maps/indonesia", author: "Bashir Arrohman", license: "CC BY 4.0", url: "https://github.com/VictorCazanave/svg-maps" },
            },
          ]}
        />
      </section>
    </>
  );
}

type Story = { id: number; title: string; body: string; author: string };

export function StoriesSlot({ slug }: { slug: string }) {
  if (!supabaseReady) return notReady;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <p className="text-sogan-2">Pengetahuan dari orang yang tumbuh bersama budaya ini, ditinjau kurator sebelum tayang.</p>
        <div className="mt-5">
          <ApprovedStories slug={slug} />
        </div>
      </div>
      <div className="self-start rounded-lg bg-kertas-2 p-5">
        <h3 className="font-display text-xl font-semibold">Bagikan ceritamu</h3>
        <div className="mt-3">
          <Suspense fallback={<p className="text-sogan-2">Memeriksa akun…</p>}>
            <StoryComposer slug={slug} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Disegarkan saat kurator menyetujui cerita (updateTag di moderateStory).
async function ApprovedStories({ slug }: { slug: string }) {
  "use cache";
  cacheTag(`cerita:${slug}`);
  cacheLife("hours");

  const { data, error } = await supabasePublic().rpc("approved_stories", { p_province: slug });
  if (error) return <p role="alert" className="text-bata">Cerita warga gagal dimuat.</p>;
  if (!data.length) return <p className="text-sogan-2">Belum ada cerita yang tayang. Jadilah yang pertama berbagi.</p>;
  return (
    <ul className="space-y-5">
      {(data as Story[]).map((s) => (
        <li key={s.id}>
          <h3 className="font-display text-lg font-semibold">{s.title}</h3>
          <p className="mt-1 leading-relaxed whitespace-pre-line">{s.body}</p>
          <p className="mt-1 text-sm text-sogan-2">Dari {s.author}</p>
        </li>
      ))}
    </ul>
  );
}

async function StoryComposer({ slug }: { slug: string }) {
  const viewer = await getViewer();
  if (!viewer) return <p>Masuk lewat menu Akun untuk berbagi cerita, tradisi, atau koreksi dari daerahmu.</p>;
  return <StoryForm province={slug} />;
}
