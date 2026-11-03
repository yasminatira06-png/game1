import { LevelData } from '../types';

export const GAME_LEVELS: LevelData[] = [
  {
    id: 1,
    title: 'Level 1: Mudah',
    subtitle: 'Kalimat Pendek & Aktivitas Dasar',
    wordCountDesc: '3 – 4 Kata',
    themeColor: {
      gradient: 'from-amber-100 via-amber-200 to-yellow-300',
      border: 'border-amber-300',
      shadow: '#d97706',
      bgAccent: 'bg-amber-100/80',
      badge: 'bg-amber-400 text-amber-950',
      icon: '🌱',
    },
    questions: [
      {
        id: 1,
        correctWords: ['Adik', 'makan', 'nasi'],
        scrambledWords: ['nasi', 'Adik', 'makan'],
        meaningOrHint: 'Siapa yang sedang menyantap sarapan?',
      },
      {
        id: 2,
        correctWords: ['Ibu', 'memasak', 'sayur'],
        scrambledWords: ['sayur', 'memasak', 'Ibu'],
        meaningOrHint: 'Apa kegiatan yang dilakukan Ibu di dapur?',
      },
      {
        id: 3,
        correctWords: ['Budi', 'membaca', 'buku'],
        scrambledWords: ['buku', 'Budi', 'membaca'],
        meaningOrHint: 'Budi anak pintar yang suka menambah ilmu.',
      },
      {
        id: 4,
        correctWords: ['Kucing', 'tidur', 'pulas'],
        scrambledWords: ['tidur', 'pulas', 'Kucing'],
        meaningOrHint: 'Hewan lucu sedang beristirahat lelap di teras.',
      },
      {
        id: 5,
        correctWords: ['Ayah', 'pergi', 'ke', 'kantor'],
        scrambledWords: ['kantor', 'Ayah', 'ke', 'pergi'],
        meaningOrHint: 'Ayah bersiap berangkat untuk bekerja pagi ini.',
      },
    ],
  },
  {
    id: 2,
    title: 'Level 2: Sedang',
    subtitle: 'Kalimat Kegiatan & Keterangan Tempat',
    wordCountDesc: '4 – 5 Kata',
    themeColor: {
      gradient: 'from-sky-100 via-cyan-100 to-sky-300',
      border: 'border-sky-300',
      shadow: '#0284c7',
      bgAccent: 'bg-sky-100/80',
      badge: 'bg-sky-400 text-sky-950',
      icon: '🌿',
    },
    questions: [
      {
        id: 1,
        correctWords: ['Kakak', 'menyiram', 'bunga', 'mawar'],
        scrambledWords: ['bunga', 'Kakak', 'mawar', 'menyiram'],
        meaningOrHint: 'Merawat tanaman hias di kebun depan rumah.',
      },
      {
        id: 2,
        correctWords: ['Kami', 'bermain', 'bola', 'di', 'lapangan'],
        scrambledWords: ['lapangan', 'di', 'bola', 'Kami', 'bermain'],
        meaningOrHint: 'Aktivitas seru bersama teman-teman saat sore hari.',
      },
      {
        id: 3,
        correctWords: ['Siti', 'membeli', 'buku', 'gambar', 'baru'],
        scrambledWords: ['baru', 'gambar', 'membeli', 'Siti', 'buku'],
        meaningOrHint: 'Alat tulis untuk menggambar pemandangan indah.',
      },
      {
        id: 4,
        correctWords: ['Burung', 'terbang', 'tinggi', 'di', 'langit'],
        scrambledWords: ['langit', 'terbang', 'di', 'Burung', 'tinggi'],
        meaningOrHint: 'Melihat sayap mengepak bebas di angkasa biru.',
      },
      {
        id: 5,
        correctWords: ['Dono', 'rajin', 'mencuci', 'tangan', 'bersih'],
        scrambledWords: ['bersih', 'Dono', 'tangan', 'rajin', 'mencuci'],
        meaningOrHint: 'Kebiasaan baik menjaga kebersihan sebelum makan.',
      },
    ],
  },
  {
    id: 3,
    title: 'Level 3: Sulit',
    subtitle: 'Kalimat Majemuk & Nilai Budi Pekerti',
    wordCountDesc: '5 – 7 Kata',
    themeColor: {
      gradient: 'from-emerald-100 via-teal-100 to-emerald-300',
      border: 'border-emerald-300',
      shadow: '#059669',
      bgAccent: 'bg-emerald-100/80',
      badge: 'bg-emerald-400 text-emerald-950',
      icon: '🌳',
    },
    questions: [
      {
        id: 1,
        correctWords: ['Siswa', 'rajin', 'selalu', 'membaca', 'buku', 'di', 'perpustakaan'],
        scrambledWords: ['buku', 'perpustakaan', 'rajin', 'membaca', 'Siswa', 'di', 'selalu'],
        meaningOrHint: 'Ruangan tenang penuh jendela ilmu pengetahuan.',
      },
      {
        id: 2,
        correctWords: ['Kakek', 'berolahraga', 'jalan', 'sehat', 'di', 'taman', 'kota'],
        scrambledWords: ['kota', 'sehat', 'jalan', 'Kakek', 'taman', 'di', 'berolahraga'],
        meaningOrHint: 'Menjaga kebugaran tubuh setiap pagi hari yang segar.',
      },
      {
        id: 3,
        correctWords: ['Ibu', 'guru', 'mengajarkan', 'sopan', 'santun', 'kepada', 'murid'],
        scrambledWords: ['sopan', 'guru', 'kepada', 'murid', 'santun', 'mengajarkan', 'Ibu'],
        meaningOrHint: 'Adab dan tata krama yang sangat terpuji.',
      },
      {
        id: 4,
        correctWords: ['Matahari', 'pagi', 'bersinar', 'sangat', 'cerah', 'dan', 'hangat'],
        scrambledWords: ['cerah', 'bersinar', 'hangat', 'Matahari', 'dan', 'sangat', 'pagi'],
        meaningOrHint: 'Suasana fajar yang memberi energi semangat baru.',
      },
      {
        id: 5,
        correctWords: ['Anak', 'yang', 'jujur', 'selalu', 'disayangi', 'oleh', 'teman'],
        scrambledWords: ['jujur', 'disayangi', 'teman', 'oleh', 'Anak', 'selalu', 'yang'],
        meaningOrHint: 'Sikap mulia yang membuat banyak orang percaya dan senang berteman.',
      },
    ],
  },
];
