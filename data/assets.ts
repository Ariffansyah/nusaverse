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

// Suara koleksi di public/audio/koleksi/: rekaman yang diputar saat keterangannya dibuka, atau nada yang bisa dimainkan.
// Hanya rekaman berlisensi terbuka; alat musik lain (sasando, sape', kolintang, tifa, taganing) belum punya rekaman.
// about: asal rekaman, tampil di kartu koleksi. Perubahan dari rekaman asli (syarat CC BY) ditulis di judul kredit.
export type ExhibitSound = { credit: Credit; about: string } & ({ clip: string } | { notes: { label: string; file: string }[] });

const solfa = ["do", "re", "mi", "fa", "sol", "la", "si", "do'"];

export const exhibitSounds: Record<string, ExhibitSound> = {
  "foto-angklung": {
    clip: "ciung-wulung.mp3",
    about: "Angklung bas kelompok Ciung Wulung di Kasepuhan Ciptagelar.",
    credit: { title: "Ciung Wulung (diberi efek pudar)", author: "Parking Sun", license: "CC BY 4.0", url: "https://freesound.org/people/Parking%20Sun/sounds/328569/" },
  },
  angklung: {
    notes: ["c4", "d4", "e4", "f4", "g4", "a4", "b4", "c5"].map((n, i) => ({ label: solfa[i], file: `angklung-${n}.mp3` })),
    about: "Nada angklung dari Selasar Sunaryo, Bandung.",
    credit: { title: "bandung angklung (nada la dibuat dari nada sol yang dinaikkan dua semitone)", author: "Parking Sun", license: "CC BY 4.0", url: "https://freesound.org/people/Parking%20Sun/packs/4799/" },
  },
  "foto-kecak": {
    clip: "kecak.mp3",
    about: "Pertunjukan kecak di Paviliun Indonesia, World Expo Shanghai.",
    credit: { title: "Kecak - Monkey Chant (dipotong 30 detik)", author: "RTB45", license: "CC BY 4.0", url: "https://freesound.org/people/RTB45/sounds/191839/" },
  },
  "foto-talempong": {
    notes: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), file: `talempong-${n}.mp3` })),
    about: "Lima talempong pacik dari Sumatera Barat.",
    credit: { title: "Talempong Pacik", author: "ixnixnixn", license: "CC0", url: "https://freesound.org/people/ixnixnixn/packs/13629/" },
  },
  "gambus-pontianak": {
    clip: "gambus-kutai.mp3",
    about: "Rekaman gambus Kutai (Kalimantan Timur), bukan gambus Pontianak.",
    credit: {
      title: "Sample Suara Gambus Kutai (diubah ke MP3, diberi efek pudar)",
      author: "Athar Danish Zahwan",
      license: "CC BY-SA 4.0",
      url: "https://commons.wikimedia.org/wiki/File:Sample_Suara_Gambus_Kutai_(Nada_Basic).wav",
    },
  },
};

// Narasi pemandu (public/audio/pemandu/) dibacakan suara AI dari naskah guideScript, lewat `pnpm guide`.
export const guideCredit: Credit = {
  title: "Narasi pemandu tiap provinsi (suara AI)",
  author: "Gemini TTS, Google",
  license: "dibuat dengan AI",
  url: "https://ai.google.dev/gemini-api/docs/speech-generation",
};

// Efek suara (lib/sfx.ts) dipilih dari paket audio Kenney (CC0), dikonversi ke public/audio/sfx/*.mp3.
export const sfxCredits: Credit[] = ["Interface Sounds", "RPG Audio", "Impact Sounds", "Music Jingles"].map((title) => ({
  title,
  author: "Kenney",
  license: "CC0",
  url: `https://kenney.nl/assets/${title.toLowerCase().replace(" ", "-")}`,
}));
