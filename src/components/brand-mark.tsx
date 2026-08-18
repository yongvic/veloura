export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <div
      className="brand-mark-wrapper"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="brand-mark-svg"
      >
        <defs>
          <linearGradient id="bmBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary, #4a152d)" />
            <stop offset="60%" stopColor="var(--primary-dark, #2b0b1a)" />
            <stop offset="100%" stopColor="#15030d" />
          </linearGradient>
          <linearGradient id="bmGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdf3d8" />
            <stop offset="35%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#aa7c11" />
            <stop offset="100%" stopColor="#e8c868" />
          </linearGradient>
          <linearGradient id="bmRose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd1dc" />
            <stop offset="100%" stopColor="#9d3b5a" />
          </linearGradient>
        </defs>

        {/* Outer jewel container */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="26"
          fill="url(#bmBg)"
          stroke="url(#bmGold)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Inner subtle frame */}
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="21"
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="0.8"
        />

        {/* Gem Facet Glow */}
        <polygon
          points="50,22 68,42 50,75 32,42"
          fill="url(#bmRose)"
          fillOpacity="0.22"
        />

        {/* Luxury Monogram "V" */}
        <path
          d="M 32 28 Q 37 28 41 38 L 50 63 L 59 38 Q 63 28 68 28"
          fill="none"
          stroke="url(#bmGold)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner high-light stroke */}
        <path
          d="M 33 29 Q 37.5 29 41.5 39 L 50 61 L 58.5 39 Q 62.5 29 67 29"
          fill="none"
          stroke="#fffaf0"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
        />

        {/* Top spark star */}
        <circle cx="50" cy="22" r="2" fill="url(#bmGold)" />
      </svg>
    </div>
  );
}
