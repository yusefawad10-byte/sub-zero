import { brand, intro, staticHero } from '../content';

// Shown when there is no WebGL or the visitor prefers reduced motion.
export default function StaticHero() {
  return (
    <section id="walk" className="hero-static">
      <svg className="hero-static-art" viewBox="0 0 800 360" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#05080d" />
            <stop offset="1" stopColor="#1c2430" />
          </linearGradient>
        </defs>
        <rect width="800" height="360" fill="url(#sky)" />
        {[60, 120, 210, 300, 560, 640, 700].map((x, i) => (
          <rect key={x} x={x} y={150 - (i % 3) * 30} width="40" height={210} fill="#0b0f15" />
        ))}
        <rect x="470" y="40" width="10" height="200" fill="#0d121a" />
        <circle cx="475" cy="36" r="3" fill="#ff3b2a" />
        <circle cx="120" cy="60" r="14" fill="#f3ebdd" opacity="0.9" />
        <rect x="0" y="300" width="800" height="60" fill="#101418" />
        <rect x="180" y="170" width="360" height="130" rx="6" fill="#0e1011" />
        <rect x="540" y="200" width="110" height="100" rx="18" fill="#0e1011" />
        <polygon points="180,170 540,170 560,135 160,135" fill="#c98d5e" />
        <rect x="200" y="190" width="150" height="100" fill="#d8995f" opacity="0.85" />
        <rect x="370" y="250" width="60" height="30" rx="4" fill="#6FD3FF" opacity="0.85" />
        <rect x="440" y="250" width="60" height="30" rx="4" fill="#6FD3FF" opacity="0.85" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={170 + i * 55} cy={128 + (i % 2) * 6} r="4" fill="#ffcf8a" />
        ))}
        <circle cx="250" cy="300" r="22" fill="#0b0b0b" />
        <circle cx="600" cy="300" r="22" fill="#0b0b0b" />
      </svg>
      <div className="intro-card static">
        <p className="eyebrow">{brand.eyebrow}</p>
        <h1>{brand.name}</h1>
        <p className="intro-line">{brand.line}</p>
        <div className="intro-actions">
          <a className="btn" href="#book">
            {intro.book}
          </a>
          <a className="btn btn-ghost" href="#prices">
            Prices
          </a>
        </div>
        <p className="intro-tag">{staticHero.note}</p>
      </div>
    </section>
  );
}
