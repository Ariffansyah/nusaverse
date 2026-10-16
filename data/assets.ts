import { sketchfab, type Credit } from "./cultureData.ts";

// Alas pamer (pack berisi 3 desain berjajar; Museum.tsx memakai yang tengah). `join: false` menjaga mesh terpisah.
export const props = [
  {
    id: "pedestal",
    ...sketchfab("ed296d2da43845f5a5b007c3af1cdff0", "Classical Museum Pedestals - Asset Pack", "Samuel F. Angrick-Johanns (Oneironauticus)"),
  },
];

// Tekstur lantai/dinding dan HDRI pencahayaan dari Poly Haven (CC0).
export const polyhaven = { floor: "herringbone_parquet", wall: "beige_wall_001", hdri: "museum_of_ethnography" };

// Perabot galeri dari Poly Haven (CC0), disimpan sebagai public/models/{slug}.glb: bangku di lorong, pot di sudut.
export const furniture = { bench: "chinese_sofa", plant: "potted_plant_02" };

export const shellCredits: Credit[] = [...Object.values(polyhaven), ...Object.values(furniture)].map((slug) => ({
  title: slug,
  author: "Poly Haven",
  license: "CC0",
  url: `https://polyhaven.com/a/${slug}`,
}));
