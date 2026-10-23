import indonesia from "@svg-maps/indonesia";
import type { CSSProperties } from "react";
import { provinces } from "@/data/cultureData";

// Server Component: path SVG (~110 KB) tidak ikut bundle JS. Klik/Enter pada [data-slug] ditangani <Game> lewat event delegation.
type SvgMap = { viewBox: string; locations: { id: string; name: string; path: string }[] };
const map = indonesia as SvgMap;
// --i: urutan provinsi (barat ke timur) untuk gelombang nyala saat peta muncul
const byMapId = new Map(provinces.map((p, i) => [p.mapId, { ...p, i }]));
// provinsi yang bisa dipilih digambar terakhir supaya garis hover/fokusnya tidak tertutup tetangga
const locations = map.locations.toSorted((a, b) => Number(byMapId.has(a.id)) - Number(byMapId.has(b.id)));

export function IndonesiaMap() {
  return (
    <svg viewBox={map.viewBox} className="peta block h-auto w-full" role="group" aria-label="Peta provinsi Indonesia">
      {locations.map((loc) => {
        const p = byMapId.get(loc.id);
        return p ? (
          <g key={loc.id} data-slug={p.slug} role="button" tabIndex={0} aria-label={`Pilih ${p.name}`} style={{ "--i": p.i } as CSSProperties}>
            <title>{`${p.name}: ${p.house.name}`}</title>
            <path d={loc.path} />
          </g>
        ) : (
          <path key={loc.id} d={loc.path}>
            <title>{`${loc.name} (segera hadir)`}</title>
          </path>
        );
      })}
    </svg>
  );
}
