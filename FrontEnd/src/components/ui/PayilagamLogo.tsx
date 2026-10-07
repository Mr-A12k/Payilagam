/**
 * @file PayilagamLogo.jsx
 * @description Custom inline SVG logo for Payilagam — an educational platform.
 * Renders a stylized 'P' integrated with an open-book / graduation-cap motif.
 * Uses an blue-600 → blue-500 gradient.  Accepts a `size` prop (default 36).
 */

const PayilagamLogo = ({ size = 36, className = "" }: any) => (
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
      {/* Primary Blue & Midnight Blue gradient */}
      <linearGradient
        id="payilagam-grad"
        x1="0"
        y1="0"
        x2="64"
        y2="64"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>

      {/* Subtle lighter gradient for accent shapes */}
      <linearGradient
        id="payilagam-accent"
        x1="10"
        y1="10"
        x2="54"
        y2="54"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    {/* ── Rounded-square background ─────────────────────────── */}
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="16"
      fill="url(#payilagam-grad)"
    />

    {/* ── Open book motif (two fanned pages) ────────────────── */}
    {/* Left page */}
    <path
      d="M14 46 L14 24 Q14 20 18 19 L30 16 L30 40 L18 43 Q14 44 14 46Z"
      fill="white"
      opacity="0.25"
    />
    {/* Right page */}
    <path
      d="M50 46 L50 24 Q50 20 46 19 L34 16 L34 40 L46 43 Q50 44 50 46Z"
      fill="white"
      opacity="0.25"
    />
    {/* Book spine highlight */}
    <line
      x1="32"
      y1="14"
      x2="32"
      y2="42"
      stroke="white"
      strokeWidth="1.5"
      opacity="0.35"
    />

    {/* ── Stylised letter "P" ───────────────────────────────── */}
    <path
      d="M22 50 L22 22 L34 22 Q42 22 42 29 Q42 36 34 36 L28 36 L28 50 Z"
      fill="white"
      fillRule="evenodd"
    />
    {/* P counter-shape (knockout) */}
    <rect
      x="28"
      y="26.5"
      width="5"
      height="5"
      rx="1.5"
      fill="url(#payilagam-grad)"
    />

    {/* ── Graduation cap accent (top-right) ─────────────────── */}
    <polygon points="42,12 52,17 42,22 32,17" fill="white" opacity="0.9" />
    <line
      x1="42"
      y1="22"
      x2="42"
      y2="28"
      stroke="white"
      strokeWidth="1.5"
      opacity="0.7"
    />
    <circle cx="42" cy="28.5" r="1.5" fill="white" opacity="0.7" />
    {/* Tassel */}
    <line
      x1="52"
      y1="17"
      x2="54"
      y2="24"
      stroke="white"
      strokeWidth="1.2"
      opacity="0.6"
    />
  </svg>
);

export default PayilagamLogo;
