/**
 * @file KarkalamLogo.tsx
 * @description Custom inline SVG logo for Karkalam (கற்களம்) — Arena of Code & Learning.
 * Renders a stylized geometric 'K' integrated with code accents and graduation cap.
 * Uses a vibrant cyan-500 → blue-600 gradient. Accepts a `size` prop (default 36).
 */

const KarkalamLogo = ({ size = 36, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    role="img"
  >
    <defs>
      {/* Primary vibrant gradient */}
      <linearGradient
        id="karkalam-grad"
        x1="0"
        y1="0"
        x2="64"
        y2="64"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
        <stop offset="50%" stopColor="#3b82f6" /> {/* blue-500 */}
        <stop offset="100%" stopColor="#1d4ed8" /> {/* blue-700 */}
      </linearGradient>

      {/* Subtle accent gradient */}
      <linearGradient
        id="karkalam-accent"
        x1="10"
        y1="10"
        x2="54"
        y2="54"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
        <stop offset="100%" stopColor="#2563eb" /> {/* blue-600 */}
      </linearGradient>
    </defs>

    {/* Rounded badge container */}
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="16"
      fill="url(#karkalam-grad)"
    />

    {/* Code bracket left accent */}
    <path
      d="M16 26 L10 32 L16 38"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.45"
    />

    {/* Code bracket right accent */}
    <path
      d="M48 26 L54 32 L48 38"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.45"
    />

    {/* Stylized Modern Letter 'K' */}
    {/* Vertical stem */}
    <rect
      x="22"
      y="18"
      width="5.5"
      height="28"
      rx="2"
      fill="white"
    />

    {/* Upper diagonal arm */}
    <path
      d="M26 31.5 L37.5 19.5 Q39.5 17.5 41.5 19.5 L42.5 20.5 Q44.5 22.5 42.5 24.5 L31.5 35.5 Z"
      fill="white"
    />

    {/* Lower diagonal arm */}
    <path
      d="M29.5 32.5 L41.5 44.5 Q43.5 46.5 41.5 48.5 L40.5 49.5 Q38.5 51.5 36.5 49.5 L25.5 38.5 Z"
      fill="white"
    />

    {/* Graduation Cap accent on top */}
    <polygon points="32,9 43,14 32,19 21,14" fill="white" opacity="0.92" />
    <line
      x1="32"
      y1="19"
      x2="32"
      y2="22"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

export default KarkalamLogo;
