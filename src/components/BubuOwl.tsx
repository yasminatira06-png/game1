import React from 'react';

export type OwlMood = 'happy' | 'celebrate' | 'thinking' | 'oops' | 'reading';

interface BubuOwlProps {
  mood?: OwlMood;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const BubuOwl: React.FC<BubuOwlProps> = ({
  mood = 'happy',
  className = 'w-32 h-32',
  onClick,
  interactive = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none transition-transform duration-300 ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      title={interactive ? 'Klik Bubu!' : 'Bubu si Burung Hantu'}
    >
      <svg
        viewBox="0 0 180 180"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Shadow base under owl */}
        <ellipse cx="90" cy="168" rx="50" ry="8" fill="#000000" opacity="0.1" />

        {/* Telinga / Bulu Jumbai Kiri & Kanan */}
        <path d="M48 46 L30 18 L68 34 Z" fill="#D97706" />
        <path d="M132 46 L150 18 L112 34 Z" fill="#D97706" />
        <path d="M50 42 L38 24 L62 34 Z" fill="#FDE68A" />
        <path d="M130 42 L142 24 L118 34 Z" fill="#FDE68A" />

        {/* Badan Utama */}
        <ellipse cx="90" cy="102" rx="58" ry="62" fill="url(#bodyGrad)" stroke="#D97706" strokeWidth="3" />

        {/* Perut Pastel */}
        <ellipse cx="90" cy="112" rx="42" ry="46" fill="url(#bellyGrad)" />

        {/* Motif Bulu Dada */}
        <path d="M80 94 Q90 100 100 94" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M74 108 Q88 116 102 108" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M82 122 Q91 129 100 122" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />

        {/* Kaki Cakar Lucu */}
        <ellipse cx="72" cy="163" rx="11" ry="6" fill="#EA580C" />
        <ellipse cx="108" cy="163" rx="11" ry="6" fill="#EA580C" />
        <circle cx="67" cy="165" r="4" fill="#EA580C" />
        <circle cx="77" cy="165" r="4" fill="#EA580C" />
        <circle cx="103" cy="165" r="4" fill="#EA580C" />
        <circle cx="113" cy="165" r="4" fill="#EA580C" />

        {/* Sayap Berdasarkan Mood */}
        {mood === 'celebrate' ? (
          <>
            {/* Sayap Kiri terangkat tinggi */}
            <path
              d="M36 94 C12 70 8 45 28 40 C42 36 46 64 48 84 Z"
              fill="url(#wingGrad)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Sayap Kanan terangkat tinggi */}
            <path
              d="M144 94 C168 70 172 45 152 40 C138 36 134 64 132 84 Z"
              fill="url(#wingGrad)"
              stroke="#B45309"
              strokeWidth="2.5"
            />
          </>
        ) : mood === 'reading' ? (
          <>
            {/* Sayap memeluk buku */}
            <path
              d="M34 105 C24 116 36 135 56 128 C58 116 52 105 34 105 Z"
              fill="url(#wingGrad)"
            />
            <path
              d="M146 105 C156 116 144 135 124 128 C122 116 128 105 146 105 Z"
              fill="url(#wingGrad)"
            />
            {/* Buku Cilik Terbuka di depan Bubu */}
            <rect x="66" y="118" width="48" height="34" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
            <line x1="90" y1="118" x2="90" y2="152" stroke="#0284C7" strokeWidth="2" />
            <path d="M72 126 L84 126 M72 132 L84 132 M72 138 L82 138" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M96 126 L108 126 M96 132 L108 132 M96 138 L106 138" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Sayap Rileks di Samping */}
            <ellipse
              cx="32"
              cy="108"
              rx="13"
              ry="30"
              fill="url(#wingGrad)"
              stroke="#B45309"
              strokeWidth="2"
              transform="rotate(12 32 108)"
            />
            <ellipse
              cx="148"
              cy="108"
              rx="13"
              ry="30"
              fill="url(#wingGrad)"
              stroke="#B45309"
              strokeWidth="2"
              transform="rotate(-12 148 108)"
            />
          </>
        )}

        {/* Lingkaran Mata Besar Bersih */}
        <circle cx="66" cy="74" r="23" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="4" />
        <circle cx="114" cy="74" r="23" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="4" />

        {/* Mata Berdasarkan Mood */}
        {mood === 'celebrate' ? (
          <>
            {/* Mata Melengkung Ceria Bahagia */}
            <path d="M54 75 Q66 60 78 75" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M102 75 Q114 60 126 75" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* Bola mata melirik ke atas berpikir */}
            <circle cx="68" cy="68" r="11" fill="#1E293B" />
            <circle cx="116" cy="68" r="11" fill="#1E293B" />
            <circle cx="65" cy="65" r="4" fill="#FFFFFF" />
            <circle cx="113" cy="65" r="4" fill="#FFFFFF" />
            {/* Alis Berpikir */}
            <path d="M53 52 Q65 47 77 54" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M103 54 Q115 47 127 52" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'oops' ? (
          <>
            {/* Mata agak simpati/bingung ramah */}
            <circle cx="66" cy="77" r="10" fill="#1E293B" />
            <circle cx="114" cy="77" r="10" fill="#1E293B" />
            <circle cx="64" cy="74" r="3.5" fill="#FFFFFF" />
            <circle cx="112" cy="74" r="3.5" fill="#FFFFFF" />
            {/* Alis Memelas Menggemaskan */}
            <path d="M53 58 L75 52" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M127 58 L105 52" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Mata Normal / Happy: Berbinar besar */}
            <circle cx="68" cy="74" r="12" fill="#1E293B" />
            <circle cx="112" cy="74" r="12" fill="#1E293B" />
            {/* Kilau Mata Bintang */}
            <circle cx="64" cy="70" r="4.5" fill="#FFFFFF" />
            <circle cx="108" cy="70" r="4.5" fill="#FFFFFF" />
            <circle cx="71" cy="77" r="2.5" fill="#FFFFFF" />
            <circle cx="115" cy="77" r="2.5" fill="#FFFFFF" />
          </>
        )}

        {/* Pipi Merona Merah Muda Lucu */}
        <ellipse cx="48" cy="88" rx="8" ry="5" fill="#F472B6" opacity="0.65" />
        <ellipse cx="132" cy="88" rx="8" ry="5" fill="#F472B6" opacity="0.65" />

        {/* Paruh Oranye Menggemaskan */}
        <polygon points="90,78 79,93 101,93" fill="#EA580C" />
        <polygon points="90,81 83,92 97,92" fill="#F97316" />

        {/* Topi Sarjana Pelajar Pintar (Toga Cilik) */}
        <polygon points="90,14 46,28 90,40 134,28" fill="url(#capGrad)" stroke="#0369A1" strokeWidth="2" />
        <rect x="74" y="32" width="32" height="10" rx="3" fill="#0284C7" />
        {/* Kuncir Kuning Emas */}
        <path d="M90,26 Q115,32 128,42" stroke="#FACC15" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="129" cy="43" r="3.5" fill="#EAB308" />
      </svg>
    </div>
  );
};
