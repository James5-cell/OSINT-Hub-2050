import React from 'react';

type SiteLogoProps = {
  variant?: 'full' | 'icon' | 'hero';
  className?: string;
};

export default function SiteLogo({ variant = 'full', className = '' }: SiteLogoProps) {
  const iconSize = variant === 'hero' ? 40 : 20;

  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={iconSize}
      height={iconSize}
      className="shrink-0"
    >
      {/* Outer gauge arc (~292 deg sweep, rounded end caps) */}
      <path
        d="M 27.5 12.5 A 12 12 0 1 1 17.1 3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Target orange node */}
      <circle cx="21.4" cy="10.3" r="2.3" fill="#f97316" />
      {/* Tapered gauge / radar needle pointing to orange node */}
      <path
        d="M 12.6 17.5 L 20.8 10.2 A 0.45 0.45 0 0 1 21.4 10.8 L 14.4 19.4 A 1.3 1.3 0 0 1 12.6 17.5 Z"
        fill="currentColor"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <span className={`inline-flex items-center justify-center ${className}`}>{icon}</span>;
  }

  const textSize = variant === 'hero' ? 'text-3xl' : 'text-sm';
  const gapSize = variant === 'hero' ? 'gap-4' : 'gap-2.5';

  return (
    <div className={`flex items-center ${gapSize} ${className}`}>
      {icon}
      <span
        className={`${textSize} font-semibold tracking-tight`}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span className="text-current">OSINT</span>
        <span className="text-zinc-500 dark:text-zinc-400"> Hub</span>
      </span>
    </div>
  );
}
