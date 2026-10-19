"use client";

import { setVolume, useMuted, useVolume } from "@/lib/sfx";

// Tombol bisu + penggeser volume, di menu utama (latar gelap) dan menu jeda (panel terang).
// Saat bisu penggeser menunjukkan 0; menggesernya menyalakan suara lagi.
export function VolumeControl({ className = "", buttonClass = "" }: { className?: string; buttonClass?: string }) {
  const [muted, toggleMuted] = useMuted();
  const volume = useVolume();
  const shown = muted ? 0 : Math.round(volume * 100);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button type="button" onClick={toggleMuted} className={buttonClass}>
        Suara: {muted ? "mati" : "nyala"}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={shown}
        onChange={(e) => setVolume(e.currentTarget.valueAsNumber / 100)}
        aria-label="Volume"
        aria-valuetext={`${shown}%`}
        className="w-24 cursor-pointer sm:w-32"
      />
    </div>
  );
}
