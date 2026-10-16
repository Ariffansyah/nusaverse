import { Suspense } from "react";
import { Game } from "@/components/Game";
import { IndonesiaMap } from "@/components/IndonesiaMap";
import { AccountPanel, Credits, Leaderboard, PassportSyncSlot, StoriesSlot } from "@/components/Slots";
import { provinces } from "@/data/cultureData";

// Seluruh aplikasi adalah satu layar game. Bagian yang butuh server dirender di sini dan dioper sebagai slot.
export default function Home() {
  return (
    <Game
      map={<IndonesiaMap />}
      account={
        <Suspense fallback={<p className="text-sogan-2">Memeriksa akun…</p>}>
          <AccountPanel />
        </Suspense>
      }
      leaderboard={<Leaderboard />}
      credits={<Credits />}
      stories={Object.fromEntries(provinces.map((p) => [p.slug, <StoriesSlot key={p.slug} slug={p.slug} />]))}
      sync={
        <Suspense fallback={null}>
          <PassportSyncSlot />
        </Suspense>
      }
    />
  );
}
