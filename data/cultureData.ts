export type Item = { name: string; description: string };

export type Question = { q: string; options: string[]; answer: number };

export type Credit = { title: string; author: string; license: string; url: string };

// Koleksi museum. Exhibit pertama = pusat ruangan (wajib model). File diunduh oleh `pnpm assets`.
export type Exhibit = {
  id: string; // public/models/{id}.glb untuk Sketchfab, public/images/{id}.jpg untuk Commons
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
export const islands = ["Sumatra", "Jawa", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Papua"] as const;
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
        title: "Rumoh Aceh (Krong Bade)",
        description:
          "Rumah panggung kayu Aceh dengan tangga di depan. Kolong rumah dipakai untuk menyimpan padi dan alat kerja, juga tempat perempuan menenun.",
        height: 3.0,
        ...sketchfab("8d131cf689a64016aedf96875811c307", "Rumah Krong Bade Aceh", "bangfikri"),
      },
      {
        id: "rencong",
        title: "Rencong",
        description: "Senjata tikam khas Aceh dengan gagang melengkung. Dulu diselipkan di pinggang sebagai lambang keberanian dan martabat pemakainya.",
        height: 0.5,
        ...sketchfab("1626e94c3bf74cef9c75afce63be1a93", "Rencong Aceh", "apasipepgapuak"),
      },
      {
        id: "foto-saman",
        title: "Tari Saman",
        description: "Penari Saman bergerak serempak dalam satu baris, hanya diiringi tepukan tangan, tepukan dada, dan syair.",
        height: 1.5,
        ...commons("Penari Saman Aceh.jpg", "Muhammad Iqbal", "CC BY-SA 4.0"),
      },
      {
        id: "foto-baiturrahman",
        title: "Masjid Raya Baiturrahman",
        description:
          "Masjid di pusat Banda Aceh, dibangun ulang pada 1879–1881 setelah masjid lama terbakar dalam perang melawan Belanda. Masjid ini tetap berdiri saat tsunami 2004.",
        height: 1.5,
        ...commons("Meuseujid Raya Bayturrahman.JPG", "Si Gam Acèh", "CC BY-SA 3.0"),
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
        title: "Busana Ulos Batak",
        description:
          "Perempuan Batak berbusana adat: ulos diselempangkan di bahu dan dililit sebagai sarung. Ulos juga diberikan sebagai lambang restu dalam upacara adat.",
        height: 3.4,
        turn: 180,
        ...sketchfab("47328dde4d2f4676964fbfbc3b5029ce", "Batak traditional clothing—Indonesia", "Fadly.W"),
      },
      {
        id: "busana-batak-laki",
        title: "Busana Adat Laki-laki Batak",
        description: "Busana laki-laki Batak dengan ulos di bahu dan ikat kepala tenun. Model ini dibuat dari foto orang sungguhan (fotogrametri).",
        height: 1.8,
        ...sketchfab("c0391d3108154981a10db06edeba0c83", "Pakaian Adat Batak Cowok", "Abim Project"),
      },
      {
        id: "taganing",
        title: "Taganing",
        description:
          "Gendang Batak Toba dalam ansambel gondang sabangunan. Beberapa gendang bernada berbeda disusun berjajar dan ditabuh dengan dua stik.",
        height: 0.7,
        ...sketchfab("e8d60a4bdc304b2682fff330bd8c3df7", "Tagading/Gondang Batak", "Repni Ramadani"),
      },
      {
        id: "foto-rumah-bolon",
        title: "Rumah Bolon",
        description: "Deretan rumah bolon Batak Toba dengan atap pelana yang ujungnya mencuat tinggi.",
        height: 1.5,
        ...commons("Rumah Bolon.jpg", "Nurul Ichlasiah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-tortor",
        title: "Tari Tor-tor",
        description: "Penari tor-tor berbusana ulos menari dengan gerak tangan yang pelan dan khidmat.",
        height: 1.5,
        ...commons("Tor-Tor Dance.jpg", "Angeline Claudia", "CC BY-SA 4.0"),
      },
      {
        id: "foto-sigale-gale",
        title: "Sigale-gale",
        description:
          "Boneka kayu seukuran manusia dari Samosir yang digerakkan dengan tali sehingga bisa menari tor-tor. Dulu dimainkan dalam upacara kematian.",
        height: 1.5,
        ...commons("Tari Sigale-gale Pulau Samosir.jpg", "Dan Lundberg", "CC BY-SA 2.0"),
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
        title: "Rumah Gadang",
        description:
          "Rumah adat Minangkabau. Atap gonjong bertingkat dan lantai panggung kayunya dirancang untuk keluarga besar dari satu garis ibu.",
        height: 3.2,
        ...sketchfab("be692baf8eb34cd99eb7b37ad531256c", "Rumah Gadang Sumatra Barat Indonesia", "bangfikri"),
      },
      {
        id: "penari-piring",
        title: "Penari Piring",
        description:
          "Penari perempuan dengan busana merah bersulam emas dan penutup kepala bertanduk, membawa piring di kedua telapak tangan.",
        height: 1.7,
        ...sketchfab("fe5a227721504211b3c13d0f28076bc6", "Tari Piring Sumatera", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.3),
      },
      {
        id: "tambua",
        title: "Tambua",
        description:
          "Gendang besar Minangkabau yang ditabuh beramai-ramai dalam arak-arakan tambua tansa, terutama di Pariaman.",
        height: 0.8,
        ...sketchfab("ddb267b5578f486a833031ae2342612b", "Tambua (minang tribe drum)", "apasipepgapuak", "CC BY 4.0", 0.3),
      },
      {
        id: "jam-gadang",
        title: "Jam Gadang (miniatur)",
        description:
          "Menara jam di pusat Bukittinggi, dibangun pada 1926. Atapnya kini berbentuk gonjong seperti rumah gadang.",
        height: 1.6,
        ...sketchfab("3308f98df3e9434caafd77c779c5dd2a", "Jam Gadang - Big Clock", "dekahobby"),
      },
      {
        id: "foto-tari-piring",
        title: "Tari Piring di Pesisir Selatan",
        description: "Penari mengayunkan piring sambil bergerak cepat, bahkan di atas pecahan kaca pada pertunjukan tertentu.",
        height: 1.5,
        ...commons("Tari Piring di Pesisir Selatan.jpg", "Syofiardi Bachyul Jb", "CC BY-SA 4.0"),
      },
      {
        id: "foto-talempong",
        title: "Talempong",
        description: "Deretan gong kecil dari logam yang dimainkan bersahutan, mengiringi tari dan upacara adat Minang.",
        height: 1.3,
        ...commons("Talempong diatonis 2.jpg", "Pemerintah Provinsi DKI Jakarta", "Public domain"),
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
        title: "Kajang Lako",
        description: "Rumah panggung panjang Melayu Jambi dengan atap melengkung seperti perahu. Kolongnya tinggi untuk menghindari luapan sungai.",
        height: 3.0,
        ...sketchfab("deb909440e9c4f1999a25d9e4434a424", "Rumah Adat Tradisional Jambi Kajang Lako", "bangfikri"),
      },
      {
        id: "candi-muaro-jambi",
        title: "Candi Muaro Jambi (model)",
        description:
          "Candi bata merah berundak dari kompleks Muaro Jambi. Puluhan candi dan gundukan bata (menapo) tersebar di tepi Batanghari.",
        height: 1.3,
        ...sketchfab("314dbb47891c44f19f0e0db4544790d4", "Candi+muaro+jambi", "marvin.l"),
      },
      {
        id: "foto-muaro-jambi",
        title: "Situs Muaro Jambi",
        description: "Sisa candi bata di kawasan Muaro Jambi, di antara pepohonan tua di tepi Sungai Batanghari.",
        height: 1.5,
        ...commons("Muaro Jambi Temple - Muaro Jambi, JA (10 Mar 2023) 06.jpg", "Firzafp", "CC BY-SA 4.0"),
      },
      {
        id: "foto-batik-jambi",
        title: "Batik Jambi",
        description: "Batik Jambi memakai motif dari alam sekitar, seperti angso duo (sepasang angsa) dan durian pecah.",
        height: 1.3,
        ...commons("Batik-jambi.jpg", "Aditya alakbar", "CC BY-SA 4.0"),
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
        title: "Jembatan Ampera (miniatur)",
        description: "Jembatan di atas Sungai Musi yang diresmikan pada 1965. Bagian tengahnya dulu bisa diangkat agar kapal tinggi bisa lewat.",
        height: 2.9,
        ...sketchfab("00a2502bda5c47bf8018307efb3b6d5c", "Jembatan Ampera Palembang2", "giga"),
      },
      {
        id: "foto-rumah-limas",
        title: "Rumah Limas",
        description: "Rumah Limas di halaman Museum Balaputradewa, Palembang. Rumah ini pernah tergambar di uang kertas Rp10.000.",
        height: 1.5,
        ...commons("Rumah Limas Museum Balaputradewa.jpg", "Fernando Tri Tanjung", "CC BY-SA 4.0"),
      },
      {
        id: "foto-songket",
        title: "Songket Palembang",
        description: "Penenun menyisipkan benang emas helai demi helai di antara benang lungsin. Satu kain bisa dikerjakan berminggu-minggu.",
        height: 1.5,
        ...commons("Melestarikan Songket Palembang.jpg", "Afrinaldi Zulhen", "CC BY-SA 4.0"),
      },
      {
        id: "foto-aesan-gede",
        title: "Aesan Gede",
        description: "Busana pengantin Aesan Gede dengan mahkota karsuhun dan songket emas.",
        height: 1.7,
        ...commons("Aesan Gede Songket Palembang.jpg", "Gunkarta", "CC BY-SA 3.0"),
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
        title: "Rumah Baduy",
        description:
          "Rumah panggung Baduy dari bambu, kayu, dan atap daun. Rumah-rumah di kampung Baduy dibuat seragam dan sederhana, selaras dengan ajaran untuk hidup bersahaja.",
        height: 3.0,
        ...sketchfab("7b63547bab334c83ae5d81e88ac16fbf", "Rumah Baduy Indonesia ( Option 1 )", "mbung"),
      },
      {
        id: "meriam-ki-amuk",
        title: "Meriam Ki Amuk",
        description: "Meriam perunggu peninggalan Kesultanan Banten yang kini berada di Banten Lama. Badannya berhias tulisan Arab.",
        height: 1.3,
        ...sketchfab("e71c6791838c4313b2c6ab12c1349c49", "Meriam Ki Amuk", "Kebudayaan Indonesia"),
      },
      {
        id: "leuit",
        title: "Leuit",
        description: "Lumbung padi masyarakat Sunda dan Baduy. Padi bisa disimpan di sini hingga puluhan tahun sebagai cadangan pangan.",
        height: 1.6,
        turn: 90,
        ...sketchfab("c61974b1b5e54943a3a373bf3030b285", "Leuit", "afansugianto68"),
      },
      {
        id: "foto-debus",
        title: "Debus",
        description: "Pemain debus memperlihatkan kekebalan tubuh terhadap benda tajam, seni yang berkembang sejak masa Kesultanan Banten.",
        height: 1.5,
        ...commons("Debus, The Ancient Martial Art and Culture of Banten Indonesia.jpg", "Dhani ilham", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-banten",
        title: "Masjid Agung Banten",
        description: "Dibangun pada masa Sultan Maulana Hasanuddin di abad ke-16. Menaranya yang mirip mercusuar menjadi ikon Banten Lama.",
        height: 1.5,
        ...commons("Masjid agung banten lama.jpg", "Firdaus31", "CC BY-SA 4.0"),
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
        title: "Monas (miniatur)",
        description:
          "Tugu setinggi 132 meter di Lapangan Merdeka. Puncaknya berupa lidah api berlapis emas, lambang semangat perjuangan yang tidak pernah padam.",
        height: 3.4,
        ...sketchfab("d5d7f266237141c895f65811c867016b", "Monas", "Singgih Pramono"),
      },
      {
        id: "ondel-laki",
        title: "Ondel-ondel Laki-laki",
        description: "Boneka raksasa Betawi berwajah merah. Dulu diarak untuk menolak bala, kini meramaikan pesta rakyat dan hajatan.",
        height: 2.0,
        ...sketchfab("2905b56b8534416bb1008c7fe6467311", "Ondel Ondel Man", "Abim Project"),
      },
      {
        id: "ondel-perempuan",
        title: "Ondel-ondel Perempuan",
        description: "Pasangan ondel-ondel laki-laki, berwajah putih. Keduanya diarak bersama iringan tanjidor atau gendang pencak.",
        height: 2.0,
        ...sketchfab("0697a7f838984c0283a77aef8b917423", "Ondel- Ondel Woman", "Abim Project"),
      },
      {
        id: "foto-kerak-telor",
        title: "Kerak Telor",
        description: "Beras ketan, telur, dan ebi dimasak di atas anglo arang. Wajannya dibalik menghadap api sampai keraknya kering.",
        height: 1.5,
        ...commons("Kerak Telor Betawi Vendor.jpg", "Gunawan Kartapranata", "CC BY-SA 3.0"),
      },
      {
        id: "foto-silat-betawi",
        title: "Silat Betawi",
        description: "Silat Betawi juga tampil dalam tradisi palang pintu: adu pantun dan jurus sebelum rombongan pengantin pria boleh masuk.",
        height: 1.6,
        ...commons("Pencak Silat Betawi 2.jpg", "Gunawan Kartapranata", "CC BY-SA 4.0"),
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
        title: "Imah Julang Ngapak",
        description:
          "Rumah panggung Sunda dengan atap yang melebar di kedua sisi seperti sayap burung julang. Kolong rumah menjaga lantai tetap kering.",
        height: 2.8,
        ...sketchfab("5a1bbf8170eb4382946f26057cf6ebd3", "Traditional Sundanese House – Julang Ngapak", "gianoergraha83"),
      },
      {
        id: "wayang-golek",
        title: "Wayang Golek Arjuna",
        description:
          "Boneka kayu tiga dimensi untuk pertunjukan wayang golek, seni pertunjukan khas Sunda. Arjuna adalah ksatria Pandawa. Pindaian dari koleksi museum di Małopolska, Polandia.",
        height: 1.1,
        ...sketchfab("3043564cc38b49aa8b08a61ce68dd61a", "“Arjuna” — “Wayang Golek” theatre puppet", "Virtual Museums of Małopolska", "CC0"),
      },
      {
        id: "kujang",
        title: "Kujang",
        description: "Senjata dan pusaka khas Sunda dengan bilah melengkung berlubang. Bentuknya menjadi bagian lambang Provinsi Jawa Barat.",
        height: 0.6,
        ...sketchfab("6d44595205b541ada61f6ceca4148300", "Kujang", "eljaasb"),
      },
      {
        id: "foto-angklung",
        title: "Angklung dalam Seren Taun",
        description: "Angklung diarak dalam Seren Taun, upacara syukur panen masyarakat Sunda.",
        height: 1.5,
        ...commons("Seren Taun 2012 Bogor A.jpg", "Onotrapokenifla", "CC BY-SA 4.0"),
      },
      {
        id: "foto-jaipong",
        title: "Tari Jaipong",
        description: "Penari Jaipong dengan selendang, bergerak mengikuti tepakan kendang.",
        height: 1.5,
        ...commons("Jaipongan Langit Biru 01.jpg", "Gunawan Kartapranata", "CC BY-SA 3.0"),
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
        title: "Rumah Joglo",
        description: "Rumah Jawa beratap tinggi bertumpuk di tengah yang ditopang empat saka guru. Dulu atap joglo menandai pemilik dari kalangan berada.",
        height: 3.0,
        ...sketchfab("a912c962122446ecac7d51c0750d8d46", "Rumah Joglo Indonesia ( Option 2 )", "mbung"),
      },
      {
        id: "stupa-borobudur",
        title: "Stupa Borobudur (miniatur)",
        description: "Stupa berterawang di teras atas Borobudur; di dalam tiap stupa duduk arca Buddha. Teras melingkar ini mengelilingi stupa induk di puncak.",
        height: 1.4,
        ...sketchfab("84525b2dc4094057ab33e026eb961371", "Borobudur temple", "giga"),
      },
      {
        id: "menara-kudus",
        title: "Menara Kudus (miniatur)",
        description: "Menara masjid dari bata merah di Kudus yang bentuknya mirip candi, bukti perpaduan budaya Hindu-Jawa dan Islam pada masa Sunan Kudus.",
        height: 1.6,
        ...sketchfab("344a95d373ec4c379c5c6542e7957345", "Menara Kudus", "feraldo.trio.carrera"),
      },
      {
        id: "jamu-gendong",
        title: "Penjual Jamu Gendong",
        description: "Penjual jamu menggendong bakul berisi botol jamu, minuman herbal tradisional Jawa. Budaya sehat jamu diakui UNESCO pada 2023.",
        height: 1.7,
        ...sketchfab("b55d50eb82714ac5b19b2e475bf35f08", "Woman carrying a basket./ Gadis Penjual Jamu", "Fadly.W", "CC BY 4.0", 0.5),
      },
      {
        id: "keris-surakarta",
        title: "Keris Surakarta",
        description: "Keris berbilah luk dengan warangka kayu gaya Surakarta. Keris Indonesia diakui UNESCO sebagai mahakarya warisan budaya pada 2005.",
        height: 0.55,
        ...sketchfab("8ff76ed3edbf4071a0ca2043c84ba225", "Keris Surakarta", "dwiwahyuwardhani"),
      },
      {
        id: "foto-borobudur",
        title: "Candi Borobudur",
        description: "Candi Buddha terbesar di dunia di Magelang, dengan lebih dari 2.600 panel relief.",
        height: 1.5,
        ...commons("Borobudur, Java, Indonesia, 20220817 1013 8739.jpg", "Jakub Hałun", "CC BY-SA 4.0"),
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
        title: "Candi Prambanan (miniatur)",
        description: "Kompleks candi Hindu terbesar di Indonesia, dibangun pada abad ke-9. Candi utamanya, setinggi 47 meter, dipersembahkan untuk Siwa.",
        height: 4.6,
        ...sketchfab("cdd1b1ad94044be58d5fff6ae2485b37", "Candi Prambanan low poly", "imanboer", "CC BY 4.0", 0.5),
      },
      {
        id: "candi-apit",
        title: "Candi Apit",
        description: "Salah satu dari dua candi apit di kompleks Prambanan, setinggi sekitar 14 meter. Model ini dipindai dari candi aslinya (fotogrametri).",
        height: 1.6,
        ...sketchfab("be4a9fe23f5a483e8e79093565ea4155", "Candi Apit", "dekahobby"),
      },
      {
        id: "bedug",
        title: "Bedug",
        description: "Gendang besar dari kayu dan kulit yang ditabuh di serambi masjid-masjid Jawa untuk menandai waktu salat.",
        height: 1.4,
        ...sketchfab("15bbca47e2fc48b297a1347b0be24bc3", "Bedug", "apasipepgapuak", "CC BY 4.0", 0.25),
      },
      {
        id: "wayang-kulit",
        title: "Wayang Kulit",
        description:
          "Tokoh wayang dipahat dari kulit kerbau lalu diwarnai. Dalang memainkannya di balik kelir dengan iringan gamelan. Wayang diakui UNESCO pada 2003.",
        height: 1.0,
        ...sketchfab("c0d39bc019294e679d86b34077711fb4", "Wayang jawa Bima Yudistira", "argaanug"),
      },
      {
        id: "foto-kraton",
        title: "Keraton Yogyakarta",
        description: "Regol Donopratopo, gerbang menuju halaman inti Keraton Yogyakarta, dijaga sepasang arca raksasa dwarapala.",
        height: 1.5,
        ...commons("Jogja - Kraton Yogyakarta - Donopratono gate (2025) - img 01.jpg", "Chainwit.", "CC BY 4.0"),
      },
      {
        id: "foto-batik-imogiri",
        title: "Batik Tulis Imogiri",
        description: "Pembatik di Imogiri, Bantul, menorehkan malam dengan canting. Batik Indonesia diakui UNESCO pada 2009.",
        height: 1.5,
        ...commons("Maestro Batik Tulis di Imogiri.jpg", "Aconkyeah", "CC BY-SA 4.0"),
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
        title: "Rumah Osing",
        description: "Rumah adat suku Osing, keturunan masyarakat Blambangan di Banyuwangi. Rangka kayunya disambung dengan pasak.",
        height: 3.0,
        ...sketchfab("5d19da76945f4447a747e315a5a6e66f", "Rumah Adat Osing", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "reog",
        title: "Reog Ponorogo",
        description: "Pembarong dengan dadak merak: topeng harimau bermahkota ratusan helai bulu merak.",
        height: 2.2,
        turn: 180,
        ...sketchfab("200b1ead86ac497e94cfb3680de055d1", "Reog Ponorogo", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "karapan-sapi",
        title: "Karapan Sapi",
        description: "Lomba pacu sepasang sapi yang menarik kaleles (kereta kayu) dengan joki di atasnya, tradisi masyarakat Madura.",
        height: 1.3,
        ...sketchfab("37886c51f45d4d45aea39e6652e218e6", "Karapan Sapi Madura", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "gandrung",
        title: "Tari Gandrung",
        description: "Tari khas Banyuwangi sebagai ungkapan syukur setelah panen. Penari membawa kipas dan bermahkota omprok.",
        height: 1.7,
        ...sketchfab("c2214f5b7de7403797b04324b0d41405", "3D Tari Gandrung", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "busana-madura",
        title: "Busana Adat Madura",
        description: "Pasangan berbusana adat Madura: pesa'an dan kaus garis merah-putih untuk laki-laki, kebaya untuk perempuan.",
        height: 1.7,
        ...sketchfab("a70de5cfe1fc42f2a67b09394f179d0e", "Baju Adat Madura", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.15),
      },
      {
        id: "candi-jabung",
        title: "Candi Jabung",
        description:
          "Candi Buddha bata merah di Probolinggo, peninggalan Majapahit abad ke-14. Kakawin Nagarakretagama menyebutnya Bajrajinaparamitapura.",
        height: 1.6,
        ...sketchfab("4702e8bd0a534dd285b8fa90fd273ccb", "Candi Jabung Bukti Kejayaan Budha Masa Majapahit", "ayusonia.asep27"),
      },
      {
        id: "foto-reog",
        title: "Pertunjukan Reog",
        description: "Rombongan Reog Ponorogo tampil di acara Eksotika Bromo.",
        height: 1.5,
        ...commons("Reog ponorogo dalam event eksotika bromo.jpg", "Ferry pepenk", "CC BY-SA 4.0"),
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
        title: "Candi Bentar",
        description:
          "Gerbang terbelah dua yang menandai pintu masuk kawasan pura atau puri di Bali. Kedua sisinya simetris, seperti gunung yang dibelah.",
        height: 3.4,
        ...sketchfab("9051dc244c984da8a1a4ec7e90e1a567", "Candi Bentar", "nusaheritage.id", "CC BY 4.0", 0.5),
      },
      {
        id: "barong",
        title: "Topeng Barong",
        description: "Barong adalah makhluk mitologis pelindung, lambang kebaikan, yang bertarung melawan Rangda dalam tari Barong.",
        height: 0.8,
        ...sketchfab("a2291d968fd34b2798d18ab6f539595f", "Balinese Barong Mask PBR", "Jungle Jim"),
      },
      {
        id: "topeng-bali",
        title: "Topeng Tari",
        description: "Topeng kayu berukir untuk tari topeng Bali. Setiap topeng mewakili satu tokoh, dari raja sampai pelawak.",
        height: 0.55,
        ...sketchfab("4f9a1f4034c843bbb46ddc44758d379c", "Dancing Mask from Bali - Low poly version", "Troels BP"),
      },
      {
        id: "penjor",
        title: "Penjor",
        description: "Bambu melengkung berhias janur yang dipasang di depan rumah saat Galungan, lambang gunung dan rasa syukur.",
        height: 2.6,
        ...sketchfab("7aca638e85d04c1699c04918cdc36a9e", "Balinese Penjor", "alterego.visual"),
      },
      {
        id: "foto-kecak",
        title: "Tari Kecak",
        description: "Lingkaran penari kecak menyerukan \"cak\" bersahutan di sekeliling api, membawakan kisah Ramayana.",
        height: 1.5,
        ...commons("Kecak Dance Indonesia 1.jpg", "Philip Nalangan", "CC BY-SA 4.0"),
      },
      {
        id: "foto-legong",
        title: "Tari Legong",
        description:
          "Tarian klasik Bali dengan gerak mata dan jari yang detail. Legong Keraton termasuk tari Bali yang diakui UNESCO pada 2015.",
        height: 1.5,
        ...commons("Legong Dance Indonesia 1.jpg", "Philip Nalangan", "CC BY-SA 4.0"),
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
        title: "Komodo",
        description: "Kadal terbesar di dunia yang hanya hidup liar di Pulau Komodo, Rinca, dan sebagian Flores. Panjangnya bisa mencapai 3 meter.",
        height: 1.2,
        ...sketchfab("0b8679521991420a8b48a6e63018f52c", "Komodo Dragon", "all of life"),
      },
      {
        id: "sasando",
        title: "Sasando",
        description: "Alat musik petik dari Pulau Rote: tabung bambu berdawai yang dikelilingi wadah anyaman daun lontar sebagai pengeras suara.",
        height: 0.9,
        ...sketchfab("a9d239d1914b4543b95ed62b5e3465d3", "sasando", "KevinGathfan"),
      },
      {
        id: "patung-tetun",
        title: "Patung Kayu Tetun",
        description:
          "Dua sosok saling memunggungi, koleksi UPTD Museum NTT. Menurut kurator museum, patung ini menggambarkan kisah Tetun tentang kakak-beradik yatim piatu yang bertahan karena saling percaya.",
        height: 1.4,
        ...sketchfab("1bd4b202a8c543b7a755c48b9fbd4b00", "Wooden Statue, UPTD Museum Nusa Tenggara Timur", "Maritime Asia Heritage Survey", "CC BY 4.0", 0.08),
      },
      {
        id: "foto-wae-rebo",
        title: "Kampung Wae Rebo",
        description: "Mbaru niang beratap ijuk di Wae Rebo, kampung adat Manggarai di pegunungan Flores.",
        height: 1.5,
        ...commons("Wae Rebo village, Flores Island, Indonesia, 20250824 0753 3029.jpg", "Jakub Hałun", "CC BY 4.0"),
      },
      {
        id: "foto-pasola",
        title: "Pasola",
        description: "Dua kelompok penunggang kuda saling melempar lembing kayu, bagian dari upacara adat Marapu di Sumba menjelang musim tanam.",
        height: 1.5,
        ...commons("Pasola.jpg", "RaiyaniM", "CC BY-SA 4.0"),
      },
      {
        id: "foto-hinggi",
        title: "Hinggi Kombu",
        description: "Kain tenun ikat laki-laki dari Sumba yang dicelup merah dengan akar mengkudu. Koleksi Honolulu Museum of Art.",
        height: 1.8,
        ...commons("Hinggi kombu (man's mantle or wrapper) from Sumba, Indonesia, Honolulu Museum of Art, 9742.1.JPG", "Honolulu Museum of Art", "CC0"),
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
        title: "Tari Gong (Kancet Ledo)",
        description: "Penari perempuan Dayak Kenyah dengan kipas bulu burung enggang. Tarian ini dibawakan di atas sebuah gong.",
        height: 3.4,
        ...sketchfab("46c294068a3847c78e11443eedc5a88f", "Tari Gong Kalimantan", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "kancet-papatai",
        title: "Tari Kancet Papatai",
        description: "Tari perang Dayak Kenyah. Penari laki-laki membawa mandau dan perisai, menggambarkan keberanian seorang pahlawan.",
        height: 1.8,
        ...sketchfab("a68c6bbecc6b4030b2dce40946ab6358", "Tari Kancet Papatai", "Dwi Putra Nur Muhamad", "CC BY 4.0", 0.2),
      },
      {
        id: "mandau",
        title: "Mandau",
        description: "Parang khas Dayak dengan gagang berukir. Dulu dipakai berperang dan berburu, kini menjadi pusaka dan pelengkap busana adat.",
        height: 0.75,
        ...sketchfab("dbdb279842a24772a55a9ed833742ea5", "Mandau", "apasipepgapuak"),
      },
      {
        id: "perisai-dayak",
        title: "Perisai Dayak",
        description: "Perisai kayu panjang berukir motif wajah penolak bala, pasangan mandau dalam tari perang.",
        height: 1.3,
        ...sketchfab("13102111c6584d2ab671882a09df8a9f", "Tameng Dayak (shield)", "apasipepgapuak"),
      },
      {
        id: "sape",
        title: "Sape'",
        description: "Alat musik petik dari sebatang kayu, dimainkan untuk mengiringi tari dan upacara Dayak.",
        height: 1.1,
        ...sketchfab("cc6775ee72d14521bdee94337dd44a73", "Sapek Guitar", "Adbel Hasyir"),
      },
      {
        id: "foto-lamin",
        title: "Lamin Pemung Tawai",
        description: "Lamin adat di Desa Budaya Pampang, Samarinda, tempat pertunjukan tari Dayak Kenyah untuk pengunjung.",
        height: 1.5,
        ...commons("Lamin Adat Pemung Tawai Samarinda.jpg", "Herusutimbul", "CC BY-SA 4.0"),
      },
      {
        id: "foto-hudoq",
        title: "Topeng Hudoq",
        description: "Topeng untuk ritual Dayak Bahau dan Modang di musim tanam, dipercaya menolak hama dan mendatangkan panen yang baik.",
        height: 1.5,
        ...commons("Hudoq mask.jpg", "Taman Renyah", "CC BY-SA 3.0"),
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
        title: "Rumah Bubungan Tinggi",
        description: "Rumah adat Banjar dengan atap pelana yang menjulang curam di tengah. Dulu menjadi kediaman keluarga Sultan Banjar.",
        height: 3.2,
        ...sketchfab("55f3578178354de999ff200eea3ad0e8", "Rumah Banjar", "mirzaar"),
      },
      {
        id: "foto-pasar-terapung",
        title: "Pasar Terapung Lok Baintan",
        description: "Pedagang di atas jukung menjajakan sayur, buah, dan kue sejak subuh di Sungai Martapura.",
        height: 1.5,
        ...commons("Lok Baintan floating market Martapura.jpg", "Midori", "CC BY 3.0"),
      },
      {
        id: "foto-sasirangan",
        title: "Kain Sasirangan",
        description: "Kain sasirangan berwarna cerah hasil teknik jelujur dan celup khas Banjar.",
        height: 1.5,
        ...commons("Kain Sasirangan 002.JPG", "Ezagren", "CC BY-SA 4.0"),
      },
      {
        id: "foto-bubungan-tinggi",
        title: "Rumah Bubungan Tinggi",
        description: "Rumah Bubungan Tinggi asli di Kalimantan Selatan, dengan atap menjulang dan titian kayu di depannya.",
        height: 1.5,
        ...commons("Rumah Bubungan Tinggi, Rumah Tradisional Kalimantan Selatan.jpg", "Herusutimbul", "CC BY-SA 4.0"),
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
        title: "Baruga",
        description: "Balai pertemuan suku Kaili. Bangunan terbuka beratap tinggi ini dipakai untuk musyawarah adat dan upacara.",
        height: 3.0,
        ...sketchfab("7a0c14ccb3a04218bab97b3b64c9ee5d", "Rumah Adat Baruga Sulawesi Tengah", "kololio.artstudio", "CC BY 4.0", 0.25),
      },
      {
        id: "foto-palindo",
        title: "Arca Palindo",
        description: "Palindo, arca megalitik setinggi sekitar 4 meter di Lembah Bada, Taman Nasional Lore Lindu.",
        height: 1.5,
        ...commons("Patung Palindo Lembah Bada Taman Nasional Lore Lindu.jpg", "Lo2asinamura", "CC BY-SA 4.0"),
      },
      {
        id: "foto-souraja",
        title: "Souraja",
        description: "Souraja atau Banua Oge di Palu, bekas kediaman raja Kaili yang kini menjadi cagar budaya.",
        height: 1.5,
        ...commons("Sou Raja or Banua Oge, Palu, Central Sulawesi 2018-09-17 02.jpg", "Crisco 1492", "CC BY-SA 4.0"),
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
        title: "Tongkonan",
        description:
          "Rumah adat Toraja beratap melengkung seperti perahu, berdiri di atas tiang kayu. Tanduk kerbau di tiang depan menandakan status keluarga.",
        height: 3.0,
        ...sketchfab("d614270568e24b0284a98aa1998b122c", "Tongkonan / Toraja House", "mochamadyuda"),
      },
      {
        id: "pinisi",
        title: "Kapal Pinisi (miniatur)",
        description: "Kapal layar kayu buatan Bugis-Makassar dari Tana Beru, Bulukumba. Seni pembuatannya diakui UNESCO pada 2017.",
        height: 1.4,
        ...sketchfab("3111ee505bd7422d9d30c9cf9da2a467", "pinisi", "pakeotak", "CC BY 4.0", 0.5),
      },
      {
        id: "badik",
        title: "Badik",
        description: "Senjata tikam khas Bugis-Makassar, lambang harga diri (siri') pemiliknya.",
        height: 0.45,
        ...sketchfab("e186ce6cf40f4c269f3aca491dfb43e3", "Badik", "luqman05"),
      },
      {
        id: "foto-baju-bodo",
        title: "Baju Bodo",
        description: "Baju bodo merah dengan sarung sutra dan perhiasan emas, busana adat perempuan Bugis-Makassar.",
        height: 1.6,
        ...commons("Baju Bodo.jpg", "Fery Indrawan", "CC BY 2.0"),
      },
      {
        id: "foto-pakarena",
        title: "Tari Pakarena",
        description: "Penari Pakarena bergerak pelan dengan kipas, sementara gandrang ditabuh keras dan cepat.",
        height: 1.5,
        ...commons("Performing pakarena dance.jpg", "Ali Froghi", "CC BY-SA 4.0"),
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
        title: "Rumah Buton",
        description: "Rumah panggung kayu bertingkat khas Buton. Seluruh rangkanya disambung dengan pasak, tanpa paku.",
        height: 3.2,
        ...sketchfab("ca7e608b31fe44c8af22942f4f0b32b5", "Rumah Buton Indonesia ( Option 3 )", "mbung"),
      },
      {
        id: "foto-benteng-buton",
        title: "Benteng Keraton Buton",
        description: "Tembok batu kapur Benteng Keraton Buton di Baubau, dibangun bertahap pada abad ke-16 sampai ke-17.",
        height: 1.5,
        ...commons("Sisi luar tembok Benteng Keraton Buton.jpg", "Marwan Mohamad", "CC BY-SA 4.0"),
      },
      {
        id: "foto-masjid-buton",
        title: "Masjid Agung Keraton Buton",
        description: "Masjid tua di dalam kompleks benteng, pusat kehidupan agama Kesultanan Buton.",
        height: 1.5,
        ...commons("Masjid Agung Keraton Buton.jpg", "Marwan Mohamad", "CC BY-SA 4.0"),
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
        title: "Honai",
        description:
          "Rumah bulat beratap jerami tanpa jendela dari Lembah Baliem. Perapian di tengahnya menghangatkan penghuni di udara pegunungan.",
        height: 2.6,
        ...sketchfab("666e96defd3c40fc856fc9c81ccb64ef", "Honai House", "Adbel Hasyir"),
      },
      {
        id: "busana-papua",
        title: "Busana Adat Papua",
        description: "Busana upacara perempuan Papua: hiasan kepala dari bulu burung, kalung, dan rok rumbai dari serat tumbuhan.",
        height: 1.7,
        ...sketchfab("886772a543634b37af9acbc08949bb7d", "Traditional Papuan Costume", "Fadly.W"),
      },
      {
        id: "foto-tifa",
        title: "Tifa",
        description: "Gendang kayu berbentuk tabung panjang dari kawasan Teluk Cenderawasih, dibuat sebelum 1883. Koleksi Tropenmuseum.",
        height: 1.3,
        ...commons("Tifa, Geelvink Bay cultures, Cenderawasih Bay, before 1883.jpg", "Tropenmuseum", "CC BY-SA 4.0"),
      },
      {
        id: "foto-noken",
        title: "Noken",
        description: "Tas rajut dari serat kayu atau anggrek yang dibawa di kepala. Diakui UNESCO pada 2012 sebagai warisan yang perlu segera dilindungi.",
        height: 1.4,
        ...commons("Noken.jpg", "Nurul Ichlasiah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-festival-baliem",
        title: "Festival Lembah Baliem",
        description: "Pembukaan Festival Lembah Baliem 2018, yang menampilkan tradisi perang-perangan antarsuku sebagai pertunjukan.",
        height: 1.5,
        ...commons("Opening Ceremony of Baliem Valley Festival 2018.jpg", "Nurul Ichlasiah", "CC BY-SA 4.0"),
      },
      {
        id: "foto-yospan",
        title: "Tari Yospan",
        description: "Penari Yospan (Yosim Pancar) menari beramai-ramai dengan gerak riang.",
        height: 1.5,
        ...commons("Yosim Pancar (Yospan).jpg", "Rian Tatuwo", "CC BY-SA 4.0"),
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
