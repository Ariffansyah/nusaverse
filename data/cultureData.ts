export type Item = { name: string; description: string };

export type Question = { q: string; options: string[]; answer: number };

export type Credit = { title: string; author: string; license: string; url: string };

// Jenis koleksi: label di kartu, misi kurator, dan album. Model "bangunan" di lorong tampil besar di atas panggung.
export const kinds = {
  bangunan: "Bangunan & monumen",
  busana: "Busana & kain",
  kuliner: "Kuliner",
  seni: "Seni & musik",
  tradisi: "Tradisi & upacara",
  benda: "Benda pusaka",
  alam: "Alam & satwa",
} as const;
export type Kind = keyof typeof kinds;

// Koleksi museum. Exhibit pertama = pusat ruangan (wajib model). File diunduh oleh `pnpm assets`.
export type Exhibit = {
  id: string; // public/models/{id}.glb untuk Sketchfab, public/images/{id}.jpg untuk Commons
  kind: Kind;
  title: string;
  description: string;
  height: number; // tinggi tampil di museum (meter); model diskalakan otomatis
  turn?: number; // derajat putaran tegak, untuk model yang sisi depannya tidak menghadap pengunjung
  source: { type: "sketchfab"; uid: string; simplify?: number } | { type: "commons"; file: string };
  credit: Credit;
};

export const sketchfab = (uid: string, title: string, author: string, license = "CC BY 4.0", simplify?: number) => ({
  source: { type: "sketchfab" as const, uid, simplify },
  credit: { title, author, license, url: `https://sketchfab.com/3d-models/${uid}` },
});

