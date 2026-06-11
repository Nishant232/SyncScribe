interface LogoProps {
  className?: string
  gradientId?: string
}

export default function Logo({ className, gradientId = 'logo-gradient' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-label="SyncScribe">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <path
        d="M21 11C21 11 19.5 9 16.5 9C13.5 9 11 11 11 13C11 15 13 16.5 16 16.5C19 16.5 21 18 21 20C21 22 18.5 23.5 16 23.5C13.5 23.5 11 22 11 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21" cy="20" r="1.5" fill="#22D3EE" />
    </svg>
  )
}
