import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <rect width="200" height="200" rx="48" fill="url(#paint0_linear)" />
        
        {/* The 'E' shape */}
        <path
          d="M135 60H65C59.4772 60 55 64.4772 55 70V130C55 135.523 59.4772 140 65 140H135C140.523 140 145 135.523 145 130V115C145 109.477 140.523 105 135 105H85V95H125C130.523 95 135 90.5228 135 85V70C135 64.4772 130.523 60 125 60H135Z"
          fill="white"
        />
        <path d="M55 70C55 64.4772 59.4772 60 65 60H135V80H85V95H125V115H85V120H135V140H65C59.4772 140 55 135.523 55 130V70Z" fill="white" />
        
        {/* A coin / spark element representing 'Earn' */}
        <circle cx="140" cy="140" r="24" fill="#FBBF24" stroke="#0F172A" strokeWidth="8" />
        <path d="M140 128V152M130 140H150" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />

        <defs>
          <linearGradient
            id="paint0_linear"
            x1="0"
            y1="0"
            x2="200"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#06B6D4" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