export const commons = (file: string, author: string, license: string) => ({
  source: { type: "commons" as const, file },
  credit: { title: file, author, license, url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(" ", "_"))}` },
});

// Urutan tampil di peta dan paspor; lengkap satu pulau = satu lencana.
export const islands = ["Sumatra", "Jawa", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Maluku", "Papua"] as const;
export type Island = (typeof islands)[number];

export type Province = {
  slug: string; // segmen URL /provinsi/[slug], huruf kecil dan tanda hubung saja
  mapId: string; // id path di @svg-maps/indonesia
  island: Island;
  name: string;
  summary: string;
  house: Item;
  attire: Item;
  dance: Item;
  music: { song: string; instrument: string; audio?: string }; // audio: file di public/audio
  history: string;
  exhibits: Exhibit[];
  quiz: Question[];
};

export const provinces: Province[] = [
  {
    slug: "aceh",
    mapId: "id-ac",
    island: "Sumatra",
    name: "Aceh",
    summary:
      "Serambi Mekah di ujung utara Sumatra. Kesultanan Aceh pernah menjadi kekuatan dagang dan pusat pendidikan Islam di Asia Tenggara.",
    house: {
      name: "Rumoh Aceh (Krong Bade)",
      description:
        "Rumah panggung kayu dengan tangga di depan dan dinding berukir. Kolongnya yang tinggi melindungi dari banjir dan binatang buas, sekaligus tempat menyimpan hasil panen.",
    },
    attire: {
      name: "Ulee Balang",
      description:
        "Laki-laki memakai baju meukeusah hitam bersulam emas, kupiah meukeutop, dan rencong di pinggang. Perempuan memakai baju kurung dengan perhiasan dahi patam dhoe.",
    },
    dance: {
      name: "Tari Saman",
      description:
        "Penari duduk berbaris rapat, menepuk dada dan paha serta mengayunkan badan serempak dengan sangat cepat sambil melantunkan syair. Berasal dari suku Gayo dan diakui UNESCO pada 2011.",
    },
    music: { song: "Bungong Jeumpa", instrument: "Serune kalee dan rapa'i" },
    history:
      "Kesultanan Aceh Darussalam mencapai puncak kejayaan di bawah Sultan Iskandar Muda (1607–1636). Aceh juga dikenal lewat perlawanan panjang terhadap Belanda, dengan tokoh seperti Teuku Umar dan Cut Nyak Dhien.",
    exhibits: [
      {
        id: "krong-bade",
        kind: "bangunan",
        title: "Rumoh Aceh (Krong Bade)",
        description:
          "Rumah panggung kayu Aceh dengan tangga di depan. Kolong rumah dipakai untuk menyimpan padi dan alat kerja, juga tempat perempuan menenun.",
        height: 3.0,
        ...sketchfab("8d131cf689a64016aedf96875811c307", "Rumah Krong Bade Aceh", "bangfikri"),
      },
      {
        id: "rencong",
        kind: "benda",
        title: "Rencong",
        description: "Senjata tikam khas Aceh dengan gagang melengkung. Dulu diselipkan di pinggang sebagai lambang keberanian dan martabat pemakainya.",
        height: 0.5,
        ...sketchfab("1626e94c3bf74cef9c75afce63be1a93", "Rencong Aceh", "apasipepgapuak"),
      },
      {
        id: "foto-saman",
        kind: "seni",
        title: "Tari Saman",
        description: "Penari Saman bergerak serempak dalam satu baris, hanya diiringi tepukan tangan, tepukan dada, dan syair.",
        height: 1.5,
        ...commons("Penari Saman Aceh.jpg", "Muhammad Iqbal", "CC BY-SA 4.0"),
      },
      {
        id: "foto-baiturrahman",
        kind: "bangunan",
        title: "Masjid Raya Baiturrahman",
        description:
          "Masjid di pusat Banda Aceh, dibangun ulang pada 1879–1881 setelah masjid lama terbakar dalam perang melawan Belanda. Masjid ini tetap berdiri saat tsunami 2004.",
        height: 1.5,
        ...commons("Meuseujid Raya Bayturrahman.JPG", "Si Gam Acèh", "CC BY-SA 3.0"),
      },
      {
        id: "baju-adat-aceh",
        kind: "busana",
        title: "Busana Pengantin Aceh",
        description:
          "Pengantin laki-laki memakai baju meukeusah, kupiah meukeutop, dan rencong; pengantin perempuan memakai baju kurung dengan mahkota keemasan.",
        height: 1.8,
        ...sketchfab("00e4158e812a47beab0e16d71192db69", "Baju Adat Aceh", "FractiousFlyer", "CC BY 4.0", 0.15),
      },
      {
        id: "foto-pltd-apung",
        kind: "bangunan",
        title: "PLTD Apung",
        description: "Kapal pembangkit listrik seberat 2.600 ton yang terseret tsunami 2004 sekitar 5 km ke daratan Banda Aceh. Kini menjadi monumen peringatan.",
        height: 1.5,
        ...commons("PLTD Apung.jpg", "Hillun Vilayl Napis", "CC BY-SA 4.0"),
      },
      {
        id: "foto-seudati",
        kind: "seni",
        title: "Tari Seudati",
        description:
          "Tari laki-laki Aceh dengan petikan jari, tepukan dada, dan hentakan kaki. Foto di Samalanga pada masa kolonial, koleksi Tropenmuseum.",
        height: 1.4,
        ...commons("COLLECTIE TROPENMUSEUM Sedatidans te Samalanga TMnr 10004857.jpg", "Tropenmuseum", "CC BY-SA 3.0"),
      },
      {
        id: "foto-gunongan",
        kind: "bangunan",
        title: "Gunongan",
        description:
          "Bangunan putih bersusun di Banda Aceh yang dibangun Sultan Iskandar Muda untuk permaisurinya, Putroe Phang dari Pahang, agar ia tidak rindu pada perbukitan kampung halamannya.",
        height: 1.5,
        ...commons("Gunongan Putroë Phang.JPG", "Si Gam", "CC BY-SA 3.0"),
      },
      {
        id: "foto-rumoh-cut-nyak-dhien",
        kind: "bangunan",
        title: "Rumoh Cut Nyak Dhien",
        description: "Replika rumah pahlawan Cut Nyak Dhien di Lampisang, Aceh Besar. Rumah aslinya dibakar Belanda pada 1896.",
        height: 1.4,
        ...commons("Rumoh Cut Nyak Dhien.jpg", "Arini izzati", "CC BY-SA 4.0"),
      },
      {
        id: "foto-ratoh-jaroe",
        kind: "seni",
        title: "Tari Ratoh Jaroe",
        description: "Penari perempuan duduk berbaris dan bergerak serempak dengan tepukan cepat. Tarian ini sering dikira Saman, padahal Saman dibawakan laki-laki.",
        height: 1.5,
        ...commons("Ratoh Jaroe Dance.jpg", "Gerdie Hutomo Nurhadi", "CC BY-SA 4.0"),
      },
      {
        id: "foto-kopi-gayo",
        kind: "kuliner",
        title: "Kebun Kopi Gayo",
        description: "Kopi arabika tumbuh di Dataran Tinggi Gayo, Aceh Tengah, dan menjadi salah satu kopi Indonesia yang terkenal di dunia.",
        height: 1.6,
        ...commons("Kopi gayo.jpg", "Chairu bardhan", "CC BY-SA 4.0"),
      },
      {
        id: "foto-didong",
        kind: "seni",
        title: "Didong",
        description: "Seni pertunjukan Gayo: para ceh melantunkan syair bersahutan sambil bertepuk tangan dan menepuk bantal kecil, sering semalam suntuk.",
        height: 1.4,
        ...commons("Didong Nalo.jpg", "Iwan IUI", "CC BY-SA 4.0"),
      },
      {
        id: "foto-museum-tsunami",
        kind: "bangunan",
        title: "Museum Tsunami Aceh",
        description:
          "Museum untuk mengenang korban tsunami 26 Desember 2004, dirancang Ridwan Kamil. Gedungnya juga berfungsi sebagai tempat evakuasi bila bencana datang lagi.",
        height: 1.4,
        ...commons("Aceh Tsunami Museum site visit; February 2020 (25).jpg", "Rachmat04", "CC BY-SA 3.0"),
      },
      {
        id: "foto-mie-aceh",
        kind: "kuliner",
        title: "Mie Aceh",
        description:
          "Mi kuning tebal dimasak dengan kuah kari pedas berempah, disajikan dengan daging sapi, kambing, atau makanan laut, plus emping dan acar bawang.",
        height: 1.5,
        ...commons("Mie Aceh.jpg", "Yasmina Haryono", "CC BY-SA 2.0"),
      },
      {
        id: "foto-timphan",
        kind: "kuliner",
        title: "Timphan",
        description:
          "Kue dari tepung ketan dan pisang berisi srikaya (asoe kaya) atau kelapa, dibungkus daun pisang muda lalu dikukus. Hampir selalu tersedia saat Lebaran di Aceh.",
        height: 1.4,
        ...commons("Timphan Asoe Kaya.jpg", "Si Gam", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Tari Saman berasal dari suku...",
        options: ["Gayo", "Alas", "Tamiang", "Singkil"],
        answer: 0,
      },
      {
        q: "Senjata tradisional khas Aceh adalah...",
        options: ["Kujang", "Rencong", "Mandau", "Badik"],
        answer: 1,
      },
      {
        q: "Sultan yang membawa Kesultanan Aceh ke puncak kejayaan adalah...",
        options: ["Sultan Hasanuddin", "Sultan Agung", "Sultan Iskandar Muda", "Sultan Ageng Tirtayasa"],
        answer: 2,
      },
    ],
  },
  {
    slug: "sumatera-utara",
    mapId: "id-su",
    island: "Sumatra",
    name: "Sumatera Utara",
    summary:
      "Tanah suku Batak (Toba, Karo, Simalungun, Pakpak, Mandailing, Angkola) dan Melayu Deli, dengan Danau Toba, danau vulkanik terbesar di dunia.",
    house: {
      name: "Rumah Bolon",
      description:
        "Rumah panggung Batak Toba beratap pelana tinggi yang ujungnya mencuat ke depan dan belakang. Dinding depannya dihias ukiran gorga berwarna merah, putih, dan hitam.",
    },
    attire: {
      name: "Ulos",
      description:
        "Kain tenun Batak yang diselempangkan di bahu atau dililitkan di badan. Dalam upacara adat, ulos diberikan (mangulosi) sebagai lambang kasih sayang dan restu.",
    },
    dance: {
      name: "Tor-tor",
      description:
        "Tarian Batak yang dibawakan dalam upacara adat dengan iringan gondang. Gerak tangannya pelan dan khidmat; dulu tor-tor juga bagian dari ritual.",
    },
    music: { song: "Butet", instrument: "Gondang dan taganing" },
    history:
      "Danau Toba terbentuk dari letusan supervulkan sekitar 74.000 tahun lalu. Di Padang Lawas berdiri kompleks Candi Bahal peninggalan Buddha, sementara Kesultanan Deli, yang membangun Istana Maimun, berpusat di Medan.",
    exhibits: [
      {
        id: "busana-ulos",
        kind: "busana",
        title: "Busana Ulos Batak",
        description:
          "Perempuan Batak berbusana adat: ulos diselempangkan di bahu dan dililit sebagai sarung. Ulos juga diberikan sebagai lambang restu dalam upacara adat.",
        height: 3.4,
        turn: 180,
        ...sketchfab("47328dde4d2f4676964fbfbc3b5029ce", "Batak traditional clothing—Indonesia", "Fadly.W"),
      },
      {
        id: "busana-batak-laki",
        kind: "busana",
        title: "Busana Adat Laki-laki Batak",
        description: "Busana laki-laki Batak dengan ulos di bahu dan ikat kepala tenun. Model ini dibuat dari foto orang sungguhan (fotogrametri).",
        height: 1.8,
        ...sketchfab("c0391d3108154981a10db06edeba0c83", "Pakaian Adat Batak Cowok", "Abim Project"),
      },
      {
        id: "taganing",
        kind: "seni",
        title: "Taganing",
        description:
          "Gendang Batak Toba dalam ansambel gondang sabangunan. Beberapa gendang bernada berbeda disusun berjajar dan ditabuh dengan dua stik.",
        height: 0.7,
        ...sketchfab("e8d60a4bdc304b2682fff330bd8c3df7", "Tagading/Gondang Batak", "Repni Ramadani"),
      },
      {
        id: "foto-rumah-bolon",
        kind: "bangunan",
        title: "Rumah Bolon",
        description: "Deretan rumah bolon Batak Toba dengan atap pelana yang ujungnya mencuat tinggi.",
        height: 1.5,
        ...commons("Rumah Bolon.jpg", "Nurul Ichlasiah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tortor",
        kind: "seni",
        title: "Tari Tor-tor",
        description: "Penari tor-tor berbusana ulos menari dengan gerak tangan yang pelan dan khidmat.",
        height: 1.5,
        ...commons("Tor-Tor Dance.jpg", "Angeline Claudia", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sigale-gale",
        kind: "seni",
        title: "Sigale-gale",
        description:
          "Boneka kayu seukuran manusia dari Samosir yang digerakkan dengan tali sehingga bisa menari tor-tor. Dulu dimainkan dalam upacara kematian.",
        height: 1.5,
        ...commons("Tari Sigale-gale Pulau Samosir.jpg", "Dan Lundberg", "CC BY-SA 2.0"),
      },
      {
        id: "foto-istana-maimun",
        kind: "bangunan",
        title: "Istana Maimun",
        description:
          "Istana Kesultanan Deli di Medan, selesai dibangun pada 1891 oleh Sultan Ma'mun Al Rasyid. Arsitekturnya memadukan gaya Melayu, Timur Tengah, India, dan Eropa.",
        height: 1.5,
        ...commons("Maimun Palace Medan Indonesia.jpg", "Mimihitam", "CC BY-SA 4.0"),
      },
      {
        id: "foto-al-mashun",
        kind: "bangunan",
        title: "Masjid Raya Al-Mashun",
        description:
          "Masjid Kesultanan Deli di Medan yang dibangun pada 1906–1909, berdenah segi delapan dengan kubah hitam dan sentuhan gaya Maroko, India, dan Eropa.",
        height: 1.5,
        ...commons("Masjid Raya Al Mashun Medan.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bika-ambon",
        kind: "kuliner",
        title: "Bika Ambon",
        description:
          "Kue khas Medan dari tapioka, telur, santan, dan nira yang difermentasi sehingga berserat seperti sarang lebah. Namanya konon dari Jalan Ambon di Medan, tempat kue ini mula-mula populer.",
        height: 1.4,
        ...commons("Bika ambon pandan.jpg", "Agus Damanik", "CC BY-SA 4.0"),
      },
      {
        id: "foto-arsik",
        kind: "kuliner",
        title: "Arsik Ikan Mas",
        description:
          "Ikan mas dimasak dengan bumbu kuning, andaliman, dan asam cikala. Dalam adat Batak, ikan mas arsik diberikan sebagai doa restu, misalnya kepada pengantin.",
        height: 1.4,
        ...commons("Arsik Ikan Mas 1.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Kain tenun Batak yang diberikan sebagai lambang restu dalam upacara adat adalah...",
        options: ["Songket", "Tapis", "Ulos", "Sasirangan"],
        answer: 2,
      },
      {
        q: "Danau Toba terbentuk dari...",
        options: ["Letusan supervulkan", "Pergeseran gletser", "Hantaman meteor", "Bendungan buatan"],
        answer: 0,
      },
      {
        q: "Boneka kayu dari Samosir yang bisa menari tor-tor disebut...",
        options: ["Ondel-ondel", "Wayang golek", "Loro blonyo", "Sigale-gale"],
        answer: 3,
      },
    ],
  },
  {
    slug: "sumatera-barat",
    mapId: "id-sb",
    island: "Sumatra",
    name: "Sumatera Barat",
    summary:
      "Tanah Minangkabau, dikenal sebagai salah satu masyarakat matrilineal terbesar di dunia: garis keturunan dan harta pusaka diwariskan melalui ibu.",
    house: {
      name: "Rumah Gadang",
      description:
        "Rumah panggung kayu dengan atap gonjong yang melengkung tajam ke atas, sering diibaratkan tanduk kerbau. Dihuni keluarga besar dari satu garis ibu.",
    },
    attire: {
      name: "Bundo Kanduang",
      description:
        "Busana perempuan Minang dengan penutup kepala tingkuluak berbentuk tanduk, melambangkan peran ibu sebagai pemimpin rumah gadang.",
    },
    dance: {
      name: "Tari Piring",
      description:
        "Penari mengayunkan piring di telapak tangan dengan gerak cepat. Dulu dipersembahkan sebagai ungkapan syukur atas panen.",
    },
    music: { song: "Ayam Den Lapeh", instrument: "Talempong dan saluang" },
    history:
      "Kerajaan Pagaruyung di Tanah Datar menjadi pusat budaya Minangkabau sejak abad ke-14. Falsafah adatnya berbunyi \"adat basandi syarak, syarak basandi Kitabullah\".",
    exhibits: [
      {
        id: "rumah-gadang",
        kind: "bangunan",
        title: "Rumah Gadang",
        description:
          "Rumah adat Minangkabau. Atap gonjong bertingkat dan lantai panggung kayunya dirancang untuk keluarga besar dari satu garis ibu.",
        height: 3.2,
        ...sketchfab("be692baf8eb34cd99eb7b37ad531256c", "Rumah Gadang Sumatra Barat Indonesia", "bangfikri"),
      },
      {
        id: "penari-piring",
        kind: "seni",
        title: "Penari Piring",
        description:
          "Penari perempuan dengan busana merah bersulam emas dan penutup kepala bertanduk, membawa piring di kedua telapak tangan.",
        height: 1.7,
        ...sketchfab("fe5a227721504211b3c13d0f28076bc6", "Tari Piring Sumatera", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.3),
      },
      {
        id: "tambua",
        kind: "seni",
        title: "Tambua",
        description:
          "Gendang besar Minangkabau yang ditabuh beramai-ramai dalam arak-arakan tambua tansa, terutama di Pariaman.",
        height: 0.8,
        ...sketchfab("ddb267b5578f486a833031ae2342612b", "Tambua (minang tribe drum)", "apasipepgapuak", "CC BY 4.0", 0.3),
      },
      {
        id: "jam-gadang",
        kind: "bangunan",
        title: "Jam Gadang (miniatur)",
        description:
          "Menara jam di pusat Bukittinggi, dibangun pada 1926. Atapnya kini berbentuk gonjong seperti rumah gadang.",
        height: 2.8,
        ...sketchfab("3308f98df3e9434caafd77c779c5dd2a", "Jam Gadang - Big Clock", "dekahobby"),
      },
      {
        id: "foto-tari-piring",
        kind: "seni",
        title: "Tari Piring di Pesisir Selatan",
        description: "Penari mengayunkan piring sambil bergerak cepat, bahkan di atas pecahan kaca pada pertunjukan tertentu.",
        height: 1.5,
        ...commons("Tari Piring di Pesisir Selatan.jpg", "Syofiardi Bachyul Jb", "CC BY-SA 4.0"),
      },
      {
        id: "foto-talempong",
        kind: "seni",
        title: "Talempong",
        description: "Deretan gong kecil dari logam yang dimainkan bersahutan, mengiringi tari dan upacara adat Minang.",
        height: 1.3,
        ...commons("Talempong diatonis 2.jpg", "Pemerintah Provinsi DKI Jakarta", "Public domain"),
      },
      {
        id: "rendang",
        kind: "kuliner",
        title: "Rendang",
        description:
          "Daging sapi dimasak berjam-jam dalam santan dan rempah sampai kering dan gelap. Orang Minang memaknai bahannya sebagai unsur masyarakat: daging, kelapa, cabai, dan bumbu.",
        height: 0.45,
        ...sketchfab("756ca6f48213425284ad4da914c86fd3", "Makanan Rendang", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.1),
      },
      {
        id: "foto-pagaruyung",
        kind: "bangunan",
        title: "Istano Basa Pagaruyung",
        description:
          "Replika istana Kerajaan Pagaruyung di Tanah Datar dengan atap gonjong bertingkat. Bangunan ini beberapa kali dibangun ulang, terakhir setelah terbakar pada 2007.",
        height: 1.5,
        ...commons("Istano Rajo Basa Pagaruyung.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sate-padang",
        kind: "kuliner",
        title: "Sate Padang",
        description: "Sate daging dan lidah sapi bersiram kuah kental kuning atau merah dari tepung beras dan rempah, disantap dengan ketupat.",
        height: 1.4,
        ...commons("Sate padang.jpg", "Sabjan Badio", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bundo-kanduang",
        kind: "busana",
        title: "Busana Bundo Kanduang",
        description:
          "Pakaian kebesaran perempuan Minang: baju kurung, kain songket, dan tengkuluak tanduak, tutup kepala berbentuk tanduk kerbau seperti atap gonjong.",
        height: 1.6,
        ...commons("Pakaian Bundo Kanduang.jpg", "Anggi Silvia", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Bentuk atap Rumah Gadang sering diibaratkan apa?",
        options: ["Sayap burung", "Tanduk kerbau", "Perahu", "Payung"],
        answer: 1,
      },
      {
        q: "Garis keturunan Minangkabau diwariskan melalui pihak...",
        options: ["Ayah", "Kakek", "Ibu", "Raja"],
        answer: 2,
      },
      {
        q: "Tarian Minang yang memakai piring sebagai properti adalah...",
        options: ["Tari Piring", "Tari Saman", "Tari Kecak", "Tari Jaipong"],
        answer: 0,
      },
    ],
  },
  {
    slug: "riau",
    mapId: "id-ri",
    island: "Sumatra",
    name: "Riau",
    summary:
      "Tanah Melayu di aliran Sungai Siak, Kampar, Indragiri, dan Kuantan. Bahasa Melayu Riau menjadi dasar bahasa Indonesia.",
    house: {
      name: "Rumah Selaso Jatuh Kembar",
      description:
        "Rumah panggung Melayu dengan dua selasar (serambi) yang lantainya lebih rendah dari ruang tengah. Dipakai sebagai balai musyawarah adat, bukan tempat tinggal.",
    },
    attire: {
      name: "Baju Kurung Cekak Musang dan Kebaya Labuh",
      description:
        "Laki-laki memakai baju kurung cekak musang berkerah tegak dengan kain samping songket dan tanjak di kepala. Perempuan memakai kebaya labuh yang panjangnya sampai lutut.",
    },
    dance: {
      name: "Tari Zapin",
      description:
        "Tari Melayu berakar dari tradisi Arab, dibawakan dengan langkah kaki yang cepat dan lincah diiringi gambus dan marwas. Dulu hanya ditarikan laki-laki.",
    },
    music: { song: "Lancang Kuning", instrument: "Gambus dan kompang" },
    history:
      "Kesultanan Siak Sri Inderapura berdiri pada 1723. Sultan terakhirnya, Syarif Kasim II, menyatakan bergabung dengan Republik Indonesia dan menyumbangkan hartanya untuk perjuangan. Jauh sebelumnya, Candi Muara Takus di Kampar menjadi tempat peribadatan Buddha.",
    exhibits: [
      {
        id: "tari-persembahan",
        kind: "seni",
        title: "Tari Persembahan",
        description:
          "Tari penyambutan tamu Melayu Riau. Lima penari perempuan, salah satunya membawa tepak berisi sirih yang dipersembahkan kepada tamu.",
        height: 2.6,
        ...sketchfab("6b61ab8ab2164c75837615dd859a438d", "Tari Persembahan Riau", "Kalilawulan_"),
      },
      {
        id: "pakaian-melayu-laki",
        kind: "busana",
        title: "Busana Melayu Laki-laki",
        description: "Baju kurung dengan kain samping yang dililit di pinggang dan penutup kepala, busana resmi laki-laki Melayu.",
        height: 1.75,
        ...sketchfab("ef707ae8d39e4be897356f7c42ef62de", "Pakaian Melayu Laki-Laki", "Iwan789", "CC BY 4.0", 0.4),
      },
      {
        id: "foto-muara-takus",
        kind: "bangunan",
        title: "Candi Muara Takus",
        description: "Kompleks candi Buddha dari bata dan batu pasir di Kampar. Stupa Mahligai yang ramping menjadi bangunan yang paling dikenal.",
        height: 1.5,
        ...commons("Candi Muara Takus (1).jpg", "Taufik Hadris", "CC BY 4.0"),
      },
      {
        id: "foto-istana-siak",
        kind: "bangunan",
        title: "Istana Siak",
        description: "Istana Asserayah Hasyimiah, dibangun Sultan Syarif Hasyim pada 1889 dengan perpaduan gaya Melayu, Arab, dan Eropa.",
        height: 1.5,
        ...commons("Istana Kerajaan Siak (2).jpg", "Wagino 20100516", "CC BY-SA 3.0"),
      },
      {
        id: "foto-pacu-jalur",
        kind: "tradisi",
        title: "Pacu Jalur",
        description: "Lomba perahu panjang dari batang kayu utuh di Sungai Kuantan. Satu jalur bisa didayung 40 sampai 60 orang.",
        height: 1.5,
        ...commons("Culture Pacu Jalur Kuansing.jpg", "Nocomentapapun", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bono",
        kind: "alam",
        title: "Berselancar di Bono",
        description:
          "Bono adalah gelombang pasang yang masuk ke muara Sungai Kampar dan bisa berjalan puluhan kilometer ke hulu. Kini jadi tujuan peselancar dari banyak negara.",
        height: 1.5,
        ...commons("Bekudo Bono.jpg", "Domiyanto1977", "CC BY-SA 4.0"),
      },
      {
        id: "foto-lancang-kuning",
        kind: "benda",
        title: "Lancang Kuning (miniatur)",
        description: "Perahu kebesaran raja Melayu berwarna kuning, juga judul lagu daerah Riau yang paling dikenal.",
        height: 1.4,
        ...commons("Miniatur Lancang Kuning.jpg", "Rahmaziz", "CC BY-SA 4.0"),
      },
      {
        id: "foto-selaso-jatuh",
        kind: "bangunan",
        title: "Rumah Adat Riau",
        description: "Rumah adat Riau di Taman Mini Indonesia Indah, dengan selasar yang lantainya lebih rendah dari ruang utama.",
        height: 1.5,
        ...commons("Rumah Adat Balai Selasar Jatuh Tunggal, Rumah Adat Riau di Taman Mini Indonesia Indah.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-gulai-patin",
        kind: "kuliner",
        title: "Gulai Ikan Patin",
        description: "Ikan patin dalam kuah santan kuning berbumbu kunyit dan cabai, hidangan sehari-hari orang Melayu di tepian Sungai Kampar dan Siak.",
        height: 1.4,
        ...commons("Gulai Ikan Patin 101601.jpg", "Abdul Hanif Arromy", "CC BY 4.0"),
      },
      {
        id: "foto-bolu-kemojo",
        kind: "kuliner",
        title: "Bolu Kemojo",
        description: "Kue hijau beraroma pandan dari Pekanbaru yang dipanggang dalam cetakan berbentuk bunga kamboja (kemojo), asal namanya.",
        height: 1.4,
        ...commons("Bolu Kemojo.jpg", "Marketing DB", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Lagu daerah Riau tentang perahu kebesaran raja Melayu adalah...",
        options: ["Lancang Kuning", "Ampar-Ampar Pisang", "Rasa Sayange", "Butet"],
        answer: 0,
      },
      {
        q: "Gelombang pasang di Sungai Kampar yang dipakai untuk berselancar disebut...",
        options: ["Pacu", "Bono", "Nyale", "Tabot"],
        answer: 1,
      },
      {
        q: "Sultan Siak yang bergabung dengan Republik dan menyumbangkan hartanya adalah...",
        options: ["Sultan Hasanuddin", "Sultan Agung", "Sultan Syarif Kasim II", "Sultan Mahmud Badaruddin II"],
        answer: 2,
      },
    ],
  },
  {
    slug: "kepulauan-riau",
    mapId: "id-kr",
    island: "Sumatra",
    name: "Kepulauan Riau",
    summary:
      "Ribuan pulau di Selat Malaka dan Laut Natuna. Pulau Penyengat menyimpan jejak Kesultanan Riau-Lingga dan pujangga Raja Ali Haji.",
    house: {
      name: "Rumah Belah Bubung",
      description:
        "Rumah panggung Melayu beratap pelana yang seolah terbelah di bubungannya, disebut juga rumah rabung. Kolongnya tinggi dan dindingnya dari papan kayu.",
    },
    attire: {
      name: "Kebaya Labuh dan Teluk Belanga",
      description:
        "Perempuan memakai kebaya labuh yang panjang dengan kain songket; laki-laki memakai baju teluk belanga berkerah bulat dengan kain samping.",
    },
    dance: {
      name: "Joget Dangkong",
      description:
        "Tari pergaulan yang lahir di pulau-pulau Kepri. Penari perempuan mengajak penonton menari bergantian, diiringi gendang, biola, dan gong.",
    },
    music: { song: "Segantang Lada", instrument: "Gendang, biola, dan tetawak" },
    history:
      "Kesultanan Riau-Lingga berpusat di Daik Lingga dan Pulau Penyengat sampai sultan terakhirnya dimakzulkan Belanda pada 1911. Di Penyengat, Raja Ali Haji menulis Gurindam Dua Belas (1847) dan kitab tata bahasa Melayu yang ikut membentuk bahasa Indonesia. Kepulauan Riau berpisah dari Provinsi Riau pada 2002.",
    exhibits: [
      {
        id: "gudang-mesiu",
        kind: "bangunan",
        title: "Gedung Mesiu Pulau Penyengat",
        description:
          "Bangunan bertembok tebal peninggalan Kesultanan Riau-Lingga untuk menyimpan mesiu. Model ini dipindai dengan drone dari 1.126 foto (fotogrametri).",
        height: 3.2,
        ...sketchfab("32d0f1779b9e4113840a2097e42d0821", "Gudang Mesiu Kepulauan Riau", "fadilah a", "CC BY 4.0", 0.08),
      },
      {
        id: "pakaian-melayu-perempuan",
        kind: "busana",
        title: "Busana Melayu Perempuan",
        description: "Baju kurung dengan kain sarung dan selendang, busana sehari-hari sekaligus busana resmi perempuan Melayu.",
        height: 1.7,
        ...sketchfab("dd3c0a669de142fa99b0267aa3142c72", "Pakaian Melayu Perempuan", "Iwan789", "CC BY 4.0", 0.4),
      },
      {
        id: "foto-masjid-penyengat",
        kind: "bangunan",
        title: "Masjid Raya Sultan Riau",
        description: "Masjid kuning di Pulau Penyengat yang dibangun pada 1832. Konon adukan kapurnya dicampur putih telur.",
        height: 1.5,
        ...commons("Masjid Raya Sultan Riau di Pulau Penyengat.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-gurindam",
        kind: "seni",
        title: "Gurindam Dua Belas",
        description: "Dua belas pasal nasihat karya Raja Ali Haji (1847), dipajang pada papan marmer. Raja Ali Haji dinobatkan sebagai pahlawan nasional pada 2004.",
        height: 1.3,
        ...commons("Gurindam traditional Malay poetry.jpg", "Edogang1", "CC BY 4.0"),
      },
      {
        id: "foto-mak-yong",
        kind: "seni",
        title: "Mak Yong",
        description: "Teater tari Melayu yang memadukan lakon, nyanyian, dan tari. Di Kepri, sebagian pemainnya memakai topeng; Mak Yong masih dipentaskan di Bintan.",
        height: 1.5,
        ...commons("Mak Yong Bintan.jpg", "Amriyadibahar", "CC BY-SA 4.0"),
      },
      {
        id: "foto-istana-kantor",
        kind: "bangunan",
        title: "Istana Kantor",
        description: "Bekas istana sekaligus kantor Yang Dipertuan Muda Riau di Pulau Penyengat, dibangun pada pertengahan abad ke-19.",
        height: 1.5,
        ...commons("Istana kantor.jpg", "Masgatotkaca", "CC BY-SA 3.0"),
      },
      {
        id: "foto-barelang",
        kind: "bangunan",
        title: "Jembatan Barelang",
        description:
          "Rangkaian enam jembatan yang menyambung Pulau Batam, Rempang, dan Galang. Jembatan pertamanya, Tengku Fisabilillah, adalah jembatan kabel dengan bentang utama 350 m.",
        height: 1.5,
        ...commons("Jembatan Barelang I.jpg", "Cun Cun", "CC BY-SA 4.0"),
      },
      {
        id: "foto-gonggong",
        kind: "kuliner",
        title: "Gonggong",
        description: "Siput laut khas perairan Kepulauan Riau yang direbus lalu dicungkil dengan tusuk gigi. Patung gonggong menjadi ikon kota Tanjungpinang.",
        height: 1.4,
        ...commons("Siput Gonggong.jpg", "alantankenghoe", "CC BY 2.0"),
      },
      {
        id: "foto-otak-otak",
        kind: "kuliner",
        title: "Otak-otak",
        description: "Lumatan ikan tenggiri berbumbu yang dibungkus daun kelapa atau pisang lalu dibakar, dicocol sambal kacang pedas.",
        height: 1.4,
        ...commons("Otak-otak.jpg", "Serenity", "CC BY-SA 3.0"),
      },
    ],
    quiz: [
      {
        q: "Pujangga dari Pulau Penyengat yang menulis Gurindam Dua Belas adalah...",
        options: ["Hamzah Fansuri", "Raja Ali Haji", "Chairil Anwar", "Amir Hamzah"],
        answer: 1,
      },
      {
        q: "Kepulauan Riau resmi menjadi provinsi sendiri pada tahun...",
        options: ["1957", "1999", "2002", "2012"],
        answer: 2,
      },
      {
        q: "Teater tari Melayu yang masih dipentaskan di Bintan adalah...",
        options: ["Mak Yong", "Lenong", "Ludruk", "Randai"],
        answer: 0,
      },
    ],
  },
  {
    slug: "jambi",
    mapId: "id-ja",
    island: "Sumatra",
    name: "Jambi",
    summary:
      "Provinsi di aliran Sungai Batanghari, tempat kompleks percandian Muaro Jambi, salah satu situs Buddha terluas di Asia Tenggara.",
    house: {
      name: "Kajang Lako",
      description:
        "Rumah panggung panjang Melayu Jambi. Atapnya melengkung seperti perahu dengan ujung yang naik ke atas, dan ruang dalamnya dibagi menurut fungsi adat.",
    },
    attire: {
      name: "Baju Kurung Tanggung",
      description:
        "Perempuan memakai baju kurung tanggung dengan kain songket dan hiasan kepala pesangkon; laki-laki memakai baju kurung tanggung, celana, dan penutup kepala lacak.",
    },
    dance: {
      name: "Tari Sekapur Sirih",
      description: "Tari penyambutan tamu. Penari perempuan membawa cerana berisi sirih, lambang keterbukaan dan rasa hormat kepada tamu.",
    },
    music: { song: "Injit-Injit Semut", instrument: "Kelintang kayu dan gambus" },
    history:
      "Muaro Jambi menjadi pusat pembelajaran Buddha sekitar abad ke-7 sampai ke-13. Kesultanan Jambi kemudian memerintah hingga awal abad ke-20; Sultan Thaha Syaifuddin dikenang karena perlawanannya terhadap Belanda.",
    exhibits: [
      {
        id: "kajang-lako",
        kind: "bangunan",
        title: "Kajang Lako",
        description: "Rumah panggung panjang Melayu Jambi dengan atap melengkung seperti perahu. Kolongnya tinggi untuk menghindari luapan sungai.",
        height: 3.0,
        ...sketchfab("deb909440e9c4f1999a25d9e4434a424", "Rumah Adat Tradisional Jambi Kajang Lako", "bangfikri"),
      },
      {
        id: "candi-muaro-jambi",
        kind: "bangunan",
        title: "Candi Muaro Jambi (model)",
        description:
          "Candi bata merah berundak dari kompleks Muaro Jambi. Puluhan candi dan gundukan bata (menapo) tersebar di tepi Batanghari.",
        height: 1.8,
        ...sketchfab("314dbb47891c44f19f0e0db4544790d4", "Candi+muaro+jambi", "marvin.l"),
      },
      {
        id: "foto-muaro-jambi",
        kind: "bangunan",
        title: "Situs Muaro Jambi",
        description: "Sisa candi bata di kawasan Muaro Jambi, di antara pepohonan tua di tepi Sungai Batanghari.",
        height: 1.5,
        ...commons("Muaro Jambi Temple - Muaro Jambi, JA (10 Mar 2023) 06.jpg", "Firzafp", "CC BY-SA 4.0"),
      },
      {
        id: "foto-batik-jambi",
        kind: "busana",
        title: "Batik Jambi",
        description: "Batik Jambi memakai motif dari alam sekitar, seperti angso duo (sepasang angsa) dan durian pecah.",
        height: 1.3,
        ...commons("Batik-jambi.jpg", "Aditya alakbar", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-seribu-tiang",
        kind: "bangunan",
        title: "Masjid Agung Al-Falah",
        description:
          "Dijuluki Masjid Seribu Tiang, berdiri di bekas lokasi istana Kesultanan Jambi. Ruang salatnya terbuka tanpa dinding, hanya dikelilingi deretan tiang.",
        height: 1.5,
        ...commons("Masjid Agung Al-Falah Jambi.jpg", "Adhmi", "CC BY-SA 4.0"),
      },
      {
        id: "foto-orang-rimba",
        kind: "tradisi",
        title: "Orang Rimba",
        description:
          "Orang Rimba (Suku Anak Dalam) di hutan hulu Tebo, difoto Tassilo Adam pada awal abad ke-20. Mereka hidup berpindah-pindah di hutan Jambi.",
        height: 1.3,
        ...commons(
          "COLLECTIE TROPENMUSEUM Kubu bevolking in een hut in het bos in de Boven-Tebo-streken in de residentie Djambi TMnr 60043256.jpg",
          "Tassilo Adam",
          "CC BY-SA 3.0",
        ),
      },
      {
        id: "foto-gentala-arasy",
        kind: "bangunan",
        title: "Jembatan Gentala Arasy",
        description:
          "Jembatan pejalan kaki melengkung di atas Sungai Batanghari, Kota Jambi, diresmikan pada 2015. Menaranya berisi museum sejarah Islam Jambi.",
        height: 1.5,
        ...commons("Jembatan Gentala Arasy - Kota Jambi, JA (12 Agustus 2023).jpg", "Firzafp", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tempoyak",
        kind: "kuliner",
        title: "Tempoyak Ikan Patin",
        description:
          "Tempoyak adalah durian yang difermentasi hingga asam. Di Jambi, tempoyak dimasak bersama ikan patin dan cabai menjadi gulai berkuah kuning.",
        height: 1.4,
        ...commons("Tempoyak Ikan Patin 2.JPG", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tengkuluk",
        kind: "busana",
        title: "Tengkuluk",
        description:
          "Penutup kepala perempuan Jambi dari kain batik atau songket yang dililit dan dibentuk dengan berbagai gaya, menandai daerah asal dan status pemakainya.",
        height: 1.6,
        ...commons("Tengkuluk Jambi.jpg", "Wasnisahmahdi", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Kompleks percandian Buddha yang luas di Jambi bernama...",
        options: ["Muara Takus", "Muaro Jambi", "Bahal", "Plaosan"],
        answer: 1,
      },
      {
        q: "Atap rumah adat Kajang Lako berbentuk seperti...",
        options: ["Perahu", "Tanduk kerbau", "Kerucut", "Payung"],
        answer: 0,
      },
      {
        q: "Tari penyambutan tamu dari Jambi adalah...",
        options: ["Tari Piring", "Tari Pendet", "Tari Saman", "Tari Sekapur Sirih"],
        answer: 3,
      },
    ],
  },
  {
    slug: "bengkulu",
    mapId: "id-be",
    island: "Sumatra",
    name: "Bengkulu",
    summary:
      "Pesisir barat Sumatra di kaki Bukit Barisan. Pernah menjadi pos dagang Inggris, tempat pengasingan Bung Karno, dan habitat bunga Rafflesia.",
    house: {
      name: "Rumah Bubungan Lima",
      description:
        "Rumah panggung kayu yang dinamai menurut atapnya yang berbubung lima. Kolongnya tinggi untuk menghindari banjir dan binatang, juga untuk menyimpan hasil kebun.",
    },
    attire: {
      name: "Busana Pengantin Bengkulu",
      description:
        "Pengantin perempuan memakai baju kurung beludru bersulam emas dan mahkota singal; pengantin laki-laki memakai jas, kain songket, dan destar.",
    },
    dance: {
      name: "Tari Andun",
      description: "Tari pergaulan dari Bengkulu Selatan yang dibawakan berpasangan pada pesta pernikahan, diiringi kolintang dan redap.",
    },
    music: { song: "Lalan Belek", instrument: "Dol" },
    history:
      "Inggris membangun Benteng Marlborough pada 1714–1719 dan menguasai Bengkulu sampai menukarnya dengan Malaka lewat Traktat London 1824. Bung Karno diasingkan di sini pada 1938–1942 dan bertemu Fatmawati, yang kelak menjahit bendera pusaka Merah Putih.",
    exhibits: [
      {
        id: "rafflesia",
        kind: "alam",
        title: "Rafflesia",
        description:
          "Bunga tanpa daun yang menumpang pada akar tumbuhan inang. Rafflesia arnoldii dari hutan Bengkulu bisa selebar satu meter. Model ini dipindai dari Rafflesia di Taman Nasional Gunung Gading, Sarawak.",
        height: 1.6,
        ...sketchfab("af22b00c74be4dd589b0ab14ce0da82c", "Rafflesia - World's Largest Flower (Scaniverse)", "JFN", "CC BY 4.0", 0.25),
      },
      {
        id: "busana-bengkulu",
        kind: "busana",
        title: "Busana Adat Perempuan Bengkulu",
        description: "Baju kurung merah bersulam emas dengan kain songket dan hiasan kepala keemasan.",
        height: 1.5,
        ...sketchfab("737689d5d39f42e19a3e1155da7e181f", "Bengkulu's Attire Female Character 3D", "Kartika Sari"),
      },
      {
        id: "foto-marlborough",
        kind: "bangunan",
        title: "Benteng Marlborough",
        description: "Benteng batu yang dibangun East India Company pada 1714–1719 untuk menjaga perdagangan lada Inggris di pantai barat Sumatra.",
        height: 1.5,
        ...commons("Cannon at Fort Marlborough, Bengkulu 2015-04-19 04.jpg", "Crisco 1492", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tabot",
        kind: "tradisi",
        title: "Tabot",
        description:
          "Menara hias dari bambu dan kertas yang diarak setiap 1–10 Muharam untuk mengenang wafatnya Husain, cucu Nabi Muhammad, lalu dibuang ke laut.",
        height: 1.6,
        ...commons("Tabot Tebuang.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-rumah-bung-karno",
        kind: "bangunan",
        title: "Rumah Pengasingan Bung Karno",
        description: "Rumah tempat Bung Karno tinggal selama diasingkan Belanda di Bengkulu, 1938–1942.",
        height: 1.5,
        ...commons("Rumah Bung Karno di Bengkulu.jpg", "Penikmat Senja", "CC BY-SA 4.0"),
      },
      {
        id: "foto-rumah-fatmawati",
        kind: "bangunan",
        title: "Rumah Fatmawati",
        description: "Rumah panggung di Kota Bengkulu yang dipugar untuk mengenang Fatmawati, penjahit bendera pusaka Merah Putih.",
        height: 1.4,
        ...commons("Rumah Fatmawati.jpg", "Hyurika", "CC BY-SA 4.0"),
      },
      {
        id: "foto-rafflesia-arnoldii",
        kind: "alam",
        title: "Rafflesia arnoldii",
        description: "Rafflesia arnoldii mekar di hutan Bengkulu. Kuncupnya tumbuh berbulan-bulan, tetapi bunganya hanya bertahan sekitar seminggu.",
        height: 1.6,
        ...commons("Rafflesia arnoldii Bengkulu 01.jpg", "SofianRafflesia", "CC BY-SA 4.0"),
      },
      {
        id: "foto-pendap",
        kind: "kuliner",
        title: "Pendap",
        description:
          "Ikan berbumbu kelapa parut dan rempah yang dibungkus berlapis daun talas dan daun pisang, lalu dikukus berjam-jam hingga daun talasnya ikut dimakan.",
        height: 1.4,
        ...commons("Pendap from Bengkulu - IMG 20220210 181317 298.jpg", "Naval Scene", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Benteng peninggalan Inggris di Bengkulu bernama...",
        options: ["Benteng Rotterdam", "Benteng Marlborough", "Benteng Vredeburg", "Benteng Duurstede"],
        answer: 1,
      },
      {
        q: "Tokoh asal Bengkulu yang menjahit bendera pusaka Merah Putih adalah...",
        options: ["Fatmawati", "Cut Nyak Dhien", "R.A. Kartini", "Dewi Sartika"],
        answer: 0,
      },
      {
        q: "Upacara mengarak menara hias setiap bulan Muharam di Bengkulu disebut...",
        options: ["Pasola", "Tiwah", "Tabot", "Ngaben"],
        answer: 2,
      },
    ],
  },
  {
    slug: "sumatera-selatan",
    mapId: "id-ss",
    island: "Sumatra",
    name: "Sumatera Selatan",
    summary:
      "Bumi Sriwijaya. Palembang, salah satu kota tertua di Indonesia, tumbuh di tepi Sungai Musi dan terkenal dengan songket serta pempeknya.",
    house: {
      name: "Rumah Limas",
      description:
        "Rumah panggung kayu beratap limas dengan lantai bertingkat-tingkat (kekijing). Tingkat lantai menandai kedudukan tamu dalam upacara adat.",
    },
    attire: {
      name: "Aesan Gede",
      description:
        "Busana pengantin kebesaran Palembang: songket bertabur benang emas, mahkota karsuhun, dan perhiasan emas yang mencerminkan kemegahan Sriwijaya.",
    },
    dance: {
      name: "Tari Gending Sriwijaya",
      description: "Tari penyambutan tamu agung yang menggambarkan kemegahan Sriwijaya. Penari terdepan membawa tepak berisi sekapur sirih.",
    },
    music: { song: "Cuk Mak Ilang", instrument: "Gambus dan serdam" },
    history:
      "Prasasti Kedukan Bukit (682 M) yang ditemukan di Palembang mencatat perjalanan Dapunta Hyang, pendiri Sriwijaya. Kerajaan maritim ini menguasai jalur Selat Malaka selama berabad-abad; kelak berdiri Kesultanan Palembang Darussalam.",
    exhibits: [
      {
        id: "ampera",
        kind: "bangunan",
        title: "Jembatan Ampera (miniatur)",
        description: "Jembatan di atas Sungai Musi yang diresmikan pada 1965. Bagian tengahnya dulu bisa diangkat agar kapal tinggi bisa lewat.",
        height: 2.9,
        ...sketchfab("00a2502bda5c47bf8018307efb3b6d5c", "Jembatan Ampera Palembang2", "giga"),
      },
      {
        id: "foto-rumah-limas",
        kind: "bangunan",
        title: "Rumah Limas",
        description: "Rumah Limas di halaman Museum Balaputradewa, Palembang. Rumah ini pernah tergambar di uang kertas Rp10.000.",
        height: 1.5,
        ...commons("Rumah Limas Museum Balaputradewa.jpg", "Fernando Tri Tanjung", "CC BY-SA 4.0"),
      },
      {
        id: "foto-songket",
        kind: "busana",
        title: "Songket Palembang",
        description: "Penenun menyisipkan benang emas helai demi helai di antara benang lungsin. Satu kain bisa dikerjakan berminggu-minggu.",
        height: 1.5,
        ...commons("Melestarikan Songket Palembang.jpg", "Afrinaldi Zulhen", "CC BY-SA 4.0"),
      },
      {
        id: "foto-aesan-gede",
        kind: "busana",
        title: "Aesan Gede",
        description: "Busana pengantin Aesan Gede dengan mahkota karsuhun dan songket emas.",
        height: 1.7,
        ...commons("Aesan Gede Songket Palembang.jpg", "Gunkarta", "CC BY-SA 3.0"),
      },
      {
        id: "masjid-agung-palembang",
        kind: "bangunan",
        title: "Masjid Agung Palembang (miniatur)",
        description: "Masjid kesultanan yang dibangun Sultan Mahmud Badaruddin I pada 1738–1748. Atap limasnya bertingkat tiga dengan ujung melengkung.",
        height: 2,
        ...sketchfab("4bf64e878b5a4c7ba18cfd8b2f80f5f9", "Masjid Agung Palembang", "ikhsanyoga"),
      },
      {
        id: "foto-kedukan-bukit",
        kind: "benda",
        title: "Prasasti Kedukan Bukit",
        description: "Batu bertulis tahun 682 M berhuruf Pallawa dan berbahasa Melayu Kuno, prasasti tertua yang menyebut Sriwijaya.",
        height: 1.3,
        ...commons("Prasasti Kedukan Bukit 3.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
      {
        id: "foto-pempek",
        kind: "kuliner",
        title: "Pempek",
        description: "Olahan ikan dan sagu khas Palembang, disajikan dengan kuah cuka yang pedas, asam, dan manis.",
        height: 1.3,
        ...commons("Pempek campur.JPG", "Midori", "CC BY-SA 3.0"),
      },
      {
        id: "foto-kuto-besak",
        kind: "bangunan",
        title: "Benteng Kuto Besak",
        description: "Benteng keraton Kesultanan Palembang Darussalam di tepi Sungai Musi, selesai dibangun pada 1797. Kini dipakai sebagai markas militer.",
        height: 1.5,
        ...commons("Benteng Kuto Besak.jpg", "fitri agung", "CC BY 2.0"),
      },
      {
        id: "foto-tekwan",
        kind: "kuliner",
        title: "Tekwan",
        description:
          "Bola-bola ikan dan sagu dalam kuah udang bening dengan bengkuang, jamur kuping, dan soun. Seperti pempek, tekwan lahir dari kebiasaan mengolah ikan Sungai Musi.",
        height: 1.4,
        ...commons("Tekwan.JPG", "Midori", "CC BY-SA 3.0"),
      },
      {
        id: "foto-pindang-patin",
        kind: "kuliner",
        title: "Pindang Patin",
        description: "Ikan patin dalam kuah bening asam-pedas dengan nanas, tomat, dan kemangi. Pindang Palembang tidak memakai santan.",
        height: 1.4,
        ...commons("Pindang Patin Palembang 1.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Kerajaan maritim besar yang berpusat di sekitar Palembang adalah...",
        options: ["Majapahit", "Sriwijaya", "Mataram", "Kutai"],
        answer: 1,
      },
      {
        q: "Atap rumah adat Palembang berbentuk...",
        options: ["Limas", "Gonjong", "Kerucut", "Pelana melengkung"],
        answer: 0,
      },
      {
        q: "Jembatan Ampera melintasi sungai...",
        options: ["Kapuas", "Mahakam", "Musi", "Batanghari"],
        answer: 2,
      },
    ],
  },
  {
    slug: "bangka-belitung",
    mapId: "id-bb",
    island: "Sumatra",
    name: "Kepulauan Bangka Belitung",
    summary:
      "Dua pulau besar di antara Sumatra dan Kalimantan, terkenal dengan timah, pantai batu granit, dan budaya Melayu yang berbaur dengan Tionghoa.",
    house: {
      name: "Rumah Panggung Melayu",
      description:
        "Masyarakat Melayu Bangka Belitung tinggal di rumah panggung kayu beratap limas atau pelana. Di tepi sungai dan pesisir dulu juga ada rumah rakit yang mengapung di atas air.",
    },
    attire: {
      name: "Paksian",
      description:
        "Busana pengantin Bangka: baju kurung merah dari beludru atau sutra, kain cual (tenun khas Bangka dengan motif timbul), dan mahkota paksian.",
    },
    dance: {
      name: "Tari Campak",
      description: "Tari pergaulan muda-mudi Bangka Belitung yang menggambarkan keceriaan selepas panen, diiringi biola, gendang, dan gong.",
    },
    music: { song: "Yo Miak", instrument: "Dambus" },
    history:
      "Timah ditambang di Bangka sejak abad ke-18, ketika Kesultanan Palembang mendatangkan penambang dari Tiongkok selatan. Pada 1949, Bung Karno dan Bung Hatta diasingkan Belanda di Muntok. Bangka Belitung menjadi provinsi sendiri pada 2000.",
    exhibits: [
      {
        id: "vihara-kumala-bodhi",
        kind: "bangunan",
        title: "Vihara Kumala Bodhi (miniatur)",
        description:
          "Vihara di Pangkalpinang. Vihara dan kelenteng mudah ditemui di Bangka Belitung, jejak panjang masyarakat Tionghoa yang datang sebagai penambang timah.",
        height: 2.6,
        ...sketchfab("c9457ea31e4742fc92388b10da11c8fc", "Vihara Kumala Bodhi", "dekathomas"),
      },
      {
        id: "foto-museum-timah",
        kind: "bangunan",
        title: "Museum Timah Indonesia, Muntok",
        description: "Museum di Muntok yang menyimpan sejarah dan peralatan penambangan timah di Pulau Bangka.",
        height: 1.2,
        ...commons("Museum Timah Indonesia Muntok.jpg", "Cun Cun", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tambang-timah",
        kind: "tradisi",
        title: "Penambangan Timah Masa Kolonial",
        description: "Instalasi penyemprot dan pengisap pasir timah di Bangka pada masa Hindia Belanda. Koleksi KITLV.",
        height: 1.5,
        ...commons("KITLV A745 - Tinspuitzuigerinstallatie op het eiland Bangka, KITLV 90172.tif", "KITLV", "CC BY 4.0"),
      },
      {
        id: "foto-tanjung-tinggi",
        kind: "alam",
        title: "Pantai Tanjung Tinggi",
        description: "Batu-batu granit raksasa di pantai Belitung, sisa batuan purba yang terkikis angin dan ombak selama jutaan tahun.",
        height: 1.5,
        ...commons("Pantai Tanjung Tinggi Belitung 02.jpg", "Raflinoer32", "CC BY-SA 4.0"),
      },
      {
        id: "foto-laskar-pelangi",
        kind: "bangunan",
        title: "Replika Sekolah Laskar Pelangi",
        description:
          "Replika SD Muhammadiyah Gantong dari novel Laskar Pelangi karya Andrea Hirata, kisah anak-anak Belitung yang bersekolah di tengah keterbatasan.",
        height: 1.5,
        ...commons("Replika Sekolah Laskar Pelangi SD Muhammadiyah Gantong.jpg", "Raflinoer32", "CC BY-SA 4.0"),
      },
      {
        id: "foto-puri-tri-agung",
        kind: "bangunan",
        title: "Puri Tri Agung",
        description: "Vihara bertingkat di pantai Sungailiat, Bangka, dengan atap bundar bergaya kuil Tiongkok.",
        height: 1.4,
        ...commons("Tri agung vihara.png", "Badan Pusat Statistik", "Public domain"),
      },
      {
        id: "foto-martabak-bangka",
        kind: "kuliner",
        title: "Martabak Bangka",
        description:
          "Martabak manis tebal yang berongga di dalam, berisi cokelat, kacang, atau keju. Disebut juga hok lo pan, dibawa perantau Hakka dari Bangka ke seluruh Indonesia.",
        height: 1.4,
        ...commons("Hoklopan-Martabak Bangka.JPG", "Taman Renyah", "CC BY 3.0"),
      },
      {
        id: "foto-lempah-kuning",
        kind: "kuliner",
        title: "Lempah Kuning",
        description: "Ikan laut atau daging dalam kuah kuning asam pedas dari kunyit, terasi, dan nanas, masakan sehari-hari orang Bangka.",
        height: 1.4,
        ...commons("Lempah kuning.JPG", "Taman Renyah", "CC BY-SA 3.0"),
      },
    ],
    quiz: [
      {
        q: "Bahan tambang yang membuat Bangka Belitung terkenal sejak abad ke-18 adalah...",
        options: ["Emas", "Batu bara", "Timah", "Nikel"],
        answer: 2,
      },
      {
        q: "Novel Andrea Hirata yang berlatar di Belitung adalah...",
        options: ["Ronggeng Dukuh Paruk", "Laskar Pelangi", "Siti Nurbaya", "Bumi Manusia"],
        answer: 1,
      },
      {
        q: "Alat musik petik khas Bangka yang mirip gambus disebut...",
        options: ["Dambus", "Sasando", "Sape'", "Kecapi"],
        answer: 0,
      },
    ],
  },
  {
    slug: "lampung",
    mapId: "id-la",
    island: "Sumatra",
    name: "Lampung",
    summary: "Gerbang Sumatra di seberang Selat Sunda: tanah kain tapis, mahkota siger, dan gajah Way Kambas.",
    house: {
      name: "Nuwo Sesat",
      description:
        "Balai adat Lampung berupa rumah panggung kayu yang besar, tempat para penyimbang (pemuka adat) bermusyawarah. Rumah tinggalnya disebut nuwo balak.",
    },
    attire: {
      name: "Siger dan Tapis",
      description:
        "Pengantin perempuan memakai siger, mahkota emas bercabang tujuh (Saibatin) atau sembilan (Pepadun), dengan kain tapis bersulam benang emas.",
    },
    dance: {
      name: "Tari Sigeh Pengunten",
      description: "Tari penyambutan tamu yang memadukan unsur tari adat Pepadun dan Saibatin. Penarinya memakai siger dan kain tapis.",
    },
    music: { song: "Cangget Agung", instrument: "Gamolan pekhing (cetik)" },
    history:
      "Masyarakat Lampung terbagi dalam dua adat besar, Saibatin di pesisir dan Pepadun di pedalaman, seperti tercermin dalam semboyan Sang Bumi Ruwa Jurai. Letusan Krakatau pada 1883 menewaskan puluhan ribu orang, terutama karena tsunami yang menerjang pesisir Lampung dan Banten.",
    exhibits: [
      {
        id: "gajah-sumatra",
        kind: "alam",
        title: "Gajah Sumatra",
        description:
          "Taman Nasional Way Kambas di Lampung Timur punya pusat latihan gajah sejak 1985, tempat gajah sumatra yang terancam punah dirawat dan dilatih.",
        height: 2.6,
        ...sketchfab("401d8c67f6e649db9aefec224c2eec31", "Male Sumatran elephant", "Look02"),
      },
      {
        id: "badik-lampung",
        kind: "benda",
        title: "Badik Lampung",
        description: "Senjata tikam bersarung kayu yang dulu dibawa laki-laki Lampung sebagai pelengkap busana adat.",
        height: 0.5,
        ...sketchfab("f7221c1d25264650a01fbeab96a3261f", "Badik Lampung", "rismamlys", "CC BY 4.0", 0.3),
      },
      {
        id: "foto-tapis",
        kind: "busana",
        title: "Kain Tapis",
        description: "Kain tenun bersulam benang emas atau perak. Motifnya kapal, manusia, dan tumbuhan, dan dulu menandai status pemakainya.",
        height: 1.4,
        ...commons("Kain tapis.JPG", "Midori", "CC BY 2.5"),
      },
      {
        id: "foto-menara-siger",
        kind: "bangunan",
        title: "Menara Siger",
        description: "Menara berbentuk mahkota siger di Bakauheni, menyambut penumpang kapal dari Jawa. Siger menjadi lambang Provinsi Lampung.",
        height: 1.4,
        ...commons("Menara Siger.jpg", "DOLAN YOK", "CC BY-SA 4.0"),
      },
      {
        id: "foto-rumah-lampung",
        kind: "bangunan",
        title: "Rumah Adat Lampung",
        description: "Rumah panggung kayu Lampung dengan tangga di depan dan kolong yang tinggi.",
        height: 1.4,
        ...commons("Rumah adat Nuwo Sesat lampung.jpg", "RaiyaniM", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sigeh-pengunten",
        kind: "seni",
        title: "Tari Sigeh Pengunten",
        description: "Penari bersiger membawakan tari penyambutan di Tulang Bawang Barat.",
        height: 1.5,
        ...commons("WikiNgigel – Tari Sigeh Pengunten – Tulang Bawang Barat (12 July 2026) – 05.jpg", "Xiangliangzai", "CC BY-SA 4.0"),
      },
      {
        id: "foto-krakatau-1883",
        kind: "alam",
        title: "Letusan Krakatau 1883",
        description: "Litografi letusan Krakatau 1883. Abunya menyebar mengelilingi bumi dan membuat langit di banyak negara memerah selama berbulan-bulan.",
        height: 1.6,
        ...commons("Krakatoa eruption lithograph.jpg", "Parker & Coward", "Public domain"),
      },
      {
        id: "foto-pengantin-lampung",
        kind: "busana",
        title: "Arak-arakan Pengantin Lampung",
        description:
          "Pengantin Lampung Pesisir diarak di bawah payung kebesaran. Pengantin perempuan memakai siger, mahkota emas bercabang yang juga menjadi lambang Lampung.",
        height: 1.5,
        ...commons("Mengarak Pengantin Lampung Pesisir.jpg", "Lili Aini", "CC BY-SA 4.0"),
      },
      {
        id: "foto-seruit",
        kind: "kuliner",
        title: "Seruit",
        description:
          "Ikan bakar atau goreng yang dicampur sambal terasi, tempoyak, dan lalapan, lalu disantap beramai-ramai. Makan seruit bersama disebut nyeruit.",
        height: 1.4,
        ...commons("Sambal seruit dan ikan bakar.jpg", "Raflinoer32", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Mahkota emas bercabang yang menjadi lambang Lampung disebut...",
        options: ["Siger", "Tanjak", "Blangkon", "Suntiang"],
        answer: 0,
      },
      {
        q: "Taman nasional di Lampung yang terkenal dengan pusat latihan gajahnya adalah...",
        options: ["Ujung Kulon", "Way Kambas", "Tanjung Puting", "Lore Lindu"],
        answer: 1,
      },
      {
        q: "Semboyan Lampung yang menggambarkan dua kelompok adat, Saibatin dan Pepadun, adalah...",
        options: ["Bhinneka Tunggal Ika", "Torang Samua Basudara", "Adat Basandi Syarak", "Sang Bumi Ruwa Jurai"],
        answer: 3,
      },
    ],
  },
  {
    slug: "banten",
    mapId: "id-bt",
    island: "Jawa",
    name: "Banten",
    summary:
      "Ujung barat Pulau Jawa: bekas bandar lada Kesultanan Banten dan tanah masyarakat Baduy yang memegang teguh adat di pedalaman Lebak.",
    house: {
      name: "Rumah Baduy (Sulah Nyanda)",
      description:
        "Rumah panggung dari bambu dan kayu beratap daun kirai, disambung dengan pasak dan ikatan tanpa paku. Masyarakat Baduy Dalam menolak bahan bangunan modern.",
    },
    attire: {
      name: "Busana Baduy",
      description:
        "Masyarakat Baduy Dalam berpakaian putih dengan ikat kepala putih; Baduy Luar berpakaian hitam atau biru tua dengan ikat kepala biru bermotif batik.",
    },
    dance: {
      name: "Rampak Bedug",
      description:
        "Para pemain menabuh beberapa bedug bersamaan sambil menari dengan gerak serempak. Berawal dari tradisi menabuh bedug menyambut Ramadan dan Lebaran.",
    },
    music: { song: "Dayung Sampan", instrument: "Bedug dan rebana" },
    history:
      "Kesultanan Banten berdiri pada abad ke-16 dan berjaya sebagai bandar lada di bawah Sultan Ageng Tirtayasa (1651–1683). Sisa kejayaannya masih terlihat di Banten Lama: Masjid Agung, reruntuhan Keraton Surosowan, dan Keraton Kaibon.",
    exhibits: [
      {
        id: "rumah-baduy",
        kind: "bangunan",
        title: "Rumah Baduy",
        description:
          "Rumah panggung Baduy dari bambu, kayu, dan atap daun. Rumah-rumah di kampung Baduy dibuat seragam dan sederhana, selaras dengan ajaran untuk hidup bersahaja.",
        height: 3.0,
        ...sketchfab("7b63547bab334c83ae5d81e88ac16fbf", "Rumah Baduy Indonesia ( Option 1 )", "mbung"),
      },
      {
        id: "meriam-ki-amuk",
        kind: "benda",
        title: "Meriam Ki Amuk",
        description: "Meriam perunggu peninggalan Kesultanan Banten yang kini berada di Banten Lama. Badannya berhias tulisan Arab.",
        height: 1.3,
        ...sketchfab("e71c6791838c4313b2c6ab12c1349c49", "Meriam Ki Amuk", "Kebudayaan Indonesia"),
      },
      {
        id: "leuit",
        kind: "bangunan",
        title: "Leuit",
        description: "Lumbung padi masyarakat Sunda dan Baduy. Padi bisa disimpan di sini hingga puluhan tahun sebagai cadangan pangan.",
        height: 2.2,
        turn: 90,
        ...sketchfab("c61974b1b5e54943a3a373bf3030b285", "Leuit", "afansugianto68"),
      },
      {
        id: "foto-debus",
        kind: "seni",
        title: "Debus",
        description: "Pemain debus memperlihatkan kekebalan tubuh terhadap benda tajam, seni yang berkembang sejak masa Kesultanan Banten.",
        height: 1.5,
        ...commons("Debus, The Ancient Martial Art and Culture of Banten Indonesia.jpg", "Dhani ilham", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-banten",
        kind: "bangunan",
        title: "Masjid Agung Banten",
        description: "Dibangun pada masa Sultan Maulana Hasanuddin di abad ke-16. Menaranya yang mirip mercusuar menjadi ikon Banten Lama.",
        height: 1.5,
        ...commons("Masjid agung banten lama.jpg", "Firdaus31", "CC BY-SA 4.0"),
      },
      {
        id: "foto-kaibon",
        kind: "bangunan",
        title: "Keraton Kaibon",
        description: "Reruntuhan istana di Banten Lama yang dibangun untuk Ratu Aisyah, ibu Sultan Syafiuddin, lalu dihancurkan Belanda pada 1832.",
        height: 1.5,
        ...commons("Struktur Gerabang Keraton Kaibon.jpg", "Arif Permana Putra", "CC BY-SA 4.0"),
      },
      {
        id: "foto-pakaian-baduy",
        kind: "busana",
        title: "Pakaian Baduy Dalam",
        description:
          "Laki-laki Baduy Dalam memakai baju putih tenunan sendiri dan ikat kepala putih dengan sarung gelap. Baduy Luar memakai baju hitam dan ikat kepala biru.",
        height: 1.6,
        ...commons("Pakaian Adat Pria Baduy.jpg", "Trityas", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sate-bandeng",
        kind: "kuliner",
        title: "Sate Bandeng",
        description:
          "Daging bandeng dipisahkan dari durinya, dibumbui, dimasukkan lagi ke kulitnya, lalu dijepit bambu dan dibakar. Konon dulu disajikan untuk sultan Banten.",
        height: 1.4,
        ...commons("Sate Bandeng 1.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jojorong",
        kind: "kuliner",
        title: "Jojorong",
        description: "Kue tepung beras bersaus santan dan gula aren dalam takir daun pisang, jajanan khas Pandeglang dan Serang.",
        height: 1.4,
        ...commons("Jojorong banten 3.jpg", "Salm Abdullah", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Masyarakat adat di pedalaman Banten yang menolak bahan bangunan modern adalah...",
        options: ["Tengger", "Baduy", "Samin", "Osing"],
        answer: 1,
      },
      {
        q: "Sultan Banten yang membawa masa kejayaan perdagangan lada adalah...",
        options: ["Sultan Ageng Tirtayasa", "Sultan Iskandar Muda", "Sultan Hasanuddin", "Sultan Agung"],
        answer: 0,
      },
      {
        q: "Pertunjukan kekebalan tubuh khas Banten disebut...",
        options: ["Kuda lumping", "Pencak dor", "Debus", "Karapan"],
        answer: 2,
      },
    ],
  },
  {
    slug: "jakarta",
    mapId: "id-jk",
    island: "Jawa",
    name: "Jakarta",
    summary:
      "Kota pelabuhan Sunda Kelapa yang tumbuh menjadi metropolitan terbesar di Indonesia. Budaya Betawi di sini memadukan Sunda, Jawa, Melayu, Arab, Tionghoa, dan Eropa.",
    house: {
      name: "Rumah Kebaya",
      description:
        "Rumah adat Betawi beratap pelana yang dari samping tampak seperti lipatan kebaya. Terasnya luas dan berpagar langkan, tempat menerima tamu dan bersantai.",
    },
    attire: {
      name: "Kebaya Encim dan Baju Sadariah",
      description:
        "Perempuan Betawi memakai kebaya encim berenda dengan kain batik; laki-laki memakai baju sadariah, celana batik, sarung di bahu, dan peci.",
    },
    dance: {
      name: "Tari Topeng Betawi",
      description: "Penari bertopeng membawakan cerita rakyat diiringi tabuhan gamelan topeng; pertunjukannya memadukan tari, musik, dan lawakan.",
    },
    music: { song: "Kicir-Kicir", instrument: "Gambang kromong dan tanjidor" },
    history:
      "Pelabuhan Sunda Kelapa direbut Fatahillah pada 1527 dan dinamai Jayakarta. VOC lalu membangun Batavia di atasnya pada 1619. Setelah merdeka, Monas didirikan untuk mengenang perjuangan kemerdekaan.",
    exhibits: [
      {
        id: "monas",
        kind: "bangunan",
        title: "Monas (miniatur)",
        description:
          "Tugu setinggi 132 meter di Lapangan Merdeka. Puncaknya berupa lidah api berlapis emas, lambang semangat perjuangan yang tidak pernah padam.",
        height: 3.4,
        ...sketchfab("d5d7f266237141c895f65811c867016b", "Monas", "Singgih Pramono"),
      },
      {
        id: "ondel-laki",
        kind: "seni",
        title: "Ondel-ondel Laki-laki",
        description: "Boneka raksasa Betawi berwajah merah. Dulu diarak untuk menolak bala, kini meramaikan pesta rakyat dan hajatan.",
        height: 2.0,
        ...sketchfab("2905b56b8534416bb1008c7fe6467311", "Ondel Ondel Man", "Abim Project"),
      },
      {
        id: "ondel-perempuan",
        kind: "seni",
        title: "Ondel-ondel Perempuan",
        description: "Pasangan ondel-ondel laki-laki, berwajah putih. Keduanya diarak bersama iringan tanjidor atau gendang pencak.",
        height: 2.0,
        ...sketchfab("0697a7f838984c0283a77aef8b917423", "Ondel- Ondel Woman", "Abim Project"),
      },
      {
        id: "foto-kerak-telor",
        kind: "kuliner",
        title: "Kerak Telor",
        description: "Beras ketan, telur, dan ebi dimasak di atas anglo arang. Wajannya dibalik menghadap api sampai keraknya kering.",
        height: 1.5,
        ...commons("Kerak Telor Betawi Vendor.jpg", "Gunawan Kartapranata", "CC BY-SA 3.0"),
      },
      {
        id: "foto-silat-betawi",
        kind: "seni",
        title: "Silat Betawi",
        description: "Silat Betawi juga tampil dalam tradisi palang pintu: adu pantun dan jurus sebelum rombongan pengantin pria boleh masuk.",
        height: 1.6,
        ...commons("Pencak Silat Betawi 2.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
      {
        id: "foto-fatahillah",
        kind: "bangunan",
        title: "Museum Fatahillah",
        description: "Bekas balai kota Batavia yang selesai dibangun pada 1710, kini Museum Sejarah Jakarta di kawasan Kota Tua.",
        height: 1.5,
        ...commons("Jakarta Indonesia Jakarta-History-Museum-02.jpg", "CEphoto, Uwe Aranas", "CC BY-SA 3.0"),
      },
      {
        id: "foto-tanjidor",
        kind: "seni",
        title: "Tanjidor",
        description: "Orkes tiup Betawi dengan klarinet, trombon, dan tambur. Berawal dari para pemusik budak di rumah-rumah tuan tanah Batavia.",
        height: 1.5,
        ...commons("Tanjidor, by M Jeffry Hanafiah.jpg", "Emjeha", "CC BY-SA 4.0"),
      },
      {
        id: "gado-gado",
        kind: "kuliner",
        title: "Gado-gado",
        description:
          "Sayuran rebus, kentang, tahu, tempe, dan telur bersiram saus kacang, ditaburi kerupuk dan bawang goreng. Salah satu hidangan Betawi paling dikenal.",
        height: 0.4,
        ...sketchfab("985d026be89f4975bc0bfbe62c807e89", "\"Gado Gado\" Indonesian Salad (Scaniverse)", "JFN", "CC BY 4.0", 0.3),
      },
      {
        id: "foto-istiqlal",
        kind: "bangunan",
        title: "Masjid Istiqlal",
        description:
          "Masjid nasional di Jakarta, diresmikan pada 1978. Arsiteknya Friedrich Silaban, seorang Kristen, dan masjid ini berseberangan dengan Gereja Katedral sebagai lambang kerukunan.",
        height: 1.5,
        ...commons("Masjid Istiqlal Jakarta.jpg", "AR El Syarif", "CC BY-SA 4.0"),
      },
      {
        id: "foto-soto-betawi",
        kind: "kuliner",
        title: "Soto Betawi",
        description: "Soto berkuah santan atau susu dengan daging dan jeroan sapi, disajikan bersama emping, tomat, dan acar.",
        height: 1.4,
        ...commons("SOTO BETAWI.jpg", "Irhanz", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bir-pletok",
        kind: "kuliner",
        title: "Bir Pletok",
        description: "Minuman rempah Betawi dari jahe, serai, kayu secang, dan cengkih, tanpa alkohol. Warna merahnya dari kayu secang.",
        height: 1.5,
        ...commons("Bir Pletok (closeup, white bg).jpg", "Swarabakti", "CC BY-SA 4.0"),
      },
      {
        id: "foto-kebaya-encim",
        kind: "busana",
        title: "Kebaya Encim",
        description:
          "Kebaya berbordir dengan kain batik pesisir, dipakai perempuan Betawi. Namanya dari sapaan encim untuk perempuan Tionghoa peranakan yang lebih dulu memopulerkannya.",
        height: 1.6,
        ...commons("Kebaya Encim Betawi 20240622 121405.jpg", "Naval Scene", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Nama Jakarta pada masa VOC adalah...",
        options: ["Jayakarta", "Sunda Kelapa", "Batavia", "Buitenzorg"],
        answer: 2,
      },
      {
        q: "Boneka raksasa khas Betawi disebut...",
        options: ["Ondel-ondel", "Sigale-gale", "Barong", "Reog"],
        answer: 0,
      },
      {
        q: "Puncak Monas berbentuk...",
        options: ["Garuda", "Bintang", "Bunga teratai", "Lidah api"],
        answer: 3,
      },
    ],
  },
  {
    slug: "jawa-barat",
    mapId: "id-jb",
    island: "Jawa",
    name: "Jawa Barat",
    summary: "Tatar Sunda: tanah pegunungan dengan tradisi musik bambu, tembang, dan tari yang lincah.",
    house: {
      name: "Imah Julang Ngapak",
      description:
        "Atapnya melebar di kedua sisi seperti burung julang yang sedang mengepakkan sayap. Dibangun sebagai rumah panggung agar lantai tetap kering dan berangin.",
    },
    attire: {
      name: "Kebaya Sunda dan Pangsi",
      description:
        "Kebaya dengan kain batik untuk perempuan. Pangsi, setelan longgar berwarna hitam, dipakai laki-laki dalam keseharian dan pencak silat.",
    },
    dance: {
      name: "Tari Jaipong",
      description:
        "Diciptakan Gugum Gumbira pada 1970-an dari gerak ketuk tilu dan pencak silat, diiringi kendang yang rancak.",
    },
    music: { song: "Manuk Dadali", instrument: "Angklung" },
    history:
      "Tarumanagara, salah satu kerajaan tertua di Nusantara, berdiri di wilayah ini sekitar abad ke-5. Kemudian Kerajaan Sunda berpusat di Pakuan Pajajaran, dekat Bogor sekarang.",
    exhibits: [
      {
        id: "julang-ngapak",
        kind: "bangunan",
        title: "Imah Julang Ngapak",
        description:
          "Rumah panggung Sunda dengan atap yang melebar di kedua sisi seperti sayap burung julang. Kolong rumah menjaga lantai tetap kering.",
        height: 2.8,
        ...sketchfab("5a1bbf8170eb4382946f26057cf6ebd3", "Traditional Sundanese House – Julang Ngapak", "gianoergraha83"),
      },
      {
        id: "wayang-golek",
        kind: "seni",
        title: "Wayang Golek Arjuna",
        description:
          "Boneka kayu tiga dimensi untuk pertunjukan wayang golek, seni pertunjukan khas Sunda. Arjuna adalah ksatria Pandawa. Pindaian dari koleksi museum di Małopolska, Polandia.",
        height: 1.1,
        ...sketchfab("3043564cc38b49aa8b08a61ce68dd61a", "“Arjuna” — “Wayang Golek” theatre puppet", "Virtual Museums of Małopolska", "CC0"),
      },
      {
        id: "kujang",
        kind: "benda",
        title: "Kujang",
        description: "Senjata dan pusaka khas Sunda dengan bilah melengkung berlubang. Bentuknya menjadi bagian lambang Provinsi Jawa Barat.",
        height: 0.6,
        ...sketchfab("6d44595205b541ada61f6ceca4148300", "Kujang", "eljaasb"),
      },
      {
        id: "foto-angklung",
        kind: "seni",
        title: "Angklung dalam Seren Taun",
        description: "Angklung diarak dalam Seren Taun, upacara syukur panen masyarakat Sunda.",
        height: 1.5,
        ...commons("Seren Taun 2012 Bogor A.jpg", "Onotrapokenifla", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jaipong",
        kind: "seni",
        title: "Tari Jaipong",
        description: "Penari Jaipong dengan selendang, bergerak mengikuti tepakan kendang.",
        height: 1.5,
        ...commons("Jaipongan Langit Biru 01.jpg", "Gunawan Kartapranata", "CC BY-SA 3.0"),
      },
      {
        id: "angklung",
        kind: "seni",
        title: "Angklung",
        description: "Tabung-tabung bambu yang berbunyi saat digoyangkan; satu angklung menghasilkan satu nada. Diakui UNESCO pada 2010.",
        height: 0.9,
        ...sketchfab("0ebe87f2a9eb4ebfb2df507caa262dab", "ANGKLUNG", "indanazulfaoktavia"),
      },
      {
        id: "gedung-sate",
        kind: "bangunan",
        title: "Gedung Sate",
        description:
          "Kantor Gubernur Jawa Barat di Bandung, dibangun pada 1920–1924. Ornamen di puncak menaranya mirip tusuk sate dengan enam bulatan, konon lambang biaya pembangunannya: 6 juta gulden.",
        height: 1.6,
        ...sketchfab("1e7b90079b70421a96c570df991db730", "Gedung Sate", "hani.nikmah", "CC BY 4.0"),
      },
      {
        id: "sate-maranggi",
        kind: "kuliner",
        title: "Sate Maranggi",
        description:
          "Sate daging sapi khas Purwakarta yang dibumbui ketumbar, bawang, dan kecap sebelum dibakar, jadi cukup disantap dengan sambal tomat tanpa saus kacang.",
        height: 0.45,
        ...sketchfab("1a976aa242794aedb058c711c3879f1a", "Sate Maranggi", "PixForge", "CC BY 4.0", 0.05),
      },
      {
        id: "foto-seblak",
        kind: "kuliner",
        title: "Seblak",
        description: "Kerupuk basah dimasak dengan kencur, cabai, dan telur hingga pedas gurih. Jajanan Bandung ini kini dijual hampir di seluruh Indonesia.",
        height: 1.4,
        ...commons("Seblak 2.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bandrek",
        kind: "kuliner",
        title: "Bandrek",
        description: "Minuman hangat dari jahe, gula aren, dan rempah, kadang dengan santan, untuk menghangatkan badan di udara dingin Priangan.",
        height: 1.4,
        ...commons("Bandrek Bandung.JPG", "Midori", "CC BY 3.0"),
      },
    ],
    quiz: [
      {
        q: "Nama Imah Julang Ngapak terinspirasi dari...",
        options: ["Gunung berapi", "Daun pisang", "Ombak laut", "Burung yang mengepakkan sayap"],
        answer: 3,
      },
      {
        q: "Alat musik bambu dari Jawa Barat yang diakui UNESCO adalah...",
        options: ["Sasando", "Angklung", "Tifa", "Kolintang"],
        answer: 1,
      },
      {
        q: "Siapa pencipta Tari Jaipong?",
        options: ["Bagong Kussudiardja", "Wayan Limbak", "Gugum Gumbira", "Didik Nini Thowok"],
        answer: 2,
      },
    ],
  },
  {
    slug: "jawa-tengah",
    mapId: "id-jt",
    island: "Jawa",
    name: "Jawa Tengah",
    summary: "Jantung budaya Jawa: Candi Borobudur, Keraton Surakarta, batik, wayang, dan gamelan.",
    house: {
      name: "Joglo",
      description:
        "Rumah Jawa dengan atap tinggi bertumpuk di tengah, ditopang empat tiang utama (saka guru). Bagian depannya berupa pendapa terbuka untuk menerima tamu.",
    },
    attire: {
      name: "Kebaya dan Beskap",
      description:
        "Perempuan memakai kebaya dengan kain jarik batik dan sanggul; laki-laki memakai beskap, kain jarik, blangkon, dan keris yang diselipkan di punggung.",
    },
    dance: {
      name: "Tari Gambyong",
      description:
        "Tarian Surakarta yang luwes, awalnya tari rakyat lalu diperhalus di lingkungan keraton. Kini sering membuka acara sebagai tari penyambutan.",
    },
    music: { song: "Gundul-Gundul Pacul", instrument: "Gamelan Jawa" },
    history:
      "Borobudur dibangun pada abad ke-8 sampai ke-9 oleh wangsa Syailendra. Pada abad ke-16, Demak menjadi kesultanan Islam pertama di Jawa; kelak Mataram Islam terbagi menjadi Surakarta dan Yogyakarta lewat Perjanjian Giyanti (1755).",
    exhibits: [
      {
        id: "joglo",
        kind: "bangunan",
        title: "Rumah Joglo",
        description: "Rumah Jawa beratap tinggi bertumpuk di tengah yang ditopang empat saka guru. Dulu atap joglo menandai pemilik dari kalangan berada.",
        height: 3.0,
        ...sketchfab("a912c962122446ecac7d51c0750d8d46", "Rumah Joglo Indonesia ( Option 2 )", "mbung"),
      },
      {
        id: "stupa-borobudur",
        kind: "bangunan",
        title: "Stupa Borobudur (miniatur)",
        description: "Stupa berterawang di teras atas Borobudur; di dalam tiap stupa duduk arca Buddha. Teras melingkar ini mengelilingi stupa induk di puncak.",
        height: 2.2,
        ...sketchfab("84525b2dc4094057ab33e026eb961371", "Borobudur temple", "giga"),
      },
      {
        id: "menara-kudus",
        kind: "bangunan",
        title: "Menara Kudus (miniatur)",
        description: "Menara masjid dari bata merah di Kudus yang bentuknya mirip candi, bukti perpaduan budaya Hindu-Jawa dan Islam pada masa Sunan Kudus.",
        height: 2.8,
        ...sketchfab("344a95d373ec4c379c5c6542e7957345", "Menara Kudus", "feraldo.trio.carrera"),
      },
      {
        id: "jamu-gendong",
        kind: "kuliner",
        title: "Penjual Jamu Gendong",
        description: "Penjual jamu menggendong bakul berisi botol jamu, minuman herbal tradisional Jawa. Budaya sehat jamu diakui UNESCO pada 2023.",
        height: 1.7,
        ...sketchfab("b55d50eb82714ac5b19b2e475bf35f08", "Woman carrying a basket./ Gadis Penjual Jamu", "Fadly.W", "CC BY 4.0", 0.5),
      },
      {
        id: "keris-surakarta",
        kind: "benda",
        title: "Keris Surakarta",
        description: "Keris berbilah luk dengan warangka kayu gaya Surakarta. Keris Indonesia diakui UNESCO sebagai mahakarya warisan budaya pada 2005.",
        height: 0.55,
        ...sketchfab("8ff76ed3edbf4071a0ca2043c84ba225", "Keris Surakarta", "dwiwahyuwardhani"),
      },
      {
        id: "foto-borobudur",
        kind: "bangunan",
        title: "Candi Borobudur",
        description: "Candi Buddha terbesar di dunia di Magelang, dengan lebih dari 2.600 panel relief.",
        height: 1.5,
        ...commons("Borobudur, Java, Indonesia, 20220817 1013 8739.jpg", "Jakub Hałun", "CC BY-SA 4.0"),
      },
      {
        id: "lawang-sewu",
        kind: "bangunan",
        title: "Lawang Sewu",
        description:
          "Bekas kantor perusahaan kereta api Hindia Belanda (NIS) di Semarang, selesai pada 1907. Disebut lawang sewu (seribu pintu) karena pintu dan jendelanya sangat banyak.",
        height: 1.4,
        ...sketchfab("519ee15de3b144469369f4c99f054b0e", "Lawang Sewu_2", "Albert-MAGS", "CC BY 4.0", 0.15),
      },
      {
        id: "kebaya-jawa",
        kind: "busana",
        title: "Kebaya Jawa",
        description:
          "Kebaya brokat dengan kain batik, busana resmi perempuan Jawa. Kebaya diakui UNESCO sebagai warisan budaya takbenda pada 2024, diusulkan bersama empat negara Asia Tenggara.",
        height: 1.3,
        ...sketchfab("edc3558dc68243e5b2850150318e00ec", "Woman in a traditional red kebaya V2", "Fadly.W", "CC BY 4.0"),
      },
      {
        id: "klepon",
        kind: "kuliner",
        title: "Klepon",
        description: "Bola ketan hijau berisi gula merah cair yang meletup di mulut, ditaburi kelapa parut. Jajan pasar ini dikenal di banyak daerah Jawa.",
        height: 0.3,
        ...sketchfab("996a017bac004ed5847b989ac299791e", "Indonesian Food Dessert Klepon", "Pramudya Art", "CC BY 4.0", 0.1),
      },
      {
        id: "foto-sam-poo-kong",
        kind: "bangunan",
        title: "Sam Poo Kong",
        description:
          "Kelenteng di Semarang yang menandai persinggahan Laksamana Cheng Ho pada awal abad ke-15. Dihormati umat Tridharma dan juga diziarahi umat Islam.",
        height: 1.5,
        ...commons("Sam Po Kong.jpg", "22Kartika", "CC BY-SA 3.0"),
      },
      {
        id: "foto-lumpia",
        kind: "kuliner",
        title: "Lumpia Semarang",
        description:
          "Kulit tipis berisi rebung, telur, dan udang, digoreng atau disajikan basah. Lumpia lahir dari perpaduan dapur Tionghoa dan Jawa di Semarang abad ke-19.",
        height: 1.4,
        ...commons("Loenpia Semarang.JPG", "Midori", "CC BY-SA 3.0"),
      },
      {
        id: "foto-soto-kudus",
        kind: "kuliner",
        title: "Soto Kudus",
        description:
          "Soto bening dalam mangkuk kecil. Di Kudus, soto memakai daging kerbau, bukan sapi, mengikuti tradisi menghormati umat Hindu yang dirintis Sunan Kudus.",
        height: 1.4,
        ...commons("Soto Kudus nasi.JPG", "Midori", "CC BY 3.0"),
      },
    ],
    quiz: [
      {
        q: "Candi Borobudur dibangun oleh wangsa...",
        options: ["Sanjaya", "Syailendra", "Rajasa", "Isyana"],
        answer: 1,
      },
      {
        q: "Empat tiang utama penyangga rumah Joglo disebut...",
        options: ["Saka guru", "Gonjong", "Pendapa", "Angkul-angkul"],
        answer: 0,
      },
      {
        q: "Perjanjian yang membagi Mataram menjadi Surakarta dan Yogyakarta adalah...",
        options: ["Perjanjian Linggarjati", "Perjanjian Renville", "Perjanjian Giyanti", "Perjanjian Bongaya"],
        answer: 2,
      },
    ],
  },
  {
    slug: "yogyakarta",
    mapId: "id-yo",
    island: "Jawa",
    name: "DI Yogyakarta",
    summary:
      "Daerah istimewa yang masih dipimpin Sultan. Keraton, batik, wayang kulit, dan Candi Prambanan hidup berdampingan dengan suasana kota pelajar.",
    house: {
      name: "Bangsal Kencono",
      description:
        "Balairung utama Keraton Yogyakarta berbentuk joglo dengan tiang-tiang kayu berukir dan berprada emas. Rumah rakyat Yogyakarta umumnya juga berbentuk joglo atau limasan.",
    },
    attire: {
      name: "Paes Ageng dan Surjan",
      description:
        "Pengantin gaya Yogyakarta memakai paes hitam bertepi emas di dahi dan kain dodot. Sehari-hari, abdi dalem laki-laki memakai surjan lurik dan blangkon.",
    },
    dance: {
      name: "Tari Serimpi",
      description: "Tari keraton yang dibawakan empat penari putri dengan gerak lambat dan halus, sering dimaknai sebagai lambang empat unsur dunia.",
    },
    music: { song: "Suwe Ora Jamu", instrument: "Gamelan Jawa" },
    history:
      "Kesultanan Yogyakarta berdiri setelah Perjanjian Giyanti (1755), dengan Pangeran Mangkubumi sebagai Sultan Hamengku Buwono I. Yogyakarta menjadi ibu kota Republik pada 1946–1949, dan keistimewaannya ditegaskan undang-undang pada 2012.",
    exhibits: [
      {
        id: "prambanan",
        kind: "bangunan",
        title: "Candi Prambanan (miniatur)",
        description: "Kompleks candi Hindu terbesar di Indonesia, dibangun pada abad ke-9. Candi utamanya, setinggi 47 meter, dipersembahkan untuk Siwa.",
        height: 4.6,
        ...sketchfab("cdd1b1ad94044be58d5fff6ae2485b37", "Candi Prambanan low poly", "imanboer", "CC BY 4.0", 0.5),
      },
      {
        id: "candi-apit",
        kind: "bangunan",
        title: "Candi Apit",
        description: "Salah satu dari dua candi apit di kompleks Prambanan, setinggi sekitar 14 meter. Model ini dipindai dari candi aslinya (fotogrametri).",
        height: 2.6,
        ...sketchfab("be4a9fe23f5a483e8e79093565ea4155", "Candi Apit", "dekahobby"),
      },
      {
        id: "bedug",
        kind: "seni",
        title: "Bedug",
        description: "Gendang besar dari kayu dan kulit yang ditabuh di serambi masjid-masjid Jawa untuk menandai waktu salat.",
        height: 1.4,
        ...sketchfab("15bbca47e2fc48b297a1347b0be24bc3", "Bedug", "apasipepgapuak", "CC BY 4.0", 0.25),
      },
      {
        id: "wayang-kulit",
        kind: "seni",
        title: "Wayang Kulit",
        description:
          "Tokoh wayang dipahat dari kulit kerbau lalu diwarnai. Dalang memainkannya di balik kelir dengan iringan gamelan. Wayang diakui UNESCO pada 2003.",
        height: 1.0,
        ...sketchfab("c0d39bc019294e679d86b34077711fb4", "Wayang jawa Bima Yudistira", "argaanug"),
      },
      {
        id: "foto-kraton",
        kind: "bangunan",
        title: "Keraton Yogyakarta",
        description: "Regol Donopratopo, gerbang menuju halaman inti Keraton Yogyakarta, dijaga sepasang arca raksasa dwarapala.",
        height: 1.5,
        ...commons("Jogja - Kraton Yogyakarta - Donopratono gate (2025) - img 01.jpg", "Chainwit.", "CC BY 4.0"),
      },
      {
        id: "foto-batik-imogiri",
        kind: "busana",
        title: "Batik Tulis Imogiri",
        description: "Pembatik di Imogiri, Bantul, menorehkan malam dengan canting. Batik Indonesia diakui UNESCO pada 2009.",
        height: 1.5,
        ...commons("Maestro Batik Tulis di Imogiri.jpg", "Aconkyeah", "CC BY-SA 4.0"),
      },
      {
        id: "jajan-pasar",
        kind: "kuliner",
        title: "Tampah Jajan Pasar",
        description: "Aneka kue basah di atas tampah beralas daun pisang: lapis, klepon, cenil, dan lainnya. Biasa disajikan saat kenduri dan hajatan.",
        height: 0.35,
        ...sketchfab("e60db9e375204dfb9f427f9b265018f5", "Indonesian traditional cake", "Kyyy_24", "CC BY 4.0"),
      },
      {
        id: "foto-tugu-jogja",
        kind: "bangunan",
        title: "Tugu Yogyakarta",
        description:
          "Tugu putih di utara Keraton, segaris dengan Keraton dan Panggung Krapyak. Garis ini disebut Sumbu Filosofi dan diakui UNESCO sebagai Warisan Dunia pada 2023.",
        height: 1.6,
        ...commons("Yogyakarta Indonesia Tugu-Yogyakarta-01.jpg", "CEphoto, Uwe Aranas", "CC BY-SA 3.0"),
      },
      {
        id: "foto-taman-sari",
        kind: "bangunan",
        title: "Taman Sari",
        description:
          "Bekas taman dan pemandian keluarga raja yang dibangun Sultan Hamengkubuwono I pada abad ke-18, lengkap dengan kolam, lorong bawah tanah, dan masjid bawah tanah.",
        height: 1.6,
        ...commons("Taman Sari Water Castle, Yogyakarta, 20220818 1041 8964.jpg", "Jakub Hałun", "CC BY-SA 4.0"),
      },
      {
        id: "foto-gudeg",
        kind: "kuliner",
        title: "Gudeg",
        description:
          "Nangka muda dimasak berjam-jam dengan gula aren dan santan hingga cokelat dan manis, disajikan dengan ayam, telur, dan sambal krecek. Yogyakarta dijuluki Kota Gudeg.",
        height: 1.4,
        ...commons("Gudeg Wijilan Yogyakarta Ayam.JPG", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-bakpia",
        kind: "kuliner",
        title: "Bakpia Pathok",
        description:
          "Kue bulat berkulit tipis berisi kacang hijau, oleh-oleh khas Yogyakarta. Namanya dari kampung Pathuk, tempat perajin Tionghoa membuatnya sejak pertengahan abad ke-20.",
        height: 1.4,
        ...commons("Bakpia Pathok 3.jpg", "Sibiru45", "CC BY 4.0"),
      },
      {
        id: "foto-wedang-uwuh",
        kind: "kuliner",
        title: "Wedang Uwuh",
        description:
          "Minuman rempah dari Imogiri: jahe, kayu secang, cengkih, kayu manis, dan daun-daunan. Uwuh berarti sampah, karena isinya mirip tumpukan daun kering.",
        height: 1.4,
        ...commons("Wedang Uwuh Jawa.jpg", "M Joko Apriyo Putro", "CC BY-SA 4.0"),
      },
      {
        id: "foto-surjan",
        kind: "busana",
        title: "Surjan Lurik",
        description:
          "Kemeja berkerah tegak dari kain lurik bergaris, dipakai laki-laki Yogyakarta bersama blangkon dan kain batik, misalnya saat kirab budaya.",
        height: 1.6,
        ...commons("Kirab Merti Dusun Wiwit Srawung, Dusun Glondong, Panggungharjo, Bantul.jpg", "Arifah R Agrin", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Candi Prambanan adalah candi...",
        options: ["Buddha", "Hindu", "Peninggalan Islam", "Megalitik"],
        answer: 1,
      },
      {
        q: "Raja pertama Kesultanan Yogyakarta adalah...",
        options: ["Sultan Agung", "Pakubuwono II", "Pangeran Diponegoro", "Hamengku Buwono I"],
        answer: 3,
      },
      {
        q: "Yogyakarta pernah menjadi ibu kota Republik Indonesia pada tahun...",
        options: ["1945–1946", "1946–1949", "1950–1955", "1965–1966"],
        answer: 1,
      },
    ],
  },
  {
    slug: "jawa-timur",
    mapId: "id-ji",
    island: "Jawa",
    name: "Jawa Timur",
    summary: "Dari Majapahit hingga Madura: tanah Reog Ponorogo, karapan sapi, dan budaya Osing di Banyuwangi.",
    house: {
      name: "Rumah Osing",
      description:
        "Rumah adat suku Osing di Banyuwangi berdinding papan kayu. Bentuk atapnya menandai jenis rumah: tikel balung, crocogan, atau baresan.",
    },
    attire: {
      name: "Pesa'an (Madura)",
      description:
        "Laki-laki Madura memakai pesa'an hitam longgar dengan kaus bergaris merah-putih dan ikat kepala odheng; perempuan memakai kebaya rancongan dengan kain batik.",
    },
    dance: {
      name: "Reog Ponorogo",
      description:
        "Pembarong mengangkat dadak merak, topeng kepala harimau bermahkota bulu merak seberat puluhan kilogram, hanya dengan kekuatan gigitan. Diakui UNESCO pada 2024.",
    },
    music: { song: "Rek Ayo Rek", instrument: "Gamelan reog dan slompret" },
    history:
      "Majapahit, berpusat di Trowulan, menjadi kerajaan terbesar di Nusantara pada abad ke-14 di bawah Hayam Wuruk dan Mahapatih Gajah Mada. Surabaya dijuluki Kota Pahlawan karena pertempuran 10 November 1945.",
    exhibits: [
      {
        id: "rumah-osing",
        kind: "bangunan",
        title: "Rumah Osing",
        description: "Rumah adat suku Osing, keturunan masyarakat Blambangan di Banyuwangi. Rangka kayunya disambung dengan pasak.",
        height: 3.0,
        ...sketchfab("5d19da76945f4447a747e315a5a6e66f", "Rumah Adat Osing", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "reog",
        kind: "seni",
        title: "Reog Ponorogo",
        description: "Pembarong dengan dadak merak: topeng harimau bermahkota ratusan helai bulu merak.",
        height: 2.2,
        turn: 180,
        ...sketchfab("200b1ead86ac497e94cfb3680de055d1", "Reog Ponorogo", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "karapan-sapi",
        kind: "tradisi",
        title: "Karapan Sapi",
        description: "Lomba pacu sepasang sapi yang menarik kaleles (kereta kayu) dengan joki di atasnya, tradisi masyarakat Madura.",
        height: 1.3,
        ...sketchfab("37886c51f45d4d45aea39e6652e218e6", "Karapan Sapi Madura", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "gandrung",
        kind: "seni",
        title: "Tari Gandrung",
        description: "Tari khas Banyuwangi sebagai ungkapan syukur setelah panen. Penari membawa kipas dan bermahkota omprok.",
        height: 1.7,
        ...sketchfab("c2214f5b7de7403797b04324b0d41405", "3D Tari Gandrung", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "busana-madura",
        kind: "busana",
        title: "Busana Adat Madura",
        description: "Pasangan berbusana adat Madura: pesa'an dan kaus garis merah-putih untuk laki-laki, kebaya untuk perempuan.",
        height: 1.7,
        ...sketchfab("a70de5cfe1fc42f2a67b09394f179d0e", "Baju Adat Madura", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "candi-jabung",
        kind: "bangunan",
        title: "Candi Jabung",
        description:
          "Candi Buddha bata merah di Probolinggo, peninggalan Majapahit abad ke-14. Kakawin Nagarakretagama menyebutnya Bajrajinaparamitapura.",
        height: 2.6,
        ...sketchfab("4702e8bd0a534dd285b8fa90fd273ccb", "Candi Jabung Bukti Kejayaan Budha Masa Majapahit", "ayusonia.asep27"),
      },
      {
        id: "foto-reog",
        kind: "seni",
        title: "Pertunjukan Reog",
        description: "Rombongan Reog Ponorogo tampil di acara Eksotika Bromo.",
        height: 1.5,
        ...commons("Reog ponorogo dalam event eksotika bromo.jpg", "Ferry pepenk", "CC BY-SA 4.0"),
      },
      {
        id: "suramadu",
        kind: "bangunan",
        title: "Jembatan Suramadu",
        description: "Jembatan sepanjang 5,4 km yang menyambung Surabaya dan Pulau Madura, diresmikan pada 2009, jembatan terpanjang di Indonesia saat itu.",
        height: 1.6,
        ...sketchfab("a3b920f8f4f845468d832c5d4a935717", "Jembatan Suramadu", "giga", "CC BY 4.0"),
      },
      {
        id: "suro-boyo",
        kind: "bangunan",
        title: "Patung Suro dan Boyo",
        description:
          "Ikon Surabaya: ikan hiu (suro) dan buaya (boyo) yang bertarung, dari legenda asal-usul nama kota. Patung aslinya berdiri di depan Kebun Binatang Surabaya.",
        height: 2.6,
        ...sketchfab("5394339b482445029c7b50af05380501", "Monumen Suro dan Boyo", "PixForge", "CC BY 4.0", 0.05),
      },
      {
        id: "pecel-madiun",
        kind: "kuliner",
        title: "Pecel Madiun",
        description:
          "Sayuran rebus bersiram sambal kacang pedas dengan rempeyek, tempe, dan telur, sering disajikan di atas pincuk daun pisang. Madiun dijuluki Kota Pecel.",
        height: 0.4,
        ...sketchfab("f6ea14ea376649258201ee3b26ef8abc", "Pecel Madiun Version 02", "PixForge", "CC BY 4.0", 0.03),
      },
      {
        id: "rujak-soto",
        kind: "kuliner",
        title: "Rujak Soto",
        description: "Paduan khas Banyuwangi: rujak sayur bersambal petis yang disiram kuah soto daging. Dua hidangan dalam satu mangkuk.",
        height: 0.4,
        ...sketchfab("188a2b1f86fa4cc88524e663dc8c7edb", "Rujak Soto", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.1),
      },
      {
        id: "jebeng-thulik",
        kind: "busana",
        title: "Jebeng dan Thulik",
        description:
          "Jebeng dan thulik adalah sebutan gadis dan pemuda Osing, Banyuwangi. Pasangan ini memakai busana adat Osing dengan udeng, sabuk, dan kain batik khas Banyuwangi.",
        height: 1.8,
        ...sketchfab("f562a90fd50f4431ad930d7906d1a3cf", "Jebeng Thulik", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "foto-rawon",
        kind: "kuliner",
        title: "Rawon",
        description:
          "Sup daging sapi berkuah hitam dari kluwek, disajikan dengan tauge pendek, telur asin, dan sambal. Kata rarawwan di Prasasti Taji (901 M) sering disebut sebagai jejak awalnya.",
        height: 1.4,
        ...commons("Rawon Setan.jpg", "christian r from Jakarta", "CC BY-SA 2.0"),
      },
    ],
    quiz: [
      {
        q: "Topeng raksasa dalam Reog Ponorogo dihiasi bulu burung...",
        options: ["Merak", "Elang", "Kasuari", "Cenderawasih"],
        answer: 0,
      },
      {
        q: "Karapan sapi adalah tradisi masyarakat...",
        options: ["Osing", "Tengger", "Madura", "Samin"],
        answer: 2,
      },
      {
        q: "Mahapatih Majapahit yang terkenal dengan Sumpah Palapa adalah...",
        options: ["Hayam Wuruk", "Gajah Mada", "Ken Arok", "Raden Wijaya"],
        answer: 1,
      },
    ],
  },
  {
    slug: "bali",
    mapId: "id-ba",
    island: "Bali & Nusa Tenggara",
    name: "Bali",
    summary:
      "Pulau dengan kalender upacara yang padat, tempat seni, adat, dan ajaran Hindu Bali menyatu dalam keseharian.",
    house: {
      name: "Rumah Bali (Bale)",
      description:
        "Satu rumah terdiri dari beberapa bale terpisah yang ditata menurut Asta Kosala Kosali, aturan arsitektur tradisional Bali. Pintu masuknya berupa gerbang angkul-angkul.",
    },
    attire: {
      name: "Payas Agung",
      description:
        "Busana pengantin kebesaran dengan mahkota bunga emas dan kain songket. Untuk ke pura sehari-hari, laki-laki memakai kamen dan udeng.",
    },
    dance: {
      name: "Tari Kecak",
      description:
        "Puluhan penari laki-laki duduk melingkar dan menyerukan \"cak\" berirama tanpa gamelan, membawakan kisah Ramayana. Bentuknya dikembangkan pada 1930-an dari ritual sanghyang.",
    },
    music: { song: "Janger", instrument: "Gamelan gong kebyar" },
    history:
      "Pengaruh Hindu-Buddha tercatat di Bali sejak prasasti abad ke-9. Setelah Majapahit runtuh, banyak bangsawan dan seniman Jawa pindah ke Bali dan ikut membentuk budaya yang kita kenal sekarang.",
    exhibits: [
      {
        id: "candi-bentar",
        kind: "bangunan",
        title: "Candi Bentar",
        description:
          "Gerbang terbelah dua yang menandai pintu masuk kawasan pura atau puri di Bali. Kedua sisinya simetris, seperti gunung yang dibelah.",
        height: 3.4,
        ...sketchfab("9051dc244c984da8a1a4ec7e90e1a567", "Candi Bentar", "nusaheritage.id", "CC BY 4.0", 0.5),
      },
      {
        id: "barong",
        kind: "seni",
        title: "Topeng Barong",
        description: "Barong adalah makhluk mitologis pelindung, lambang kebaikan, yang bertarung melawan Rangda dalam tari Barong.",
        height: 0.8,
        ...sketchfab("a2291d968fd34b2798d18ab6f539595f", "Balinese Barong Mask PBR", "Jungle Jim"),
      },
      {
        id: "topeng-bali",
        kind: "seni",
        title: "Topeng Tari",
        description: "Topeng kayu berukir untuk tari topeng Bali. Setiap topeng mewakili satu tokoh, dari raja sampai pelawak.",
        height: 0.55,
        ...sketchfab("4f9a1f4034c843bbb46ddc44758d379c", "Dancing Mask from Bali - Low poly version", "Troels BP"),
      },
      {
        id: "penjor",
        kind: "tradisi",
        title: "Penjor",
        description: "Bambu melengkung berhias janur yang dipasang di depan rumah saat Galungan, lambang gunung dan rasa syukur.",
        height: 2.6,
        ...sketchfab("7aca638e85d04c1699c04918cdc36a9e", "Balinese Penjor", "alterego.visual"),
      },
      {
        id: "foto-kecak",
        kind: "seni",
        title: "Tari Kecak",
        description: "Lingkaran penari kecak menyerukan \"cak\" bersahutan di sekeliling api, membawakan kisah Ramayana.",
        height: 1.5,
        ...commons("Kecak Dance Indonesia 1.jpg", "Philip Nalangan", "CC BY-SA 4.0"),
      },
      {
        id: "foto-legong",
        kind: "seni",
        title: "Tari Legong",
        description:
          "Tarian klasik Bali dengan gerak mata dan jari yang detail. Legong Keraton termasuk tari Bali yang diakui UNESCO pada 2015.",
        height: 1.5,
        ...commons("Legong Dance Indonesia 1.jpg", "Philip Nalangan", "CC BY-SA 4.0"),
      },
      {
        id: "gwk",
        kind: "bangunan",
        title: "Garuda Wisnu Kencana",
        description: "Patung Dewa Wisnu menunggang Garuda di Ungasan karya pematung Nyoman Nuarta. Diresmikan pada 2018, tingginya 121 m bersama alasnya.",
        height: 2.8,
        ...sketchfab("04455b3cf8264a4d9e8906ecb48bd774", "Garuda Wisnu Kencana", "PixForge", "CC BY 4.0", 0.05),
      },
      {
        id: "kaliadrem",
        kind: "kuliner",
        title: "Kaliadrem",
        description: "Kue cincin dari tepung beras dan gula merah yang digoreng. Selain jajanan, kaliadrem menjadi pelengkap banten (sesajen) upacara.",
        height: 0.3,
        ...sketchfab("92bd7ee344a44d6da1767e17c926e7a5", "Kaliadrem Bali", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.1),
      },
      {
        id: "pie-susu",
        kind: "kuliner",
        title: "Pie Susu",
        description: "Pai kecil berisi custard susu dan telur yang manis, oleh-oleh paling populer dari Bali.",
        height: 0.25,
        ...sketchfab("345b4dd476b54544b84f1ac59d60aee4", "Pie Susu / Milk Pie", "andikapratamaw", "CC BY 4.0"),
      },
      {
        id: "foto-ulun-danu",
        kind: "bangunan",
        title: "Pura Ulun Danu Beratan",
        description: "Pura di tepi Danau Beratan, Bedugul, untuk memuja Dewi Danu, dewi air dan kesuburan. Meru bertingkatnya tampak mengapung di atas danau.",
        height: 1.5,
        ...commons("Pura Ulun Danu Beratan.jpg", "Susan.wibowo", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tanah-lot",
        kind: "bangunan",
        title: "Pura Tanah Lot",
        description:
          "Pura di atas batu karang di pantai Tabanan yang dikelilingi laut saat pasang. Menurut tradisi didirikan oleh Dang Hyang Nirartha pada abad ke-16.",
        height: 1.5,
        ...commons("Tanah Lot, Bali, Indonesia, 20220827 1008 1159.jpg", "Jakub Hałun", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sate-lilit",
        kind: "kuliner",
        title: "Sate Lilit",
        description: "Daging cincang berbumbu base genep yang dililitkan pada batang serai atau bambu pipih, lalu dibakar.",
        height: 1.5,
        ...commons("Sate Lilit.jpg", "Kresnanta", "CC BY-SA 4.0"),
      },
      {
        id: "foto-payas-agung",
        kind: "busana",
        title: "Payas Agung",
        description:
          "Tata rias pengantin agung Bali dengan mahkota bunga emas yang tinggi, kain songket, dan perhiasan keemasan, dahulu khusus kalangan bangsawan.",
        height: 1.6,
        ...commons("Balinese bride praying.jpg", "KitHamilton", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Aturan arsitektur tradisional Bali disebut...",
        options: ["Primbon", "Asta Kosala Kosali", "Tri Tangtu", "Lontara"],
        answer: 1,
      },
      {
        q: "Tari Kecak diiringi oleh...",
        options: ["Gamelan gong kebyar", "Angklung", "Tifa", "Seruan \"cak\" para penari"],
        answer: 3,
      },
      {
        q: "Gerbang masuk rumah tradisional Bali disebut...",
        options: ["Angkul-angkul", "Joglo", "Gonjong", "Honai"],
        answer: 0,
      },
    ],
  },
  {
    slug: "nusa-tenggara-barat",
    mapId: "id-nb",
    island: "Bali & Nusa Tenggara",
    name: "Nusa Tenggara Barat",
    summary: "Lombok dan Sumbawa, tanah suku Sasak, Samawa, dan Mbojo. Gunung Rinjani dan Tambora menjulang di kedua pulau ini.",
    house: {
      name: "Bale Sasak",
      description:
        "Rumah Sasak berdinding anyaman bambu dengan atap alang-alang yang rendah, sehingga tamu harus menunduk sebagai tanda hormat. Lantainya dari tanah liat yang dulu digosok kotoran kerbau agar keras.",
    },
    attire: {
      name: "Lambung dan Pegon",
      description:
        "Perempuan Sasak memakai lambung, baju hitam tanpa lengan dengan selendang dan kain songket. Laki-laki memakai pegon, jas bergaya Jawa, dengan sapuq (ikat kepala) dan kain.",
    },
    dance: {
      name: "Peresean",
      description:
        "Dua petarung (pepadu) saling serang dengan tongkat rotan dan menangkis dengan perisai kulit kerbau, diiringi gamelan. Dulu digelar untuk merayakan kemenangan dan memohon hujan.",
    },
    music: { song: "Moree", instrument: "Gendang beleq" },
    history:
      "Letusan Tambora di Sumbawa pada April 1815 adalah letusan gunung api terbesar dalam sejarah yang tercatat; tahun berikutnya dikenal di Eropa sebagai tahun tanpa musim panas. Kesultanan Bima dan Sumbawa berkembang di timur, sementara Lombok pernah dikuasai kerajaan Bali dari Karangasem.",
    exhibits: [
      {
        id: "rinjani",
        kind: "alam",
        title: "Gunung Rinjani (diorama)",
        description:
          "Gunung api setinggi 3.726 meter di Lombok, dengan danau kawah Segara Anak dan anak gunung Barujari di dalamnya. Masyarakat Sasak menghormatinya sebagai gunung suci.",
        height: 2.0,
        ...sketchfab("914a3d99819c44da8f67ae4283a8e676", "Rinjani volcano, Lombok, Indonesia", "Jack M Simmons", "CC BY 4.0", 0.15),
      },
      {
        id: "keris-lombok",
        kind: "benda",
        title: "Keris Lombok",
        description: "Keris berbilah lurus. Bagi masyarakat Sasak, keris diwariskan turun-temurun sebagai pusaka keluarga.",
        height: 0.55,
        ...sketchfab("a13dcb73a4a94913a14a5d7568b590cb", "Lombok Keris Dagger", "Yudha Mfr"),
      },
      {
        id: "foto-lumbung-sasak",
        kind: "bangunan",
        title: "Lumbung Sasak",
        description: "Lumbung padi beratap alang-alang berbentuk seperti topi di Desa Sade. Bentuknya menjadi ikon Lombok.",
        height: 1.6,
        ...commons("Rice barn Traditional Sasak Village Sade.JPG", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-peresean",
        kind: "tradisi",
        title: "Peresean",
        description: "Dua pepadu beradu tongkat rotan dengan perisai kulit kerbau di tengah sorakan penonton.",
        height: 1.5,
        ...commons("Peresean Lombok.jpg", "Focusfeel", "CC BY-SA 4.0"),
      },
      {
        id: "foto-gendang-beleq",
        kind: "seni",
        title: "Gendang Beleq",
        description: "Gendang besar Sasak yang dimainkan sambil berjalan. Dulu mengiringi prajurit ke medan perang, kini mengarak pengantin.",
        height: 1.5,
        ...commons("Raiyani Muharramah Gendang beleq DSCF8502a.jpg", "RaiyaniM", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bau-nyale",
        kind: "tradisi",
        title: "Bau Nyale",
        description: "Warga turun ke pantai selatan Lombok sebelum fajar untuk menangkap nyale (cacing laut), yang dipercaya jelmaan Putri Mandalika.",
        height: 1.5,
        ...commons("Event Rakyat Lombok, Bau Nyale.jpg", "San jmx", "CC BY-SA 4.0"),
      },
      {
        id: "foto-dalam-loka",
        kind: "bangunan",
        title: "Istana Dalam Loka",
        description: "Istana kayu Kesultanan Sumbawa di Sumbawa Besar, dibangun pada 1885.",
        height: 1.5,
        ...commons("IstanaDL.jpg", "MosheA", "CC BY-SA 4.0"),
      },
      {
        id: "foto-islamic-center-ntb",
        kind: "bangunan",
        title: "Islamic Center NTB",
        description: "Masjid Hubbul Wathan di Mataram dengan menara utama setinggi 99 m, diresmikan pada 2016. Lombok dijuluki Pulau Seribu Masjid.",
        height: 1.5,
        ...commons("Ismalic Center, Ikon Pulau 1000 Masjid Lombok.jpg", "Road97", "CC BY-SA 4.0"),
      },
      {
        id: "foto-busana-sasak",
        kind: "busana",
        title: "Busana Adat Sasak",
        description:
          "Laki-laki Sasak memakai sapuq (ikat kepala) dan kain tenun; perempuan memakai lambung, baju hitam berleher V, dengan selendang. Foto di Bayan, Lombok Utara.",
        height: 1.6,
        ...commons("Pakaian Adat di Rumah Tenun Kain Tradisional Sasak Bayan, Jajaq Bayan.jpg", "Fnocommons", "CC0"),
      },
      {
        id: "foto-ayam-taliwang",
        kind: "kuliner",
        title: "Ayam Taliwang",
        description:
          "Ayam kampung muda dibakar atau digoreng lalu dilumuri sambal cabai, bawang, dan terasi. Namanya dari Kampung Taliwang di Mataram, Lombok.",
        height: 1.4,
        ...commons("Ayam bakar khas Taliwang 2.JPG", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-plecing",
        kind: "kuliner",
        title: "Plecing Kangkung",
        description: "Kangkung Lombok yang renyah direbus lalu disiram sambal tomat dan terasi, ditaburi kacang dan perasan jeruk limau.",
        height: 1.4,
        ...commons("Pelecing kangkung Lombok.JPG", "Midori", "CC BY 3.0"),
      },
    ],
    quiz: [
      {
        q: "Gunung di Sumbawa yang meletus dahsyat pada 1815 adalah...",
        options: ["Rinjani", "Tambora", "Krakatau", "Agung"],
        answer: 1,
      },
      {
        q: "Tradisi menangkap cacing laut di pantai selatan Lombok disebut...",
        options: ["Bau Nyale", "Pasola", "Kasada", "Tabot"],
        answer: 0,
      },
      {
        q: "Seni beradu tongkat rotan dan perisai dari suku Sasak disebut...",
        options: ["Caci", "Pencak", "Peresean", "Karapan"],
        answer: 2,
      },
    ],
  },
  {
    slug: "nusa-tenggara-timur",
    mapId: "id-nt",
    island: "Bali & Nusa Tenggara",
    name: "Nusa Tenggara Timur",
    summary: "Gugusan pulau dari Flores, Sumba, dan Timor sampai Rote: rumah kerucut Wae Rebo, tenun ikat, sasando, dan komodo.",
    house: {
      name: "Mbaru Niang",
      description:
        "Rumah kerucut lima tingkat beratap ijuk di Desa Wae Rebo, Flores. Tingkat teratas untuk sesaji leluhur. Pelestariannya meraih penghargaan UNESCO Asia-Pasifik pada 2012.",
    },
    attire: {
      name: "Tenun Ikat",
      description:
        "Busana adat NTT memakai kain tenun ikat yang motifnya berbeda di tiap pulau. Di Sumba, laki-laki memakai kain hinggi sebagai selimut bahu dan sarung.",
    },
    dance: {
      name: "Tari Caci",
      description:
        "Dua penari laki-laki Manggarai bergantian menyerang dengan cambuk dan menangkis dengan perisai, diiringi gong dan gendang. Dipentaskan saat syukur panen dan upacara adat.",
    },
    music: { song: "Bolelebo", instrument: "Sasando" },
    history:
      "Di Liang Bua, Flores, ditemukan fosil Homo floresiensis, manusia purba bertubuh kecil, pada 2003. Taman Nasional Komodo, habitat kadal terbesar di dunia, menjadi Situs Warisan Dunia UNESCO pada 1991.",
    exhibits: [
      {
        id: "komodo",
        kind: "alam",
        title: "Komodo",
        description: "Kadal terbesar di dunia yang hanya hidup liar di Pulau Komodo, Rinca, dan sebagian Flores. Panjangnya bisa mencapai 3 meter.",
        height: 1.2,
        ...sketchfab("0b8679521991420a8b48a6e63018f52c", "Komodo Dragon", "all of life"),
      },
      {
        id: "sasando",
        kind: "seni",
        title: "Sasando",
        description: "Alat musik petik dari Pulau Rote: tabung bambu berdawai yang dikelilingi wadah anyaman daun lontar sebagai pengeras suara.",
        height: 0.9,
        ...sketchfab("a9d239d1914b4543b95ed62b5e3465d3", "sasando", "KevinGathfan"),
      },
      {
        id: "patung-tetun",
        kind: "benda",
        title: "Patung Kayu Tetun",
        description:
          "Dua sosok saling memunggungi, koleksi UPTD Museum NTT. Menurut kurator museum, patung ini menggambarkan kisah Tetun tentang kakak-beradik yatim piatu yang bertahan karena saling percaya.",
        height: 1.4,
        ...sketchfab("1bd4b202a8c543b7a755c48b9fbd4b00", "Wooden Statue, UPTD Museum Nusa Tenggara Timur", "Maritime Asia Heritage Survey", "CC BY 4.0", 0.08),
      },
      {
        id: "foto-wae-rebo",
        kind: "bangunan",
        title: "Kampung Wae Rebo",
        description: "Mbaru niang beratap ijuk di Wae Rebo, kampung adat Manggarai di pegunungan Flores.",
        height: 1.5,
        ...commons("Wae Rebo village, Flores Island, Indonesia, 20250824 0753 3029.jpg", "Jakub Hałun", "CC BY 4.0"),
      },
      {
        id: "foto-pasola",
        kind: "tradisi",
        title: "Pasola",
        description: "Dua kelompok penunggang kuda saling melempar lembing kayu, bagian dari upacara adat Marapu di Sumba menjelang musim tanam.",
        height: 1.5,
        ...commons("Pasola.jpg", "RaiyaniM", "CC BY-SA 4.0"),
      },
      {
        id: "foto-hinggi",
        kind: "busana",
        title: "Hinggi Kombu",
        description: "Kain tenun ikat laki-laki dari Sumba yang dicelup merah dengan akar mengkudu. Koleksi Honolulu Museum of Art.",
        height: 1.8,
        ...commons("Hinggi kombu (man's mantle or wrapper) from Sumba, Indonesia, Honolulu Museum of Art, 9742.1.JPG", "Honolulu Museum of Art", "CC0"),
      },
      {
        id: "foto-sei",
        kind: "kuliner",
        title: "Se'i",
        description:
          "Daging yang diasap pelan di atas bara kayu kosambi hingga merah dan harum. Dalam bahasa Rote, se'i berarti daging yang diiris tipis memanjang.",
        height: 1.4,
        ...commons("Se'i Babi 1.JPG", "Gunawan Kartapranata", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jagung-bose",
        kind: "kuliner",
        title: "Jagung Bose",
        description: "Bubur jagung putih dengan kacang dan santan, makanan pokok orang Timor sejak sebelum nasi umum dimakan.",
        height: 1.4,
        ...commons("Jagung Bose.jpg", "Blogger Eksis", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Alat musik petik dari Pulau Rote adalah...",
        options: ["Sasando", "Sape'", "Kolintang", "Angklung"],
        answer: 0,
      },
      {
        q: "Rumah kerucut di Desa Wae Rebo disebut...",
        options: ["Honai", "Mbaru Niang", "Lamin", "Joglo"],
        answer: 1,
      },
      {
        q: "Tradisi saling melempar lembing di atas kuda dari Sumba disebut...",
        options: ["Caci", "Karapan", "Pasola", "Debus"],
        answer: 2,
      },
    ],
  },
  {
    slug: "kalimantan-barat",
    mapId: "id-kb",
    island: "Kalimantan",
    name: "Kalimantan Barat",
    summary:
      "Provinsi yang dilintasi garis khatulistiwa dan Sungai Kapuas, sungai terpanjang di Indonesia. Budaya Dayak, Melayu, dan Tionghoa hidup berdampingan.",
    house: {
      name: "Rumah Radakng",
      description:
        "Rumah panjang Dayak Kanayatn yang dihuni banyak keluarga di bawah satu atap. Replika Rumah Radakng di Pontianak panjangnya sekitar 138 meter.",
    },
    attire: {
      name: "King Baba dan King Bibinge",
      description:
        "Busana Dayak dari kulit kayu kapuo yang dipukul-pukul sampai lentur, lalu dilukis motif khas. King Baba untuk laki-laki, King Bibinge untuk perempuan.",
    },
    dance: {
      name: "Tari Jepin",
      description:
        "Tari Melayu yang serumpun dengan zapin, dibawakan berkelompok dengan iringan gambus, gendang, dan rebana. Di Pontianak, jepin ditarikan beramai-ramai dalam festival.",
    },
    music: { song: "Cik Cik Periuk", instrument: "Sape' dan gambus" },
    history:
      "Pontianak didirikan Syarif Abdurrahman Alkadrie pada 1771 di pertemuan Sungai Kapuas dan Landak. Tugu Khatulistiwa pertama dibangun pada 1928. Setiap Maret dan September matahari tepat di atas kepala, sehingga bayangan benda tegak menghilang sesaat.",
    exhibits: [
      {
        id: "tugu-khatulistiwa",
        kind: "bangunan",
        title: "Tugu Khatulistiwa (miniatur)",
        description: "Tugu penanda garis lintang nol derajat di Pontianak. Tugu aslinya dari 1928 kini dilindungi di dalam gedung berkubah.",
        height: 3.0,
        ...sketchfab("382e6c295e1d438f9a84efbe48a5aa4e", "Tugu Katulistiwa 3D", "SAW IND"),
      },
      {
        id: "tempayan-naga",
        kind: "benda",
        title: "Tempayan Naga Singkawang",
        description:
          "Tempayan keramik berhias naga dari tungku-tungku di Singkawang. Di rumah panjang Dayak, tempayan menjadi harta keluarga dan bagian mas kawin.",
        height: 0.9,
        ...sketchfab("70dc22fcecdf418e8a9872f27b58b9da", "Tempayan Naga Singkawang", "tidayu.culture", "CC BY 4.0", 0.15),
      },
      {
        id: "gambus-pontianak",
        kind: "seni",
        title: "Gambus Melayu",
        description: "Alat musik petik yang dibawa pedagang Arab ke Nusantara. Di Pontianak, gambus mengiringi tari jepin dan lagu-lagu Melayu.",
        height: 1.0,
        ...sketchfab("3744c2072b654389a1bd1924899fff92", "Gambus Melayu Pontianak", "tidayu.culture", "CC BY 4.0", 0.15),
      },
      {
        id: "ambinan",
        kind: "benda",
        title: "Ambinan",
        description: "Gendongan bayi Dayak dari rotan dengan papan berukir. Motifnya dipercaya melindungi bayi dari roh jahat.",
        height: 0.6,
        ...sketchfab("6ab34d13b5b94a60918c9cf29437a0d3", "Ambinan Dayak", "tidayu.culture", "CC BY 4.0", 0.15),
      },
      {
        id: "pakaian-kapuak",
        kind: "busana",
        title: "Pakaian Kulit Kayu",
        description: "Rompi dari kulit kayu kapuo yang dipukul sampai tipis dan lentur, bahan yang sama dengan busana King Baba.",
        height: 1.1,
        ...sketchfab("4b5ee675cb2646d8b7e089d6769d0572", "Pakaian Kapuak Dayak", "tidayu.culture", "CC BY 4.0", 0.15),
      },
      {
        id: "foto-istana-kadriah",
        kind: "bangunan",
        title: "Istana Kadriah",
        description: "Istana kayu Kesultanan Pontianak di tepi Sungai Kapuas, berdiri sejak masa Sultan Syarif Abdurrahman Alkadrie.",
        height: 1.5,
        ...commons("Keraton Kadariah 01.jpg", "Zhilal Darma", "CC BY-SA 4.0"),
      },
      {
        id: "foto-radakng",
        kind: "bangunan",
        title: "Rumah Radakng",
        description: "Rumah panjang Dayak Kanayatn di Pontianak yang berdiri di atas tiang-tiang tinggi.",
        height: 1.5,
        ...commons("Rumah Radakng di Pontianak (2026) 02.jpg", "Medelam", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tatung",
        kind: "tradisi",
        title: "Tatung Cap Go Meh",
        description: "Pada perayaan Cap Go Meh di Singkawang, para tatung diarak dan memperlihatkan kekebalan tubuh, perpaduan tradisi Tionghoa dan Dayak.",
        height: 1.6,
        ...commons("Tatung in Singkawang showing his power to negate pain to sharp object.jpg", "Reynardo Etenia Wongso", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jepin",
        kind: "seni",
        title: "Tari Jepin",
        description: "Ratusan penari membawakan jepin massal di Pontianak.",
        height: 1.5,
        ...commons("Tari Jepin Masal Kota Pontianak.jpg", "Aliff12", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-jami",
        kind: "bangunan",
        title: "Masjid Jami Sultan Syarif Abdurrahman",
        description:
          "Masjid tertua di Pontianak, di tepi Sungai Kapuas dekat Istana Kadriah. Berawal dari surau yang didirikan sultan pertama Pontianak pada 1771, atapnya bersusun empat.",
        height: 1.5,
        ...commons("Masjid Sultan Syarif Abdurrahman 01.jpg", "Zhilal Darma", "CC BY-SA 4.0"),
      },
      {
        id: "foto-choi-pan",
        kind: "kuliner",
        title: "Choi Pan",
        description:
          "Kue kukus berkulit tepung beras tipis berisi bengkuang, rebung, atau kucai, disantap dengan sambal dan bawang putih goreng. Jajanan Tionghoa khas Pontianak.",
        height: 1.4,
        ...commons("Choi pan or chai kue.jpg", "Fitri Penyalai", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Kota yang dilintasi garis khatulistiwa dan memiliki tugu penandanya adalah...",
        options: ["Pontianak", "Palangka Raya", "Samarinda", "Banjarmasin"],
        answer: 0,
      },
      {
        q: "Busana King Baba dibuat dari...",
        options: ["Sutra", "Kulit kayu", "Serat nanas", "Kapas"],
        answer: 1,
      },
      {
        q: "Perayaan di Singkawang yang menampilkan arak-arakan tatung adalah...",
        options: ["Galungan", "Sekaten", "Cap Go Meh", "Erau"],
        answer: 2,
      },
    ],
  },
  {
    slug: "kalimantan-tengah",
    mapId: "id-kt",
    island: "Kalimantan",
    name: "Kalimantan Tengah",
    summary: "Hutan rawa gambut dan sungai-sungai besar seperti Kahayan dan Barito, tanah suku Dayak Ngaju, Ma'anyan, dan Ot Danum.",
    house: {
      name: "Rumah Betang",
      description:
        "Rumah panjang di atas tiang tinggi yang dihuni beberapa keluarga sekaligus. Hidup bersama di betang menumbuhkan nilai gotong royong dan musyawarah.",
    },
    attire: {
      name: "Baju Sangkarut",
      description:
        "Rompi perang Dayak Ngaju dari kain atau serat kulit kayu bermotif garis, dipadukan dengan ikat kepala berbulu enggang, mandau, dan perisai talawang.",
    },
    dance: {
      name: "Tari Manasai",
      description: "Tari pergaulan Dayak Ngaju: penari dan tamu bergandengan membentuk lingkaran lalu melangkah bersama. Sering dipakai untuk menyambut tamu.",
    },
    music: { song: "Kalayar", instrument: "Kecapi dan garantung (gong)" },
    history:
      "Kalimantan Tengah menjadi provinsi pada 1957, dan Bung Karno meletakkan batu pertama kota Palangka Raya. Sebagian warga Dayak memeluk Kaharingan, agama leluhur yang mengenal upacara Tiwah untuk mengantar arwah ke alam baka.",
    exhibits: [
      {
        id: "prajurit-dayak",
        kind: "busana",
        title: "Busana Perang Dayak",
        description: "Laki-laki Dayak berbusana perang lengkap dengan hiasan bulu enggang, tombak, dan perisai talawang yang dilukis motif penolak bala.",
        height: 3.2,
        ...sketchfab("107012970c2b416ca1942219a5f0a242", "Baju Adat Dayak", "Bakza", "CC BY 4.0", 0.1),
      },
      {
        id: "dayak-uud-danum",
        kind: "busana",
        title: "Busana Dayak Uud Danum",
        description: "Busana laki-laki Dayak Uud Danum (Ot Danum), suku di hulu sungai-sungai Kalimantan Tengah dan Barat, dengan rompi bermanik dan tombak.",
        height: 1.8,
        ...sketchfab("3ed8ed08955047f8af05f772dffcbfe4", "Dayak Uud Danum Kalimantan", "tidayu.culture", "CC BY 4.0", 0.15),
      },
      {
        id: "engge",
        kind: "benda",
        title: "Keranjang Anyaman Dayak",
        description: "Keranjang punggung dari anyaman rotan untuk membawa hasil ladang dan hutan.",
        height: 0.7,
        ...sketchfab("beda733e89c34f43be0cb5a6e18966e1", "Engge Dayak", "tidayu.culture", "CC BY 4.0", 0.15),
      },
      {
        id: "ukiran-dayak",
        kind: "benda",
        title: "Ukiran Kayu Dayak",
        description: "Panel kayu berukir motif sulur khas Dayak, seperti yang menghiasi dinding dan tiang rumah panjang.",
        height: 0.6,
        ...sketchfab("0bd5eb98693b43f79b4f55663fa7dd38", "Dayak Wood Carving (Scaniverse LIDAR)", "JFN", "CC BY 4.0", 0.3),
      },
      {
        id: "foto-betang",
        kind: "bangunan",
        title: "Rumah Betang",
        description: "Rumah betang di Kalimantan Tengah, rumah panjang yang dulu dihuni puluhan keluarga.",
        height: 1.4,
        ...commons("Rumah Batang Kalimantan Tengah.jpg", "Everyone Sinks Starco", "CC BY-SA 2.0"),
      },
      {
        id: "foto-sandung",
        kind: "bangunan",
        title: "Sandung",
        description: "Rumah kecil berukir di atas tiang tempat menyimpan tulang belulang leluhur setelah upacara Tiwah.",
        height: 1.5,
        ...commons("Sandung Ngabe Sukah.jpg", "Martini Rahman", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tiwah",
        kind: "tradisi",
        title: "Tiwah (prangko 2011)",
        description: "Prangko seri budaya yang menggambarkan Tiwah, upacara kematian Dayak Kaharingan yang bisa berlangsung berhari-hari.",
        height: 1.2,
        ...commons("Stamp of Indonesia - 2011 - Colnect 248294 - Tiwah - Dayak Kalimantan Tengah.jpeg", "Pos Indonesia", "Public domain"),
      },
      {
        id: "foto-orangutan",
        kind: "alam",
        title: "Orangutan Tanjung Puting",
        description:
          "Taman Nasional Tanjung Puting adalah salah satu pusat penelitian dan rehabilitasi orangutan tertua, dirintis Biruté Galdikas pada 1971.",
        height: 1.6,
        ...commons("Orangutan at Tanjung Puting National Park.jpg", "Charlsmile", "CC BY-SA 4.0"),
      },
      {
        id: "foto-kahayan",
        kind: "bangunan",
        title: "Jembatan Kahayan",
        description: "Jembatan lengkung merah sepanjang sekitar 640 m di atas Sungai Kahayan, ikon kota Palangka Raya.",
        height: 1.4,
        ...commons("Jembatan Kahayan Palangkaraya.jpg", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-juhu",
        kind: "kuliner",
        title: "Juhu Umbut Rotan",
        description: "Sayur berkuah dari umbut (pucuk muda) rotan yang gurih sedikit pahit, dimasak dengan ikan sungai. Masakan khas Dayak Ngaju.",
        height: 1.4,
        ...commons("Juhu Umbut Rotan Ikan Nila.jpg", "Volstand", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Upacara kematian Dayak Kaharingan untuk mengantar arwah disebut...",
        options: ["Rambu Solo'", "Ngaben", "Tiwah", "Tabot"],
        answer: 2,
      },
      {
        q: "Taman nasional di Kalimantan Tengah yang terkenal dengan orangutannya adalah...",
        options: ["Tanjung Puting", "Komodo", "Bunaken", "Way Kambas"],
        answer: 0,
      },
      {
        q: "Rumah panjang Dayak di Kalimantan Tengah disebut...",
        options: ["Honai", "Betang", "Joglo", "Baileo"],
        answer: 1,
      },
    ],
  },
  {
    slug: "kalimantan-timur",
    mapId: "id-ki",
    island: "Kalimantan",
    name: "Kalimantan Timur",
    summary:
      "Hutan hujan dan Sungai Mahakam, rumah bagi suku Dayak dan Kutai. Di sinilah ditemukan prasasti tertua di Indonesia, dan kini juga lokasi Ibu Kota Nusantara.",
    house: {
      name: "Lamin",
      description:
        "Rumah panjang Dayak berbentuk panggung yang bisa dihuni beberapa keluarga sekaligus. Dinding dan tiangnya dihias ukiran serta lukisan bermotif naga, burung enggang, dan tumbuhan.",
    },
    attire: {
      name: "Ta'a dan Sapei Sapaq",
      description:
        "Busana Dayak Kenyah: perempuan memakai ta'a, rok dan atasan bermanik-manik; laki-laki memakai rompi sapei sapaq dan topi berhias bulu burung enggang.",
    },
    dance: {
      name: "Tari Gong (Kancet Ledo)",
      description: "Penari perempuan Dayak Kenyah menari dengan gemulai di atas sebuah gong, membawa kipas dari bulu burung enggang.",
    },
    music: { song: "Indung-Indung", instrument: "Sape'" },
    history:
      "Tujuh prasasti Yupa dari Muara Kaman, berhuruf Pallawa dan berbahasa Sanskerta, mencatat Kerajaan Kutai Martadipura sekitar abad ke-4 sampai ke-5, tulisan tertua yang ditemukan di Indonesia. Kesultanan Kutai Kartanegara kemudian berpusat di Tenggarong.",
    exhibits: [
      {
        id: "tari-gong",
        kind: "seni",
        title: "Tari Gong (Kancet Ledo)",
        description: "Penari perempuan Dayak Kenyah dengan kipas bulu burung enggang. Tarian ini dibawakan di atas sebuah gong.",
        height: 3.4,
        ...sketchfab("46c294068a3847c78e11443eedc5a88f", "Tari Gong Kalimantan", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "kancet-papatai",
        kind: "seni",
        title: "Tari Kancet Papatai",
        description: "Tari perang Dayak Kenyah. Penari laki-laki membawa mandau dan perisai, menggambarkan keberanian seorang pahlawan.",
        height: 1.8,
        ...sketchfab("a68c6bbecc6b4030b2dce40946ab6358", "Tari Kancet Papatai", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "mandau",
        kind: "benda",
        title: "Mandau",
        description: "Parang khas Dayak dengan gagang berukir. Dulu dipakai berperang dan berburu, kini menjadi pusaka dan pelengkap busana adat.",
        height: 0.75,
        ...sketchfab("dbdb279842a24772a55a9ed833742ea5", "Mandau", "apasipepgapuak"),
      },
      {
        id: "perisai-dayak",
        kind: "benda",
        title: "Perisai Dayak",
        description: "Perisai kayu panjang berukir motif wajah penolak bala, pasangan mandau dalam tari perang.",
        height: 1.3,
        ...sketchfab("13102111c6584d2ab671882a09df8a9f", "Tameng Dayak (shield)", "apasipepgapuak"),
      },
      {
        id: "sape",
        kind: "seni",
        title: "Sape'",
        description: "Alat musik petik dari sebatang kayu, dimainkan untuk mengiringi tari dan upacara Dayak.",
        height: 1.1,
        ...sketchfab("cc6775ee72d14521bdee94337dd44a73", "Sapek Guitar", "Adbel Hasyir"),
      },
      {
        id: "foto-lamin",
        kind: "bangunan",
        title: "Lamin Pemung Tawai",
        description: "Lamin adat di Desa Budaya Pampang, Samarinda, tempat pertunjukan tari Dayak Kenyah untuk pengunjung.",
        height: 1.5,
        ...commons("Lamin Adat Pemung Tawai Samarinda.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-hudoq",
        kind: "seni",
        title: "Topeng Hudoq",
        description: "Topeng untuk ritual Dayak Bahau dan Modang di musim tanam, dipercaya menolak hama dan mendatangkan panen yang baik.",
        height: 1.5,
        ...commons("Hudoq mask.jpg", "Taman Renyah", "CC BY-SA 3.0"),
      },
      {
        id: "bic-balikpapan",
        kind: "bangunan",
        title: "Menara Balikpapan Islamic Center",
        description: "Menara Masjid Madinatul Iman di Balikpapan Islamic Center. Model ini dibuat dari ratusan foto drone (fotogrametri).",
        height: 2.8,
        ...sketchfab("1ed929122c3c4f9a821753b456628817", "Balikpapan Islamic Center Mosque (BIC) - Tower", "dekahobby", "CC BY 4.0", 0.5),
      },
      {
        id: "foto-islamic-center-samarinda",
        kind: "bangunan",
        title: "Islamic Center Samarinda",
        description: "Masjid Baitul Muttaqien di tepi Sungai Mahakam, diresmikan pada 2008, dengan menara utama setinggi 99 m.",
        height: 1.4,
        ...commons("Islamic Centre Samarinda by bloesafir - panoramio.jpg", "Bloesafir Pamanjagau", "CC BY 3.0"),
      },
      {
        id: "foto-gence-ruan",
        kind: "kuliner",
        title: "Gence Ruan",
        description: "Ikan gabus (ruan) goreng disiram sambal tomat dan bawang merah yang diulek kasar, masakan khas Kutai.",
        height: 1.4,
        ...commons("Gence Ruan.JPG", "Ezagren (bicara / talk)", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Kerajaan Hindu tertua di Indonesia yang meninggalkan prasasti Yupa adalah...",
        options: ["Tarumanagara", "Kutai", "Sriwijaya", "Kalingga"],
        answer: 1,
      },
      {
        q: "Rumah panjang suku Dayak di Kalimantan Timur disebut...",
        options: ["Honai", "Tongkonan", "Lamin", "Baileo"],
        answer: 2,
      },
      {
        q: "Alat musik petik khas Dayak disebut...",
        options: ["Sasando", "Sape'", "Kecapi", "Gambus"],
        answer: 1,
      },
    ],
  },
  {
    slug: "kalimantan-selatan",
    mapId: "id-ks",
    island: "Kalimantan",
    name: "Kalimantan Selatan",
    summary: "Tanah Banjar yang hidup di atas sungai: pasar terapung, rumah panggung di tepi air, dan kain sasirangan.",
    house: {
      name: "Rumah Bubungan Tinggi",
      description: "Rumah adat Banjar dengan atap pelana yang menjulang curam di bagian tengah. Dulu menjadi kediaman keluarga Sultan Banjar.",
    },
    attire: {
      name: "Kain Sasirangan",
      description:
        "Kain khas Banjar yang dijelujur, diikat, lalu dicelup sehingga muncul motif. Dulu dipakai sebagai kain penyembuh dalam ritual, disebut kain pamintan.",
    },
    dance: {
      name: "Tari Baksa Kembang",
      description: "Tari penyambutan tamu agung dari keraton Banjar. Penari membawa kembang bogam, rangkaian bunga yang kemudian diserahkan kepada tamu.",
    },
    music: { song: "Ampar-Ampar Pisang", instrument: "Panting" },
    history:
      "Kesultanan Banjar berdiri pada 1526 ketika Pangeran Samudera memeluk Islam dan bergelar Sultan Suriansyah. Pangeran Antasari kemudian memimpin Perang Banjar melawan Belanda (1859–1905).",
    exhibits: [
      {
        id: "bubungan-tinggi",
        kind: "bangunan",
        title: "Rumah Bubungan Tinggi",
        description: "Rumah adat Banjar dengan atap pelana yang menjulang curam di tengah. Dulu menjadi kediaman keluarga Sultan Banjar.",
        height: 3.2,
        ...sketchfab("55f3578178354de999ff200eea3ad0e8", "Rumah Banjar", "mirzaar"),
      },
      {
        id: "foto-pasar-terapung",
        kind: "tradisi",
        title: "Pasar Terapung Lok Baintan",
        description: "Pedagang di atas jukung menjajakan sayur, buah, dan kue sejak subuh di Sungai Martapura.",
        height: 1.5,
        ...commons("Lok Baintan floating market Martapura.jpg", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-sasirangan",
        kind: "busana",
        title: "Kain Sasirangan",
        description: "Kain sasirangan berwarna cerah hasil teknik jelujur dan celup khas Banjar.",
        height: 1.5,
        ...commons("Kain Sasirangan 002.JPG", "Ezagren", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bubungan-tinggi",
        kind: "bangunan",
        title: "Rumah Bubungan Tinggi",
        description: "Rumah Bubungan Tinggi asli di Kalimantan Selatan, dengan atap menjulang dan titian kayu di depannya.",
        height: 1.5,
        ...commons("Rumah Bubungan Tinggi, Rumah Tradisional Kalimantan Selatan.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-suriansyah",
        kind: "bangunan",
        title: "Masjid Sultan Suriansyah",
        description: "Masjid tertua di Kalimantan Selatan, dibangun pada masa Sultan Suriansyah di tepi Sungai Kuin. Kartu pos sekitar tahun 1900.",
        height: 1.3,
        ...commons("Masjid Sultan Suriansyah 1900.png", "Rob Hennemann", "Public domain"),
      },
      {
        id: "foto-bekantan",
        kind: "alam",
        title: "Bekantan",
        description: "Monyet berhidung panjang endemik Kalimantan yang menjadi maskot fauna Kalimantan Selatan. Foto diambil di Labuk Bay, Sabah.",
        height: 1.4,
        ...commons("Proboscis monkey (Nasalis larvatus) female Labuk Bay.jpg", "Charles J. Sharp", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sabilal",
        kind: "bangunan",
        title: "Masjid Raya Sabilal Muhtadin",
        description:
          "Masjid raya Banjarmasin di tepi Sungai Martapura, diresmikan pada 1981. Namanya diambil dari kitab karya ulama Banjar, Syekh Muhammad Arsyad al-Banjari.",
        height: 1.4,
        ...commons("Masjid Raya Sabilal Muhtadi depan.jpg", "Ilham Mufti Laksono", "CC BY-SA 4.0"),
      },
      {
        id: "foto-pengantin-banjar",
        kind: "busana",
        title: "Busana Pengantin Banjar",
        description:
          "Busana pengantin Banjar berwarna cerah dengan hiasan kepala dan untaian melati. Ragamnya antara lain Bagajah Gamuling Baular Lulut dan Baamar Galung Pancaran Matahari.",
        height: 1.5,
        ...commons("Pakaian adat pengantin suku Banjar dari Kalimantan Selatan.jpg", "Mia Sulisnawati", "CC BY-SA 4.0"),
      },
      {
        id: "foto-soto-banjar",
        kind: "kuliner",
        title: "Soto Banjar",
        description: "Soto ayam berkuah bening harum kayu manis, cengkih, dan pala, disajikan dengan ketupat atau lontong dan perkedel.",
        height: 1.4,
        ...commons("Soto Banjar ketupat.jpg", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-ketupat-kandangan",
        kind: "kuliner",
        title: "Ketupat Kandangan",
        description: "Ketupat bersiram kuah santan kuning dengan ikan haruan (gabus) panggang, khas Kandangan, Hulu Sungai Selatan.",
        height: 1.4,
        ...commons("Katupat Kandangan in Kandangan.JPG", "Midori", "CC BY 3.0"),
      },
    ],
    quiz: [
      {
        q: "Pasar yang pedagangnya berjualan di atas perahu di Kalimantan Selatan disebut...",
        options: ["Pasar terapung", "Pasar senggol", "Pasar tumpah", "Pasar kaget"],
        answer: 0,
      },
      {
        q: "Kain ikat celup khas Banjar disebut...",
        options: ["Ulos", "Sasirangan", "Songket", "Tapis"],
        answer: 1,
      },
      {
        q: "Pahlawan yang memimpin Perang Banjar adalah...",
        options: ["Pangeran Diponegoro", "Teuku Umar", "Pattimura", "Pangeran Antasari"],
        answer: 3,
      },
    ],
  },
  {
    slug: "kalimantan-utara",
    mapId: "id-ku",
    island: "Kalimantan",
    name: "Kalimantan Utara",
    summary:
      "Provinsi yang dibentuk pada 2012 dan berbatasan dengan Sabah serta Sarawak. Tanah suku Tidung, Bulungan, dan suku-suku Dayak seperti Lundayeh dan Kenyah.",
    house: {
      name: "Rumah Baloy",
      description: "Rumah adat suku Tidung dari kayu yang dipakai sebagai balai adat untuk musyawarah dan upacara. Baloy Mayo di Tarakan menjadi pusat kegiatan adat Tidung.",
    },
    attire: {
      name: "Sina Beranti",
      description: "Busana pengantin suku Tidung berupa baju dan sarung berwarna cerah dengan hiasan keemasan, dipakai dalam upacara pernikahan adat.",
    },
    dance: {
      name: "Tari Jepen",
      description: "Tari pergaulan suku Tidung yang dipengaruhi budaya Melayu, diiringi gambus dan ketipung. Dibawakan dalam acara adat dan penyambutan tamu.",
    },
    music: { song: "Bebilin", instrument: "Gambus dan ketipung" },
    history:
      "Kesultanan Bulungan berdiri pada abad ke-18 di tepi Sungai Kayan dan bertahan hingga 1964. Pulau Tarakan menjadi ladang minyak sejak zaman Belanda dan medan pertempuran pada Perang Dunia II. Kalimantan Utara berpisah dari Kalimantan Timur pada 2012.",
    exhibits: [
      {
        id: "pakaian-dayak-perempuan",
        kind: "busana",
        title: "Busana Perempuan Dayak",
        description: "Busana perempuan Dayak dengan atasan dan rok bermanik serta hiasan kepala. Susunan manik membentuk motif yang menandakan asal dan status pemakainya.",
        height: 3.2,
        ...sketchfab("454a35c5a3914a05ac65923786f8f8eb", "Pakaian Dayak Perempuan", "Iwan789", "CC BY 4.0", 0.4),
      },
      {
        id: "foto-baloy",
        kind: "bangunan",
        title: "Baloy Mayo Adat Tidung",
        description: "Balai adat suku Tidung di Tarakan, tempat musyawarah dan upacara adat.",
        height: 1.5,
        ...commons("Baloy Mayo Adat Tidung (2).JPG", "Ezagren", "CC BY-SA 4.0"),
      },
      {
        id: "foto-iraw-tengkayu",
        kind: "tradisi",
        title: "Iraw Tengkayu",
        description: "Perahu hias diarak dalam festival Iraw Tengkayu, upacara syukur suku Tidung kepada laut.",
        height: 1.5,
        ...commons("Festival Iraw Tengkayu (4).jpg", "Kinanthi Nugroho", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bulungan",
        kind: "bangunan",
        title: "Museum Kesultanan Bulungan",
        description: "Bangunan di Tanjung Palas, bekas pusat Kesultanan Bulungan, yang kini menjadi museum.",
        height: 1.5,
        ...commons("Museum Kesultanan Bulungan.JPG", "Ezagren", "CC BY-SA 4.0"),
      },
      {
        id: "foto-lundayeh",
        kind: "bangunan",
        title: "Rumah Panjang Dayak Lundayeh",
        description: "Rumah panjang suku Lundayeh dengan gerbang dan dinding berukir.",
        height: 1.5,
        ...commons("Rumah Panjang Dayak Lundayeh - Lundayeh Dayaknese Long House.jpg", "Johannnindito Adisuryo", "CC BY-SA 4.0"),
      },
      {
        id: "foto-ornamen-lundayeh",
        kind: "benda",
        title: "Ornamen Lundayeh",
        description: "Lukisan ornamen bermotif sulur yang simetris di dinding rumah panjang Lundayeh.",
        height: 1.4,
        ...commons(
          "Ornamen Rumah Panjang Dayak Lundayeh - Lundayeh Dayaknese Long House Ornament.jpg",
          "Johannnindito Adisuryo",
          "CC BY-SA 4.0",
        ),
      },
    ],
    quiz: [
      {
        q: "Kalimantan Utara resmi menjadi provinsi pada tahun...",
        options: ["2000", "2004", "2012", "2022"],
        answer: 2,
      },
      {
        q: "Rumah adat suku Tidung disebut...",
        options: ["Baloy", "Lamin", "Betang", "Radakng"],
        answer: 0,
      },
      {
        q: "Lagu daerah Tidung yang berisi pesan kakek dan nenek adalah...",
        options: ["Ampar-Ampar Pisang", "Bebilin", "Cik Cik Periuk", "Kalayar"],
        answer: 1,
      },
    ],
  },
  {
    slug: "sulawesi-utara",
    mapId: "id-sa",
    island: "Sulawesi",
    name: "Sulawesi Utara",
    summary:
      "Semenanjung utara Sulawesi, tanah Minahasa, Bolaang Mongondow, Sangihe, dan Talaud. Semboyannya: Torang samua basudara, kita semua bersaudara.",
    house: {
      name: "Rumah Walewangko",
      description:
        "Rumah panggung Minahasa yang disebut juga rumah pewaris. Tangga kembar di depannya dipercaya mengusir roh jahat: roh yang naik lewat satu tangga akan turun lewat tangga lainnya.",
    },
    attire: {
      name: "Busana Minahasa",
      description:
        "Perempuan memakai kebaya dan kain sarung dengan sanggul berhias; laki-laki memakai baju tertutup berlengan panjang (laku tepu) dengan topi. Busana penari kabasaran berwarna merah, lambang keberanian.",
    },
    dance: {
      name: "Tari Maengket",
      description:
        "Tari syukur panen Minahasa yang dibawakan berkelompok sambil bernyanyi bersahutan, dalam tiga babak: maowey kamberu, marambak, dan lalayaan.",
    },
    music: { song: "Si Patokaan", instrument: "Kolintang" },
    history:
      "Di Minahasa tersebar waruga, peti kubur batu tempat jenazah dimakamkan dalam posisi duduk; tradisi ini dilarang Belanda pada abad ke-19. Sam Ratulangi, gubernur pertama Sulawesi, berasal dari Tondano.",
    exhibits: [
      {
        id: "busana-sulut",
        kind: "busana",
        title: "Busana Adat Minahasa",
        description: "Sepasang muda-mudi berbusana adat Sulawesi Utara.",
        height: 3.0,
        ...sketchfab("f07ae0eb3d354c03958a4a96c537a68c", "Sulawesi Utara", "gudymuse"),
      },
      {
        id: "foto-waruga",
        kind: "benda",
        title: "Waruga Sawangan",
        description: "Kompleks waruga di Sawangan: peti batu berbentuk rumah tempat jenazah leluhur Minahasa dimakamkan dalam posisi duduk.",
        height: 1.4,
        ...commons("Waruga Sawangan - panoramio.jpg", "Marcky Bolung", "CC BY 3.0"),
      },
      {
        id: "foto-kolintang",
        kind: "seni",
        title: "Kolintang",
        description: "Bilah-bilah kayu bernada yang dipukul seperti gambang. Satu ansambel kolintang terdiri dari beberapa instrumen untuk melodi, pengiring, dan bas.",
        height: 1.5,
        ...commons("Kolintang set.JPG", "Sakurai Midori", "CC BY-SA 3.0"),
      },
      {
        id: "foto-kabasaran",
        kind: "seni",
        title: "Penari Kabasaran",
        description: "Tari perang Minahasa dengan pedang dan tombak. Penarinya berbusana merah dengan hiasan kepala dari bulu ayam dan paruh burung.",
        height: 1.5,
        ...commons("Pakaian Tari Kabasaran atau Kawasaran.jpg", "Ana Ainina", "CC BY 4.0"),
      },
      {
        id: "foto-maengket",
        kind: "seni",
        title: "Tari Maengket",
        description: "Penari Maengket bernyanyi bersahutan dalam tari syukur panen.",
        height: 1.2,
        ...commons("Maengket Traditional Dance.jpg", "Pemerintah Provinsi Sulawesi Utara", "Public domain"),
      },
      {
        id: "foto-tarsius",
        kind: "alam",
        title: "Tarsius",
        description: "Primata mungil bermata besar di Cagar Alam Tangkoko. Tubuhnya hanya sekitar 10 cm, tetapi bisa melompat jauh dari dahan ke dahan.",
        height: 1.6,
        ...commons("Gursky's spectral tarsier, Tangkoko Batuangus Nature Reserve 2016-04-02.jpg", "Riefza Vebriansyah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bunaken",
        kind: "alam",
        title: "Taman Laut Bunaken",
        description: "Senja di perairan Bunaken. Taman nasional ini terkenal dengan dinding karang yang curam dan kaya ikan.",
        height: 1.5,
        ...commons("Sunset at Bunaken Island, Sulawesi, 2016.jpg", "Niek van Son", "CC BY 2.0"),
      },
      {
        id: "yesus-memberkati",
        kind: "bangunan",
        title: "Monumen Yesus Memberkati",
        description:
          "Patung Yesus setinggi sekitar 30 m di bukit Citraland, Manado, diresmikan pada 2010. Tubuhnya condong ke depan seolah melayang memberkati kota.",
        height: 2.8,
        ...sketchfab("bce295b8765b483f87acb4ca9db319ce", "Monumen Yesus Memberkati Manado", "Andria Wahyudi", "CC BY 4.0"),
      },
      {
        id: "foto-tinutuan",
        kind: "kuliner",
        title: "Tinutuan",
        description: "Bubur Manado dari beras, labu kuning, singkong, jagung, dan sayuran hijau, disantap dengan ikan asin dan sambal roa.",
        height: 1.4,
        ...commons("Bubur Khas Manado (Tinutuan).jpg", "Supardisahabu", "CC BY-SA 4.0"),
      },
      {
        id: "foto-klappertaart",
        kind: "kuliner",
        title: "Klappertaart",
        description: "Kue kelapa muda dan custard warisan masa kolonial di Manado. Namanya dari bahasa Belanda: klapper (kelapa) dan taart (kue).",
        height: 1.4,
        ...commons("Klappertaart Khas Manado.jpg", "Supardisahabu", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Peti kubur batu khas Minahasa disebut...",
        options: ["Kalamba", "Waruga", "Sandung", "Menhir"],
        answer: 1,
      },
      {
        q: "Alat musik pukul dari bilah kayu khas Minahasa adalah...",
        options: ["Kolintang", "Angklung", "Tifa", "Sasando"],
        answer: 0,
      },
      {
        q: "Semboyan Sulawesi Utara \"Torang samua basudara\" berarti...",
        options: ["Bersatu kita teguh", "Rumahku istanaku", "Laut adalah ibu", "Kita semua bersaudara"],
        answer: 3,
      },
    ],
  },
  {
    slug: "gorontalo",
    mapId: "id-go",
    island: "Sulawesi",
    name: "Gorontalo",
    summary: "Provinsi di leher Pulau Sulawesi yang dijuluki Serambi Madinah, dengan adat yang bersendikan syarak. Berdiri sendiri sejak 2000.",
    house: {
      name: "Rumah Dulohupa",
      description: "Dulohupa berarti mufakat: rumah panggung kayu tempat raja dan pemangku adat bermusyawarah, kini juga dipakai untuk upacara adat.",
    },
    attire: {
      name: "Biliu dan Makuta",
      description:
        "Pengantin perempuan memakai biliu dengan hiasan kepala bersusun dari emas; pengantin laki-laki memakai makuta, penutup kepala yang menjulang tinggi.",
    },
    dance: {
      name: "Tari Saronde",
      description:
        "Tari malam pertunangan adat: calon pengantin laki-laki menari bersama ayah atau kerabatnya sambil mengayunkan selendang, sesekali melirik calon istri.",
    },
    music: { song: "Hulondalo Lipu'u", instrument: "Polopalo" },
    history:
      "Lima kerajaan Gorontalo bersatu dalam persekutuan U Duluwo Limo Lo Pohalaa. Pada 23 Januari 1942, Nani Wartabone memimpin rakyat menahan pejabat Belanda dan memproklamasikan kemerdekaan Gorontalo, tiga tahun sebelum proklamasi di Jakarta.",
    exhibits: [
      {
        id: "busana-gorontalo",
        kind: "busana",
        title: "Busana Adat Gorontalo",
        description: "Sepasang pengantin berbusana biliu dan makuta, busana adat Gorontalo.",
        height: 3.0,
        ...sketchfab("2ca2f52eb0f74b6f88677dbebe67da8a", "Gorontalo", "gudymuse"),
      },
      {
        id: "foto-biliu",
        kind: "busana",
        title: "Biliu",
        description: "Busana pengantin perempuan Gorontalo dengan hiasan kepala bersusun dan perhiasan keemasan.",
        height: 1.7,
        ...commons("Biliu Baju Adat Gorontalo.jpg", "Rosydi A Azhar", "CC BY-SA 4.0"),
      },
      {
        id: "foto-otanaha",
        kind: "bangunan",
        title: "Benteng Otanaha",
        description: "Benteng batu di atas bukit dekat Danau Limboto, satu dari tiga benteng kuno di kompleks ini.",
        height: 1.5,
        ...commons("Benteng Otanaha.jpg", "Hendrik Saleh", "CC BY-SA 4.0"),
      },
      {
        id: "foto-karawo",
        kind: "busana",
        title: "Sulaman Karawo",
        description: "Sebagian benang kain dicabut, lalu ruang kosongnya disulam ulang membentuk motif. Karawo dikerjakan dengan sangat teliti.",
        height: 1.4,
        ...commons("Sulaman Karawo.jpg", "Rosydi A Azhar", "CC BY-SA 4.0"),
      },
      {
        id: "foto-polopalo",
        kind: "seni",
        title: "Polopalo",
        description: "Alat musik bambu berbentuk garpu tala besar yang dipukulkan ke lutut sehingga bergetar dan berbunyi.",
        height: 1.6,
        ...commons("Polopalo Gorontalo.jpg", "Supardisahabu", "CC BY-SA 4.0"),
      },
      {
        id: "foto-limboto",
        kind: "alam",
        title: "Danau Limboto",
        description: "Danau di tengah Gorontalo yang menghidupi para nelayan, kini terancam pendangkalan.",
        height: 1.4,
        ...commons("Danau Limboto.JPG", "Marwan Mohamad", "CC BY-SA 3.0"),
      },
      {
        id: "foto-dulohupa",
        kind: "bangunan",
        title: "Rumah Dulohupa",
        description: "Rumah adat Dulohupa, balai musyawarah adat Gorontalo.",
        height: 1.1,
        ...commons("Dulohupa.jpg", "Pidopram", "CC BY-SA 4.0"),
      },
      {
        id: "foto-binte",
        kind: "kuliner",
        title: "Binte Biluhuta",
        description: "Sup jagung pipil dengan ikan atau udang, kelapa parut, dan perasan jeruk. Binte berarti jagung, biluhuta berarti disiram.",
        height: 1.4,
        ...commons("Binte Biluhuta.jpg", "Supardisahabu", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Tokoh yang memimpin proklamasi kemerdekaan Gorontalo pada 23 Januari 1942 adalah...",
        options: ["Sam Ratulangi", "Nani Wartabone", "Pattimura", "Frans Kaisiepo"],
        answer: 1,
      },
      {
        q: "Kerajinan sulam khas Gorontalo disebut...",
        options: ["Karawo", "Tapis", "Cual", "Sasirangan"],
        answer: 0,
      },
      {
        q: "Nama rumah adat Gorontalo, Dulohupa, berarti...",
        options: ["Lumbung", "Istana", "Mufakat", "Benteng"],
        answer: 2,
      },
    ],
  },
  {
    slug: "sulawesi-tengah",
    mapId: "id-st",
    island: "Sulawesi",
    name: "Sulawesi Tengah",
    summary:
      "Tanah suku Kaili, Pamona, Lore, dan banyak lainnya. Di lembah-lembah Lore Lindu berdiri arca batu megalitik yang hingga kini menyimpan misteri.",
    house: {
      name: "Souraja (Banua Oge)",
      description:
        "Rumah panggung kediaman raja dan bangsawan Kaili di Palu, dibangun pada akhir abad ke-19. Dinding dan lisplangnya berukir motif bunga dan daun.",
    },
    attire: {
      name: "Baju Nggembe",
      description: "Busana perempuan Kaili berupa blus longgar berlengan lebar, dipadukan dengan sarung tenun Donggala.",
    },
    dance: {
      name: "Tari Dero",
      description:
        "Tari pergaulan suku Pamona di Poso: penari bergandengan tangan membentuk lingkaran sambil berbalas pantun, lambang persaudaraan.",
    },
    music: { song: "Tondok Kadadiangku", instrument: "Kakula" },
    history:
      "Ratusan arca dan kalamba (bejana batu besar) megalitik tersebar di Lembah Bada, Besoa, dan Napu. Usianya diperkirakan ribuan tahun, tetapi siapa pembuatnya dan apa fungsinya masih menjadi teka-teki.",
    exhibits: [
      {
        id: "baruga",
        kind: "bangunan",
        title: "Baruga",
        description: "Balai pertemuan suku Kaili. Bangunan terbuka beratap tinggi ini dipakai untuk musyawarah adat dan upacara.",
        height: 3.0,
        ...sketchfab("7a0c14ccb3a04218bab97b3b64c9ee5d", "Rumah Adat Baruga Sulawesi Tengah", "kololio.artstudio", "CC BY 4.0", 0.25),
      },
      {
        id: "foto-palindo",
        kind: "benda",
        title: "Arca Palindo",
        description: "Palindo, arca megalitik setinggi sekitar 4 meter di Lembah Bada, Taman Nasional Lore Lindu.",
        height: 1.5,
        ...commons("Patung Palindo Lembah Bada Taman Nasional Lore Lindu.jpg", "Lo2asinamura", "CC BY-SA 4.0"),
      },
      {
        id: "foto-souraja",
        kind: "bangunan",
        title: "Souraja",
        description: "Souraja atau Banua Oge di Palu, bekas kediaman raja Kaili yang kini menjadi cagar budaya.",
        height: 1.5,
        ...commons("Sou Raja or Banua Oge, Palu, Central Sulawesi 2018-09-17 02.jpg", "Crisco 1492", "CC BY-SA 4.0"),
      },
      {
        id: "arca-langke-bulawa",
        kind: "benda",
        title: "Arca Langke Bulawa",
        description: "Arca batu megalitik di Lembah Bada, Taman Nasional Lore Lindu, yang dianggap berwujud perempuan.",
        height: 1.6,
        ...sketchfab("f2a6f03d8f45421d8605b85bfcafead2", "ARCA LANGKE BULAWA", "sigiedhy", "CC BY 4.0", 0.2),
      },
      {
        id: "busana-sulteng",
        kind: "busana",
        title: "Busana Adat Sulawesi Tengah",
        description: "Sepasang muda-mudi berbusana adat Sulawesi Tengah.",
        height: 1.6,
        ...sketchfab("f7a748967a2c4f33bae078fe28ce11fe", "SUlawesi Tengah", "gudymuse"),
      },
      {
        id: "foto-pokekea",
        kind: "benda",
        title: "Situs Pokekea",
        description: "Kalamba, bejana batu raksasa, beserta tutupnya di situs megalitik Pokekea, Lembah Besoa.",
        height: 1.5,
        ...commons("Situs megalitikum Pokekea.jpg", "Bingkaijay", "CC BY-SA 4.0"),
      },
      {
        id: "foto-danau-poso",
        kind: "alam",
        title: "Danau Poso",
        description: "Danau di jantung Sulawesi Tengah dengan pantai berpasir di sekitar Tentena.",
        height: 1.5,
        ...commons("Tentena Danau Poso Siuri Beach.jpg", "Kondephy", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tenun-donggala",
        kind: "busana",
        title: "Tenun Donggala (prangko)",
        description: "Prangko 2012 bermotif sarung tenun Donggala, kain khas Sulawesi Tengah.",
        height: 1.2,
        ...commons("Stamp of Indonesia - 2012 - Colnect 668258 - Fabric Sulawesi Tengah.jpeg", "Pos Indonesia", "Public domain"),
      },
      {
        id: "foto-kaledo",
        kind: "kuliner",
        title: "Kaledo",
        description: "Sup kaki sapi berkuah asam dari asam jawa muda dan cabai, khas Donggala dan Palu. Sumsumnya diisap langsung dari tulang.",
        height: 1.4,
        ...commons("Kaledo soup, Central Sulawesi, 2018-09-16.jpg", "Crisco 1492", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jepa",
        kind: "kuliner",
        title: "Jepa",
        description:
          "Roti pipih dari parutan singkong atau sagu yang dipanggang di atas cetakan tanah liat, makanan pokok orang Saluan di Banggai dan juga orang Mandar.",
        height: 1.4,
        ...commons("Jepa Saluan.jpg", "Si Gam", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Arca megalitik Palindo berada di...",
        options: ["Lembah Baliem", "Lembah Bada", "Lembah Harau", "Lembah Anai"],
        answer: 1,
      },
      {
        q: "Tari pergaulan suku Pamona yang membentuk lingkaran disebut...",
        options: ["Tari Dero", "Tari Saman", "Tari Kecak", "Tari Piring"],
        answer: 0,
      },
      {
        q: "Kain tenun khas Sulawesi Tengah dikenal sebagai sarung...",
        options: ["Bugis", "Samarinda", "Donggala", "Mandar"],
        answer: 2,
      },
    ],
  },
  {
    slug: "sulawesi-barat",
    mapId: "id-sr",
    island: "Sulawesi",
    name: "Sulawesi Barat",
    summary:
      "Pesisir barat Sulawesi, tanah suku Mandar yang terkenal sebagai pelaut, dan Mamasa di pegunungan. Berpisah dari Sulawesi Selatan pada 2004.",
    house: {
      name: "Rumah Boyang",
      description:
        "Rumah panggung kayu Mandar. Boyang adaq milik bangsawan punya tumbaq layar (susunan papan di depan atap) bertingkat tiga sampai tujuh; rumah rakyat biasa disebut boyang beasa.",
    },
    attire: {
      name: "Baju Pokko dan Lipa Saqbe",
      description: "Perempuan Mandar memakai baju pokko, blus longgar berlengan pendek dari kain tipis, dengan sarung sutra lipa saqbe dan perhiasan emas.",
    },
    dance: {
      name: "Sayyang Pattuqduq",
      description: "Kuda yang dilatih menari mengangkat kakinya mengikuti tabuhan rebana, membawa anak yang baru khatam Al-Qur'an berkeliling kampung.",
    },
    music: { song: "Tenggang-Tenggang Lopi", instrument: "Rebana (rawana) dan kecapi Mandar" },
    history:
      "Tujuh kerajaan di muara sungai (Pitu Babana Binanga) dan tujuh di hulu (Pitu Ulunna Salu) bersekutu sebagai Mandar, dengan Balanipa sebagai yang dituakan. Di Kalumpang, di tepi Sungai Karama, ditemukan sisa permukiman Neolitikum berusia sekitar 3.500 tahun.",
    exhibits: [
      {
        id: "busana-sulbar",
        kind: "busana",
        title: "Busana Adat Mandar",
        description: "Sepasang muda-mudi berbusana adat Sulawesi Barat.",
        height: 3.0,
        ...sketchfab("6a3826f2da2142ffb24aae7612645812", "Sulawesi Barat", "gudymuse"),
      },
      {
        id: "foto-sandeq",
        kind: "benda",
        title: "Perahu Sandeq",
        description: "Perahu layar bercadik Mandar yang ramping dan cepat. Dalam Lomba Sandeq, perahu-perahu ini berlayar ratusan kilometer menyusuri pesisir.",
        height: 1.4,
        ...commons("Sandeq boats in Majene, West Sulawesi, Indonesia.jpg", "Lfvalle1", "CC BY-SA 3.0"),
      },
      {
        id: "foto-busana-mandar",
        kind: "busana",
        title: "Busana Pengantin Mandar",
        description: "Pengantin Mandar dengan hiasan kepala dan gelang emas bersusun.",
        height: 1.6,
        ...commons("Mandar Traditional Costume.jpg", "Muhammad Ridwal", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tenun-mandar",
        kind: "busana",
        title: "Penenun Mandar",
        description: "Perempuan Mandar menenun kain pada masa kolonial, koleksi Tropenmuseum. Sarung sutra Mandar masih ditenun hingga kini.",
        height: 1.3,
        ...commons("COLLECTIE TROPENMUSEUM Vrouw weeft een katoenen doek Mandar op Zuid Celebes TMnr 10014398.jpg", "Tropenmuseum", "CC BY-SA 3.0"),
      },
      {
        id: "foto-banua-mamasa",
        kind: "bangunan",
        title: "Banua Mamasa",
        description: "Rumah adat Mamasa di pegunungan Sulawesi Barat. Atapnya melengkung seperti perahu, kerabat dekat tongkonan Toraja.",
        height: 1.5,
        ...commons("Rumah Adat Mamasa (Banua Sura).jpg", "Firdaus Thobelulu", "CC BY-SA 4.0"),
      },
      {
        id: "foto-makam-mandar",
        kind: "bangunan",
        title: "Makam Bangsawan Mandar",
        description: "Kompleks makam bangsawan Mandar dengan nisan-nisan batu tua.",
        height: 1.4,
        ...commons("Royal Mandar Graveyard.JPG", "Lfvalle1", "CC BY-SA 3.0"),
      },
    ],
    quiz: [
      {
        q: "Perahu layar bercadik khas suku Mandar disebut...",
        options: ["Pinisi", "Sandeq", "Jukung", "Kora-kora"],
        answer: 1,
      },
      {
        q: "Tradisi kuda menari untuk merayakan anak yang khatam Al-Qur'an disebut...",
        options: ["Pasola", "Karapan", "Sayyang Pattuqduq", "Peresean"],
        answer: 2,
      },
      {
        q: "Sulawesi Barat berpisah dari provinsi...",
        options: ["Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Gorontalo"],
        answer: 0,
      },
    ],
  },
  {
    slug: "sulawesi-selatan",
    mapId: "id-sn",
    island: "Sulawesi",
    name: "Sulawesi Selatan",
    summary:
      "Rumah bagi suku Bugis, Makassar, dan Toraja: pelaut penjelajah dan pembangun rumah kayu berukir.",
    house: {
      name: "Tongkonan",
      description:
        "Rumah adat Toraja dengan atap melengkung seperti perahu. Tanduk kerbau dipasang bertumpuk di tiang depan sebagai penanda status keluarga.",
    },
    attire: {
      name: "Baju Bodo",
      description:
        "Baju longgar berlengan pendek dari kain tipis, dipadukan sarung sutra. Warnanya dulu menandakan usia dan status pemakainya.",
    },
    dance: {
      name: "Tari Pakarena",
      description:
        "Tarian Makassar dengan gerak penari yang lembut dan pelan, diiringi gandrang (gendang) yang justru bertempo keras dan cepat.",
    },
    music: { song: "Anging Mammiri", instrument: "Gandrang dan kecapi" },
    history:
      "Kesultanan Gowa-Tallo pernah menguasai jalur dagang di timur Nusantara. Sultan Hasanuddin, yang melawan VOC, dijuluki \"Ayam Jantan dari Timur\".",
    exhibits: [
      {
        id: "tongkonan",
        kind: "bangunan",
        title: "Tongkonan",
        description:
          "Rumah adat Toraja beratap melengkung seperti perahu, berdiri di atas tiang kayu. Tanduk kerbau di tiang depan menandakan status keluarga.",
        height: 3.0,
        ...sketchfab("d614270568e24b0284a98aa1998b122c", "Tongkonan / Toraja House", "mochamadyuda"),
      },
      {
        id: "pinisi",
        kind: "benda",
        title: "Kapal Pinisi (miniatur)",
        description: "Kapal layar kayu buatan Bugis-Makassar dari Tana Beru, Bulukumba. Seni pembuatannya diakui UNESCO pada 2017.",
        height: 1.4,
        ...sketchfab("3111ee505bd7422d9d30c9cf9da2a467", "pinisi", "pakeotak", "CC BY 4.0", 0.5),
      },
      {
        id: "badik",
        kind: "benda",
        title: "Badik",
        description: "Senjata tikam khas Bugis-Makassar, lambang harga diri (siri') pemiliknya.",
        height: 0.45,
        ...sketchfab("e186ce6cf40f4c269f3aca491dfb43e3", "Badik", "luqman05"),
      },
      {
        id: "foto-baju-bodo",
        kind: "busana",
        title: "Baju Bodo",
        description: "Baju bodo merah dengan sarung sutra dan perhiasan emas, busana adat perempuan Bugis-Makassar.",
        height: 1.6,
        ...commons("Baju Bodo.jpg", "Fery Indrawan", "CC BY 2.0"),
      },
      {
        id: "foto-pakarena",
        kind: "seni",
        title: "Tari Pakarena",
        description: "Penari Pakarena bergerak pelan dengan kipas, sementara gandrang ditabuh keras dan cepat.",
        height: 1.5,
        ...commons("Performing pakarena dance.jpg", "Ali Froghi", "CC BY-SA 4.0"),
      },
      {
        id: "tari-pakarena",
        kind: "seni",
        title: "Penari Pakarena",
        description: "Para penari pakarena berbaju bodo dengan kipas di tangan, bergerak pelan dan lembut.",
        height: 1.8,
        ...sketchfab("113adcda826e4a2f8fd0966814aebf24", "Tari Pakarena", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "foto-fort-rotterdam",
        kind: "bangunan",
        title: "Fort Rotterdam",
        description: "Benteng Ujung Pandang milik Kesultanan Gowa yang diambil alih VOC setelah Perjanjian Bongaya (1667) dan dinamai Fort Rotterdam.",
        height: 1.5,
        ...commons("Fort Rotterdam, Makassar, Indonesia - 20100227-02.jpg", "Sanko.", "CC BY-SA 3.0"),
      },
      {
        id: "foto-rambu-solo",
        kind: "tradisi",
        title: "Rambu Solo'",
        description: "Upacara pemakaman Toraja yang bisa berlangsung berhari-hari, dengan penyembelihan kerbau sebagai bekal arwah menuju Puya.",
        height: 1.5,
        ...commons("Upacara Rambu Solo'.jpg", "Galih Prihasta", "CC BY-SA 4.0"),
      },
      {
        id: "foto-coto",
        kind: "kuliner",
        title: "Coto Makassar",
        description: "Sup daging dan jeroan sapi berkuah kacang tanah sangrai dan rempah, dimasak dalam kuali tanah, dimakan dengan ketupat atau burasa.",
        height: 1.4,
        ...commons("Coto makassar.jpg", "Pungkas nurrohman", "CC BY-SA 4.0"),
      },
      {
        id: "foto-konro",
        kind: "kuliner",
        title: "Sop Konro",
        description: "Sup tulang iga atau leher berkuah hitam dari kluwek dan rempah, khas Makassar. Ada juga konro bakar berbumbu kacang.",
        height: 1.4,
        ...commons("Sop Konro tulang leher kerbau.JPG", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-pisang-ijo",
        kind: "kuliner",
        title: "Es Pisang Ijo",
        description: "Pisang raja dibalut adonan tepung hijau pandan, disajikan dengan bubur sumsum, sirup merah, dan es serut.",
        height: 1.4,
        ...commons("Es Pisang Ijo Mitra Swalayan.jpg", "Indonesiagood", "CC BY 4.0"),
      },
    ],
    quiz: [
      {
        q: "Atap Tongkonan berbentuk seperti...",
        options: ["Kerucut", "Kubah", "Perahu", "Limas"],
        answer: 2,
      },
      {
        q: "Apa julukan Sultan Hasanuddin?",
        options: ["Macan Asia", "Ayam Jantan dari Timur", "Singa Laut", "Garuda Muda"],
        answer: 1,
      },
      {
        q: "Ciri khas Tari Pakarena adalah...",
        options: [
          "Penari melompat tinggi",
          "Penari memakai topeng",
          "Dilakukan di atas kuda",
          "Gerak penari lembut, gendangnya keras",
        ],
        answer: 3,
      },
    ],
  },
  {
    slug: "sulawesi-tenggara",
    mapId: "id-sg",
    island: "Sulawesi",
    name: "Sulawesi Tenggara",
    summary: "Tanah suku Tolaki, Buton, Muna, dan Wakatobi. Kesultanan Buton meninggalkan salah satu benteng terluas di dunia.",
    house: {
      name: "Banua Tada",
      description:
        "Rumah panggung kayu khas Buton yang disambung dengan pasak tanpa paku. Versi untuk sultan, disebut kamali atau malige, dibuat bertingkat dan lebih megah.",
    },
    attire: {
      name: "Babu Nggawi",
      description: "Busana adat suku Tolaki berwarna cerah dengan hiasan sulaman dan perhiasan keemasan, dipakai pada upacara adat dan pernikahan.",
    },
    dance: {
      name: "Tari Lulo",
      description:
        "Tari pergaulan suku Tolaki: penari bergandengan tangan membentuk lingkaran dan bergerak mengikuti irama gong. Siapa pun boleh ikut bergabung.",
    },
    music: { song: "Peia Tawa-Tawa", instrument: "Gong" },
    history:
      "Kesultanan Buton bertahan dari abad ke-16 hingga 1960 dan punya undang-undang tertulis bernama Martabat Tujuh. Benteng Keraton Buton, dengan tembok batu sepanjang sekitar 2,7 km, tercatat sebagai salah satu benteng terluas di dunia.",
    exhibits: [
      {
        id: "malige",
        kind: "bangunan",
        title: "Rumah Buton",
        description: "Rumah panggung kayu bertingkat khas Buton. Seluruh rangkanya disambung dengan pasak, tanpa paku.",
        height: 3.2,
        ...sketchfab("ca7e608b31fe44c8af22942f4f0b32b5", "Rumah Buton Indonesia ( Option 3 )", "mbung"),
      },
      {
        id: "foto-benteng-buton",
        kind: "bangunan",
        title: "Benteng Keraton Buton",
        description: "Tembok batu kapur Benteng Keraton Buton di Baubau, dibangun bertahap pada abad ke-16 sampai ke-17.",
        height: 1.5,
        ...commons("Sisi luar tembok Benteng Keraton Buton.jpg", "Marwan Mohamad", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-buton",
        kind: "bangunan",
        title: "Masjid Agung Keraton Buton",
        description: "Masjid tua di dalam kompleks benteng, pusat kehidupan agama Kesultanan Buton.",
        height: 1.5,
        ...commons("Masjid Agung Keraton Buton.jpg", "Marwan Mohamad", "CC BY-SA 4.0"),
      },
      {
        id: "busana-sultra",
        kind: "busana",
        title: "Busana Adat Sulawesi Tenggara",
        description: "Sepasang muda-mudi berbusana adat Sulawesi Tenggara.",
        height: 1.6,
        ...sketchfab("4c2a28f2f3ae46e1b70c05313bb08426", "Sulawesi Tenggara", "gudymuse"),
      },
      {
        id: "foto-tenun-buton",
        kind: "busana",
        title: "Tenun Buton",
        description: "Penenun Buton menenun sarung di alat tenun tradisional. Motif dan warnanya dulu menandai golongan sosial pemakainya.",
        height: 1.5,
        ...commons("Tenun Buton.jpg", "Andrydenisah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-lulo",
        kind: "seni",
        title: "Tari Lulo",
        description: "Warga bergandengan tangan menari lulo (molulo) sampai larut malam.",
        height: 1.4,
        ...commons("Molulo.jpg", "Miunsrv", "CC BY-SA 4.0"),
      },
      {
        id: "foto-anoa",
        kind: "alam",
        title: "Anoa",
        description: "Kerbau kerdil endemik Sulawesi yang menjadi maskot fauna Sulawesi Tenggara.",
        height: 1.4,
        ...commons("Anoa Bubalus depressicornis Surabaya Zoo.jpg", "Sakurai Midori", "CC BY 3.0"),
      },
      {
        id: "foto-wakatobi",
        kind: "alam",
        title: "Taman Nasional Wakatobi",
        description: "Nudibranch di terumbu karang Wakatobi, kawasan yang ditetapkan sebagai cagar biosfer UNESCO pada 2012.",
        height: 1.4,
        ...commons("Kuni's chromodoris, fan 38 west, wakatobi, 2018 (45763962462) (cropped).jpg", "q phia", "CC BY 2.0"),
      },
      {
        id: "foto-sinonggi",
        kind: "kuliner",
        title: "Sinonggi",
        description: "Sagu kental bening ala Tolaki yang digulung dengan sumpit lalu dicelup ke kuah ikan dan sayur. Makan sinonggi bersama disebut mosonggi.",
        height: 1.5,
        ...commons("Sinonggi.jpg", "Akhsan05", "CC0"),
      },
    ],
    quiz: [
      {
        q: "Kesultanan di Sulawesi Tenggara yang membangun benteng sangat luas adalah...",
        options: ["Gowa", "Ternate", "Buton", "Bone"],
        answer: 2,
      },
      {
        q: "Tari pergaulan suku Tolaki yang bergandengan tangan membentuk lingkaran adalah...",
        options: ["Tari Lulo", "Tari Kecak", "Tari Saman", "Tari Jaipong"],
        answer: 0,
      },
      {
        q: "Rumah adat Buton disambung dengan pasak, tanpa memakai...",
        options: ["Kayu", "Tiang", "Paku", "Atap"],
        answer: 2,
      },
    ],
  },
  {
    slug: "maluku",
    mapId: "id-ma",
    island: "Maluku",
    name: "Maluku",
    summary: "Kepulauan rempah: dari Ambon dan Seram sampai Banda, tempat pala dan fuli pernah diperebutkan bangsa-bangsa Eropa.",
    house: {
      name: "Baileo",
      description:
        "Balai adat panggung tanpa dinding, tempat warga negeri bermusyawarah dan menyimpan benda pusaka. Dibuat terbuka agar roh leluhur dipercaya ikut hadir dalam musyawarah.",
    },
    attire: {
      name: "Baju Cele",
      description: "Kemeja atau kebaya bermotif kotak-kotak merah dan putih, dipadukan dengan kain sarung. Dipakai laki-laki dan perempuan dalam upacara adat.",
    },
    dance: {
      name: "Tari Cakalele",
      description: "Tari perang: penari laki-laki membawa parang dan salawaku (perisai), bergerak garang diiringi tifa dan gong.",
    },
    music: { song: "Rasa Sayange", instrument: "Tifa dan totobuang" },
    history:
      "Demi monopoli pala, VOC menaklukkan Kepulauan Banda dengan kejam pada 1621. Lewat Perjanjian Breda (1667), Inggris melepas Pulau Run di Banda dan Belanda melepas klaim atas Manhattan. Pada 1817, Pattimura memimpin rakyat Saparua merebut Benteng Duurstede.",
    exhibits: [
      {
        id: "tifa-maluku",
        kind: "seni",
        title: "Tifa",
        description:
          "Gendang kayu berkulit hewan. Di Maluku, tifa dimainkan bersama totobuang, deretan gong kecil, untuk mengiringi cakalele dan lagu-lagu rakyat.",
        height: 2.0,
        ...sketchfab("692a844bcb794257adbafe04ec3b825a", "Alat musik tifa", "siahayandarias932"),
      },
      {
        id: "pala",
        kind: "alam",
        title: "Biji Pala",
        description: "Biji pala dari Banda, rempah yang dulu sangat mahal di pasar Eropa sehingga memicu perebutan kekuasaan di kepulauan ini.",
        height: 0.35,
        ...sketchfab("bc978d64990849189cbc8c4efc3423d7", "Nutmeg", "Frank McMains", "CC BY 4.0", 0.4),
      },
      {
        id: "foto-baileo",
        kind: "bangunan",
        title: "Baileo Negeri Haria",
        description: "Baileo beratap rumbia tanpa dinding di Negeri Haria, Pulau Saparua.",
        height: 1.4,
        ...commons("Baileo Haria.jpg", "Kankungrebus", "CC BY-SA 4.0"),
      },
      {
        id: "foto-cakalele",
        kind: "seni",
        title: "Tari Cakalele",
        description: "Penari cakalele berikat kepala merah membawa parang dan salawaku.",
        height: 1.5,
        ...commons("Cakalele - Maluku.jpg", "Ardian Djati", "CC BY-SA 4.0"),
      },
      {
        id: "foto-pala-banda",
        kind: "alam",
        title: "Pala dan Fuli",
        description: "Biji pala dan fuli merah yang membungkusnya dijemur di Kepulauan Banda.",
        height: 1.4,
        ...commons("Nutmeg and mace in Banda Islands.jpg", "Hike Indonesia", "CC BY 2.0"),
      },
      {
        id: "foto-banda-neira",
        kind: "alam",
        title: "Banda Neira",
        description: "Kepulauan Banda dilihat dari ketinggian. Bung Hatta dan Sutan Sjahrir pernah diasingkan Belanda di Banda Neira.",
        height: 1.5,
        ...commons("Banda-0039.jpg", "Anton Leddin", "CC BY-SA 3.0"),
      },
      {
        id: "foto-duurstede",
        kind: "bangunan",
        title: "Benteng Duurstede",
        description: "Benteng VOC di Saparua yang direbut Pattimura dan pasukannya pada Mei 1817.",
        height: 1.6,
        ...commons("Benteng Duurstede yang baru di ambil gambarnya secara keseluruhan dari atas.jpg", "Angel Keleyan", "CC0"),
      },
      {
        id: "foto-wapauwe",
        kind: "bangunan",
        title: "Masjid Tua Wapauwe",
        description: "Masjid beratap rumbia di Kaitetu, Pulau Ambon, salah satu masjid tertua di Maluku.",
        height: 1.4,
        ...commons("Masjid Tua Wapauwe Kaitetu.jpg", "Si Gam", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jembatan-merah-putih",
        kind: "bangunan",
        title: "Jembatan Merah Putih",
        description: "Jembatan kabel sepanjang 1.140 m yang melintasi Teluk Ambon, diresmikan pada 2016.",
        height: 1.6,
        ...commons("Merah Putih Bridge.jpg", "Toddy", "CC BY-SA 4.0"),
      },
      {
        id: "foto-ikan-kuah-kuning",
        kind: "kuliner",
        title: "Ikan Kuah Kuning",
        description: "Ikan laut dalam kuah kunyit yang asam segar dengan kemangi, pasangan wajib papeda di Maluku.",
        height: 1.4,
        ...commons("Ikan Kuah Kuning-1.jpg", "Oceanmuse", "CC BY 4.0"),
      },
    ],
    quiz: [
      {
        q: "Rempah dari Kepulauan Banda yang diperebutkan bangsa Eropa adalah...",
        options: ["Lada", "Pala", "Kayu manis", "Vanili"],
        answer: 1,
      },
      {
        q: "Pahlawan yang merebut Benteng Duurstede pada 1817 adalah...",
        options: ["Pattimura", "Sultan Baabullah", "Nani Wartabone", "Teuku Umar"],
        answer: 0,
      },
      {
        q: "Balai adat tanpa dinding di Maluku disebut...",
        options: ["Sasadu", "Bale", "Baileo", "Honai"],
        answer: 2,
      },
    ],
  },
  {
    slug: "maluku-utara",
    mapId: "id-mu",
    island: "Maluku",
    name: "Maluku Utara",
    summary:
      "Halmahera, Ternate, Tidore, dan pulau-pulau sekitarnya: tanah asal cengkih dan pusat dua kesultanan yang pernah menguasai perdagangan rempah.",
    house: {
      name: "Sasadu",
      description: "Rumah adat suku Sahu di Halmahera Barat, tanpa dinding dengan atap rumbia yang menjuntai rendah. Dipakai untuk musyawarah dan pesta adat.",
    },
    attire: {
      name: "Manteren Lamo",
      description: "Busana kebesaran sultan Ternate: jas tertutup berkancing perak dengan celana panjang hitam bergaris merah, dipakai dalam upacara kesultanan.",
    },
    dance: {
      name: "Tari Soya-soya",
      description: "Tari perang Ternate yang dikisahkan lahir pada masa Sultan Baabullah. Penari membawa perisai salawaku dan pedang; kini tampil untuk menyambut tamu.",
    },
    music: { song: "Borero", instrument: "Tifa dan gong" },
    history:
      "Ternate dan Tidore, dua kesultanan yang bersaing, pernah menguasai perdagangan cengkih di timur Nusantara. Setelah Portugis membunuh Sultan Khairun pada 1570, putranya, Sultan Baabullah, mengusir Portugis dari Ternate pada 1575. Dari Ternate pula Alfred Russel Wallace mengirim tulisannya tentang seleksi alam pada 1858.",
    exhibits: [
      {
        id: "burung-bidadari",
        kind: "alam",
        title: "Burung Bidadari Halmahera",
        description:
          "Cenderawasih endemik Halmahera dan Bacan yang dicatat Wallace pada 1858. Burung jantan punya dua pasang bulu putih panjang yang mencuat dari sayapnya.",
        height: 2.4,
        ...sketchfab("466626c14f6e4a6eb38876b082868f3b", "Burung Bidadari", "kasyif"),
      },
      {
        id: "cengkih",
        kind: "alam",
        title: "Cengkih",
        description: "Kuncup bunga cengkih yang dikeringkan. Pohon cengkih berasal dari Maluku Utara; di lereng Gunung Gamalama, Ternate, tumbuh Cengkih Afo yang berumur ratusan tahun.",
        height: 0.5,
        ...sketchfab("6a8b796492ff42018cf79e9717f99b4f", "Clove - Syzygium aromaticum", "Frank McMains", "CC BY 4.0", 0.15),
      },
      {
        id: "foto-kedaton-ternate",
        kind: "bangunan",
        title: "Kedaton Kesultanan Ternate",
        description: "Istana Sultan Ternate yang dibangun pada 1813, kini sekaligus menjadi museum.",
        height: 1.5,
        ...commons("Kedaton Kesultanan Ternate 7.jpg", "Ana Ainina", "CC BY 4.0"),
      },
      {
        id: "foto-masjid-ternate",
        kind: "bangunan",
        title: "Masjid Sultan Ternate",
        description: "Masjid kesultanan beratap tumpang bersusun di dekat kedaton.",
        height: 1.4,
        ...commons("Masjid Sultan Ternate.jpg", "Si Gam", "CC BY 4.0"),
      },
      {
        id: "foto-tolukko",
        kind: "bangunan",
        title: "Benteng Tolukko",
        description: "Benteng batu kecil di tepi pantai Ternate, dibangun Portugis pada abad ke-16.",
        height: 1.5,
        ...commons("Benteng Tolukko, Ternate 01.jpg", "RaymondSutanto", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sasadu",
        kind: "bangunan",
        title: "Sasadu",
        description: "Rumah adat Sasadu di Desa Toboso, Jailolo, dengan atap rumbia yang menjuntai hampir ke tanah.",
        height: 1.5,
        ...commons("Rumah Adat Sasadu Desa Toboso, Jailolo.jpg", "Ana Ainina", "CC BY 4.0"),
      },
      {
        id: "foto-al-munawwar",
        kind: "bangunan",
        title: "Masjid Raya Al-Munawwar",
        description: "Masjid raya Ternate yang berdiri di atas lahan reklamasi di tepi laut, dengan menara yang tampak dari kejauhan.",
        height: 1.4,
        ...commons("Masjid Al-Munawwar Ternate.jpg", "Si Gam", "CC BY-SA 4.0"),
      },
      {
        id: "foto-gohu",
        kind: "kuliner",
        title: "Gohu Ikan",
        description:
          "Tuna mentah dipotong dadu, dicampur jeruk, cabai, kemangi, dan kacang sangrai, lalu disiram minyak panas. Sering dijuluki sashimi dari Ternate.",
        height: 1.4,
        ...commons("Gohu ikan-1.jpg", "Oceanmuse", "CC BY 4.0"),
      },
    ],
    quiz: [
      {
        q: "Rempah yang berasal dari Maluku Utara dan diperebutkan Portugis serta Spanyol adalah...",
        options: ["Cengkih", "Lada", "Kunyit", "Jahe"],
        answer: 0,
      },
      {
        q: "Sultan Ternate yang mengusir Portugis pada 1575 adalah...",
        options: ["Sultan Khairun", "Sultan Nuku", "Sultan Baabullah", "Sultan Hasanuddin"],
        answer: 2,
      },
      {
        q: "Rumah adat suku Sahu di Halmahera Barat disebut...",
        options: ["Baileo", "Sasadu", "Honai", "Tongkonan"],
        answer: 1,
      },
    ],
  },
  {
    slug: "papua-barat",
    mapId: "id-pb",
    island: "Papua",
    name: "Papua Barat",
    summary:
      "Kepala Burung Pulau Papua, dari Pegunungan Arfak sampai Teluk Bintuni. Di peta ini wilayahnya masih termasuk Sorong dan Raja Ampat, yang sejak 2022 menjadi Papua Barat Daya.",
    house: {
      name: "Rumah Kaki Seribu",
      description:
        "Rumah suku Arfak (mod aki aksa) yang berdiri di atas puluhan tiang kayu kecil. Tanpa jendela dan berpintu sempit agar hangat dan aman dari musuh maupun binatang.",
    },
    attire: {
      name: "Rok Rumbai dan Kain Timor",
      description:
        "Rok dari serat daun sagu atau pandan dengan hiasan bulu burung dan manik. Kain timor, kain tenun yang datang lewat perdagangan, menjadi harta berharga untuk mas kawin.",
    },
    dance: {
      name: "Tari Tumbu Tanah",
      description: "Tari suku Arfak yang dibawakan berbaris sambil menghentakkan kaki ke tanah dan bernyanyi, untuk menyambut tamu atau merayakan pernikahan.",
    },
    music: { song: "Apuse", instrument: "Tifa" },
    history:
      "Pada 5 Februari 1855, dua penginjil Jerman, Ottow dan Geissler, mendarat di Pulau Mansinam dekat Manokwari; tanggal ini diperingati sebagai Hari Pekabaran Injil di Tanah Papua. Lagu Apuse bercerita tentang perjalanan ke Teluk Doreri di Manokwari.",
    exhibits: [
      {
        id: "tari-sajojo",
        kind: "seni",
        title: "Tari Sajojo",
        description: "Tari pergaulan yang populer di seluruh Tanah Papua, ditarikan beramai-ramai dengan langkah lincah mengikuti lagu Sajojo.",
        height: 3.0,
        ...sketchfab("f8f58e95b4bf4f3cbf846b7a38176129", "Tari Sajojo Papua", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "foto-kaki-seribu",
        kind: "bangunan",
        title: "Rumah Kaki Seribu",
        description: "Rumah suku Arfak di atas puluhan tiang kayu kecil.",
        height: 1.5,
        ...commons("Rumah Kaki Seribu (Mod Aki Aksa).jpg", "RaiyaniM", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tumbu-tanah",
        kind: "seni",
        title: "Tari Tumbu Tanah",
        description: "Penari Tumbu Tanah menghentakkan kaki sambil bernyanyi.",
        height: 1.5,
        ...commons("Tari Tumbu Tanah (1).jpg", "Keenan63", "CC BY-SA 4.0"),
      },
      {
        id: "foto-raja-ampat",
        kind: "alam",
        title: "Raja Ampat",
        description: "Pulau-pulau karst Wayag di Raja Ampat, kawasan dengan ratusan jenis karang dan lebih dari seribu jenis ikan karang.",
        height: 1.5,
        ...commons("Wayag Island, Raja Ampat (14467281965).jpg", "Elias Levy", "CC BY 2.0"),
      },
      {
        id: "foto-cenderawasih-merah",
        kind: "alam",
        title: "Cenderawasih Merah",
        description: "Cenderawasih merah hanya hidup di Pulau Waigeo dan Batanta, Raja Ampat. Burung jantan menari untuk memamerkan bulunya.",
        height: 1.5,
        ...commons("Red Bird-of-Paradise 0A2A2853.jpg", "JJ Harrison", "CC BY-SA 4.0"),
      },
      {
        id: "foto-kain-timor",
        kind: "busana",
        title: "Kain Timor",
        description: "Kain tenun yang dibawa pedagang ke Kepala Burung. Bagi suku seperti Maybrat dan Tehit, kain timor adalah harta untuk mas kawin dan denda adat.",
        height: 1.3,
        ...commons("Kain Timor Papua.jpg", "Balai Arkeologi Papua", "Public domain"),
      },
      {
        id: "foto-mansinam",
        kind: "bangunan",
        title: "Pulau Mansinam",
        description: "Monumen di Pulau Mansinam, Manokwari, untuk mengenang mendaratnya penginjil Ottow dan Geissler pada 1855.",
        height: 1.6,
        ...commons("Patung Yesus Raja Mansinam 002.jpg", "Donnyrezapahlevi", "CC0"),
      },
      {
        id: "foto-papeda",
        kind: "kuliner",
        title: "Papeda",
        description:
          "Bubur sagu bening dan lengket yang digulung dengan sepasang sumpit bambu, disantap dengan ikan kuah kuning. Makanan pokok di pesisir Papua dan Maluku.",
        height: 1.4,
        ...commons("Papeda, Kuah Kuning, Ikan Tude Bakar 2.jpg", "Gunawan Kartapranata", "CC BY-SA 3.0"),
      },
    ],
    quiz: [
      {
        q: "Rumah adat suku Arfak yang berdiri di atas banyak tiang disebut...",
        options: ["Honai", "Rumah Kaki Seribu", "Baileo", "Sasadu"],
        answer: 1,
      },
      {
        q: "Kepulauan di Kepala Burung Papua yang terkenal dengan terumbu karangnya adalah...",
        options: ["Raja Ampat", "Wakatobi", "Karimunjawa", "Derawan"],
        answer: 0,
      },
      {
        q: "Pulau tempat penginjil Ottow dan Geissler mendarat pada 1855 adalah...",
        options: ["Biak", "Numfor", "Mansinam", "Yapen"],
        answer: 2,
      },
    ],
  },
  {
    slug: "papua",
    mapId: "id-pa",
    island: "Papua",
    name: "Papua",
    summary:
      "Pulau dengan ratusan suku dan bahasa, dari pesisir Teluk Cenderawasih sampai Lembah Baliem di pegunungan tengah.",
    house: {
      name: "Honai",
      description:
        "Rumah bulat berdinding kayu dengan atap jerami berbentuk kubah, tanpa jendela agar hangat di udara pegunungan. Dikenal dari suku Dani di Lembah Baliem.",
    },
    attire: {
      name: "Koteka dan rok rumbai",
      description:
        "Laki-laki pegunungan memakai koteka dari kulit labu kering, perempuan memakai rok rumbai dari serat tumbuhan. Hiasan kepala dari bulu burung dipakai saat upacara.",
    },
    dance: {
      name: "Tari Yospan",
      description:
        "Gabungan dua tarian pergaulan, Yosim dan Pancar, yang dibawakan beramai-ramai dengan gerak riang. Kini sering ditampilkan untuk menyambut tamu.",
    },
    music: { song: "Apuse", instrument: "Tifa" },
    history:
      "Di Lembah Baliem, kebun ubi jalar suku Dani diolah dengan sistem parit yang diwariskan turun-temurun. Festival Budaya Lembah Baliem kini menampilkan tradisi perang-perangan antarsuku sebagai pertunjukan.",
    exhibits: [
      {
        id: "honai",
        kind: "bangunan",
        title: "Honai",
        description:
          "Rumah bulat beratap jerami tanpa jendela dari Lembah Baliem. Perapian di tengahnya menghangatkan penghuni di udara pegunungan.",
        height: 2.6,
        ...sketchfab("666e96defd3c40fc856fc9c81ccb64ef", "Honai House", "Adbel Hasyir"),
      },
      {
        id: "busana-papua",
        kind: "busana",
        title: "Busana Adat Papua",
        description: "Busana upacara perempuan Papua: hiasan kepala dari bulu burung, kalung, dan rok rumbai dari serat tumbuhan.",
        height: 1.7,
        ...sketchfab("886772a543634b37af9acbc08949bb7d", "Traditional Papuan Costume", "Fadly.W"),
      },
      {
        id: "foto-tifa",
        kind: "seni",
        title: "Tifa",
        description: "Gendang kayu berbentuk tabung panjang dari kawasan Teluk Cenderawasih, dibuat sebelum 1883. Koleksi Tropenmuseum.",
        height: 1.3,
        ...commons("Tifa, Geelvink Bay cultures, Cenderawasih Bay, before 1883.jpg", "Tropenmuseum", "CC BY-SA 4.0"),
      },
      {
        id: "foto-noken",
        kind: "benda",
        title: "Noken",
        description: "Tas rajut dari serat kayu atau anggrek yang dibawa di kepala. Diakui UNESCO pada 2012 sebagai warisan yang perlu segera dilindungi.",
        height: 1.4,
        ...commons("Noken.jpg", "Nurul Ichlasiah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-festival-baliem",
        kind: "tradisi",
        title: "Festival Lembah Baliem",
        description: "Pembukaan Festival Lembah Baliem 2018, yang menampilkan tradisi perang-perangan antarsuku sebagai pertunjukan.",
        height: 1.5,
        ...commons("Opening Ceremony of Baliem Valley Festival 2018.jpg", "Nurul Ichlasiah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-yospan",
        kind: "seni",
        title: "Tari Yospan",
        description: "Penari Yospan (Yosim Pancar) menari beramai-ramai dengan gerak riang.",
        height: 1.5,
        ...commons("Yosim Pancar (Yospan).jpg", "Rian Tatuwo", "CC BY-SA 4.0"),
      },
      {
        id: "sagu-bakar",
        kind: "kuliner",
        title: "Sagu Bakar",
        description: "Tepung sagu dibakar hingga padat dan tahan lama, salah satu cara orang Papua mengolah sagu, makanan pokok mereka selain ubi.",
        height: 0.35,
        ...sketchfab("608effe1aba140bdbadd377b6811d09c", "Sagu Bakar Papua", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.1),
      },
      {
        id: "foto-youtefa",
        kind: "bangunan",
        title: "Jembatan Youtefa",
        description:
          "Jembatan lengkung merah di Teluk Youtefa, Jayapura, diresmikan pada 2019. Bentang lengkungnya dirakit di Surabaya lalu dikapalkan ke Papua.",
        height: 1.5,
        ...commons("Jembatan Youtefa.jpg", "Dimas H (WMID)", "CC BY-SA 4.0"),
      },
      {
        id: "foto-ulat-sagu",
        kind: "kuliner",
        title: "Ulat Sagu",
        description: "Larva kumbang yang hidup di batang sagu yang membusuk, dimakan mentah atau dibakar. Sumber protein penting bagi masyarakat Papua.",
        height: 1.4,
        ...commons("Ulat sagu.jpg", "Tipank", "CC BY-SA 4.0"),
      },
    ],
    quiz: [
      {
        q: "Mengapa Honai dibuat tanpa jendela?",
        options: ["Agar tidak dimasuki hewan", "Agar tetap hangat di udara pegunungan", "Karena kekurangan kayu", "Agar terlihat megah"],
        answer: 1,
      },
      {
        q: "Alat musik pukul khas Papua yang berbentuk gendang panjang adalah...",
        options: ["Tifa", "Kolintang", "Sasando", "Talempong"],
        answer: 0,
      },
      {
        q: "Tari Yospan merupakan gabungan dari tarian...",
        options: ["Saman dan Seudati", "Kecak dan Legong", "Yosim dan Pancar", "Piring dan Payung"],
        answer: 2,
      },
    ],
  },
];

export const findProvince = (slug: string) => provinces.find((p) => p.slug === slug);

// Naskah pemandu suara: hanya dari data provinsi yang juga tampil di panel Info, tanpa fakta tambahan.
// Dibacakan jadi public/audio/pemandu/{slug}.mp3 oleh `pnpm guide`; jalankan ulang setelah data provinsi berubah.
export function guideScript(p: Province) {
  const food = p.exhibits.filter((e) => e.kind === "kuliner").map((e) => e.title);
  return [
    `Selamat datang di ruang pamer ${p.name}.`,
    p.summary,
    `Rumah adat: ${p.house.name}.`,
    p.house.description,
    `Pakaian adat: ${p.attire.name}.`,
    p.attire.description,
    `Tarian: ${p.dance.name}.`,
    p.dance.description,
    `Lagu daerah: ${p.music.song}, dengan alat musik ${p.music.instrument}.`,
    food.length ? `Kuliner di ruang pamer ini: ${food.join(", ")}.` : "",
    `Sejarah singkat. ${p.history}`,
  ]
    .filter(Boolean)
    .join(" ");
}
