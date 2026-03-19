/** Small brand glyph (abstract index disk, not official Pokémon artwork). */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width={32}
      height={32}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="16" cy="16" r="14.5" className="fill-[var(--mark-lower)]" stroke="var(--mark-ring)" strokeWidth="1" />
      <path
        d="M16 1.5c7.98 0 14.5 6.52 14.5 14.5H1.5C1.5 8.02 8.02 1.5 16 1.5Z"
        className="fill-[var(--mark-upper)]"
      />
      <line x1="1.5" y1="16" x2="30.5" y2="16" stroke="var(--mark-ring)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4.25" className="fill-[var(--mark-center)]" stroke="var(--mark-ring)" strokeWidth="1.25" />
    </svg>
  )
}
