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
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="65 17"
        strokeLinecap="round"
        transform="rotate(-15 16 16)"
      />
      <circle cx="16" cy="16" r="2.5" fill="#f97316" />
      <line x1="16" y1="16" x2="21" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="16" x2="11" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="16" x2="21.6" y2="20.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
