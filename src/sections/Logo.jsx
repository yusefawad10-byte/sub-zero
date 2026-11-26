export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <text x="32" y="41" textAnchor="middle" fontFamily="'Archivo Black', Arial Black, sans-serif" fontSize="24" fill="currentColor">
        SZ
      </text>
    </svg>
  );
}
