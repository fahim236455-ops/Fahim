import React from 'react';

export interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'full' | 'stacked' | 'wordmark';
  theme?: 'dark' | 'light' | 'auto';
  showText?: boolean;
}

/**
 * Earnora Official Brand Logo Component
 * Pixel-perfect SVG vector recreation matching the official Earnora brand identity:
 * - Royal & cobalt blue 3D curved "E" emblem
 * - Upward dynamic green growth arrow
 * - Coin stack token badge
 * - "Earnora" wordmark with green leaf accent on "E" and vibrant green "o"
 */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 36,
  variant = 'icon',
  theme = 'auto',
  showText = false,
}) => {
  // If variant is full or showText is true, render the emblem + wordmark
  const isFull = variant === 'full' || (variant === 'icon' && showText);
  const isStacked = variant === 'stacked';
  const isWordmark = variant === 'wordmark';

  // The Emblem SVG (E + Green Arrow + Coin Stack Badge)
  const EmblemSVG = ({ emblemSize = size }: { emblemSize?: number }) => (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none drop-shadow-sm transition-transform duration-300"
    >
      <defs>
        {/* Main Blue Gradients */}
        <linearGradient id="earnora_blue_main" x1="20" y1="20" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0052FF" />
          <stop offset="50%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0A2568" />
        </linearGradient>

        <linearGradient id="earnora_blue_top" x1="40" y1="30" x2="190" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0052FF" />
        </linearGradient>

        <linearGradient id="earnora_blue_curve" x1="30" y1="90" x2="120" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#091E52" />
        </linearGradient>

        {/* Green Arrow & Leaf Gradients */}
        <linearGradient id="earnora_green_arrow" x1="50" y1="180" x2="200" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="earnora_green_bright" x1="40" y1="170" x2="190" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Coin Badge Gradients */}
        <linearGradient id="earnora_coin_bg" x1="120" y1="120" x2="210" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <filter id="earnora_soft_shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.18" floodColor="#0A2568" />
        </filter>
      </defs>

      <g filter="url(#earnora_soft_shadow)">
        {/* --- 1. THE 'E' BLUE STRUCTURE --- */}
        {/* Top Arc & Bar of E */}
        <path
          d="M 175 40 
             C 140 40, 75 42, 60 70 
             C 45 98, 48 142, 62 165 
             C 70 178, 85 188, 102 190 
             C 90 185, 78 172, 74 158 
             C 66 130, 68 95, 88 78 
             C 105 64, 138 64, 175 64 
             Z"
          fill="url(#earnora_blue_main)"
        />

        {/* Back Spine & Upper Curve */}
        <path
          d="M 60 70 
             C 100 28, 185 28, 185 45 
             C 185 64, 105 64, 85 78 
             C 68 92, 66 125, 72 152 
             C 52 135, 48 95, 60 70 
             Z"
          fill="url(#earnora_blue_top)"
        />

        {/* Middle Bar of E */}
        <path
          d="M 75 110 
             L 150 110 
             C 156 110, 160 115, 158 122 
             L 155 132 
             C 153 138, 147 142, 140 142 
             L 75 142 
             Z"
          fill="url(#earnora_blue_curve)"
        />

        {/* Bottom Arc & Curve of E */}
        <path
          d="M 72 152 
             C 78 175, 105 195, 145 195 
             C 130 195, 100 190, 85 175 
             C 74 165, 70 152, 72 152 
             Z"
          fill="url(#earnora_blue_main)"
        />

        {/* --- 2. THE DYNAMIC GREEN SWOOSH & GROWTH ARROW --- */}
        {/* Curved Swoosh from bottom left upwards across E */}
        <path
          d="M 45 152 
             C 50 175, 75 188, 105 182 
             C 135 175, 165 145, 185 105 
             L 165 112 
             L 205 68 
             L 198 125 
             L 182 118 
             C 160 155, 130 188, 95 194 
             C 65 200, 42 180, 45 152 
             Z"
          fill="url(#earnora_green_bright)"
        />

        {/* Arrow Tip Accent */}
        <path
          d="M 165 112 
             L 205 68 
             L 198 125 
             L 182 118 
             Z"
          fill="url(#earnora_green_arrow)"
        />

        {/* --- 3. THE CIRCULAR COIN TOKEN BADGE (Bottom Right) --- */}
        <g transform="translate(138, 135)">
          {/* Outer Ring */}
          <circle cx="34" cy="34" r="32" fill="#047857" />
          <circle cx="34" cy="34" r="29" fill="url(#earnora_coin_bg)" />
          <circle cx="34" cy="34" r="26" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.9" />

          {/* 3 Stacked White 3D Coins */}
          {/* Top Coin */}
          <ellipse cx="34" cy="24" rx="14" ry="5.5" fill="#FFFFFF" />
          
          {/* Middle Coin */}
          <path d="M 20 28 C 20 31.5, 48 31.5, 48 28 L 48 33 C 48 36.5, 20 36.5, 20 33 Z" fill="#E2E8F0" />
          <ellipse cx="34" cy="29" rx="14" ry="5" fill="#FFFFFF" />

          {/* Bottom Coin */}
          <path d="M 20 35 C 20 38.5, 48 38.5, 48 35 L 48 40 C 48 43.5, 20 43.5, 20 40 Z" fill="#CBD5E1" />
          <ellipse cx="34" cy="36" rx="14" ry="5" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );

  // The "Earnora" Wordmark Typography SVG
  const WordmarkSVG = ({ textColorClass }: { textColorClass?: string }) => (
    <div className={`flex items-center font-black select-none tracking-tight leading-none ${textColorClass || ''}`}>
      {/* Stylized 'E' with green accent leaf */}
      <span className="relative inline-block text-[1.45em] font-extrabold mr-0.5 tracking-tighter">
        <span className="text-[#0A2568] dark:text-white">E</span>
        <span className="absolute top-[32%] left-[25%] w-[45%] h-[24%] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-tr-md rounded-bl-sm pointer-events-none" />
      </span>
      {/* 'arn' in deep navy */}
      <span className="text-[#0A2568] dark:text-slate-100 text-[1.25em] font-black -ml-0.5">
        arn
      </span>
      {/* 'o' in vivid emerald green */}
      <span className="text-[#059669] dark:text-[#10B981] text-[1.25em] font-black mx-[0.5px]">
        o
      </span>
      {/* 'ra' in deep navy */}
      <span className="text-[#0A2568] dark:text-slate-100 text-[1.25em] font-black">
        ra
      </span>
    </div>
  );

  if (isWordmark) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <WordmarkSVG />
      </div>
    );
  }

  if (isStacked) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 ${className}`}>
        <EmblemSVG emblemSize={size} />
        <WordmarkSVG />
      </div>
    );
  }

  if (isFull) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <EmblemSVG emblemSize={size} />
        <WordmarkSVG />
      </div>
    );
  }

  // Default 'icon' variant
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <EmblemSVG emblemSize={size} />
    </div>
  );
};

