import indonesia from "@svg-maps/indonesia";
import { provinces } from "@/data/cultureData";

// Server Component: path SVG (~110 KB) tidak ikut bundle JS. Klik/Enter pada [data-slug] ditangani <Game> lewat event delegation.
type SvgMap = { viewBox: string; locations: { id: string; name: string; path: string }[] };
const map = indonesia as SvgMap;
const byMapId = new Map(provinces.map((p) => [p.mapId, p]));
// provinsi yang bisa dipilih digambar terakhir supaya garis hover/fokusnya tidak tertutup tetangga
const locations = map.locations.toSorted((a, b) => Number(byMapId.has(a.id)) - Number(byMapId.has(b.id)));

export function IndonesiaMap() {
  return (
    <div className="w-full">
      <svg viewBox={map.viewBox} className="peta h-auto w-full" role="group" aria-label="Peta provinsi Indonesia">
        {locations.map((loc) => {
          const p = byMapId.get(loc.id);
          return p ? (
            <g key={loc.id} data-slug={p.slug} role="button" tabIndex={0} aria-label={`Pilih ${p.name}`}>
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
      <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-kertas/80">
        {[
          ["bg-kunyit", "Bisa dijelajahi"],
          ["bg-kertas", "Dipilih"],
          ["bg-bata", "Sudah dapat cap"],
          ["bg-[#3d342c]", "Segera hadir"],
        ].map(([swatch, label]) => (
          <span key={label} className="flex items-center gap-2">
            <span aria-hidden className={`size-3.5 rounded-sm border border-kertas/60 ${swatch}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
