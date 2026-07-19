// Shared brand mark used by the generated icon/OG image routes. Mirrors the
// diamond glyph in public/favicon.svg so generated icons match it visually.
export function DiamondMark({ size }: { size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        background: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 40 40">
        <defs>
          <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8942e" />
            <stop offset="50%" stopColor="#e8d9a8" />
            <stop offset="100%" stopColor="#b8942e" />
          </linearGradient>
        </defs>
        <path d="M20 4L8 16L20 36L32 16L20 4Z" stroke="url(#diamondGradient)" strokeWidth="2" fill="none" />
        <path d="M8 16H32" stroke="url(#diamondGradient)" strokeWidth="2" />
        <path d="M20 4L14 16L20 36L26 16L20 4Z" stroke="#b8942e" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}
