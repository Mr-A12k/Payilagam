import { createIcon } from "./createIcon";

/* ══════════════════════════════════════════════════
   CUSTOM DUOTONE & LAYERED VECTOR ICONS
   Unique, high-depth alternative to standard wireframes
   ══════════════════════════════════════════════════ */

/**
 * Modern Cockpit / Command Gauge Dashboard
 * Features a circular telemetry dial, needle pointer, and telemetry nodes.
 */
export const IconDashboard = createIcon("IconDashboard", () => (
  <>
    {/* Volumetric dial arc */}
    <path
      d="M3.5 16.5A9.5 9.5 0 1 1 20.5 16.5"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
    <path
      d="M12 12l4-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="6.5" cy="15.5" r="1" fill="currentColor" />
    <circle cx="17.5" cy="15.5" r="1" fill="currentColor" />
    <path
      d="M12 4.5v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M5.5 8.5l1.5 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18.5 8.5l-1.5 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </>
));

/**
 * 3D Dimensional Academy / Mortarboard Graduation Cap
 * Features a faceted diamond top with volumetric shadow and hanging golden tassel.
 */
export const IconMentor = createIcon("IconMentor", () => (
  <>
    {/* Diamond top plate with depth fill */}
    <polygon
      points="12 3 22 8 12 13 2 8 12 3"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Undercap arch with volumetric fill */}
    <path
      d="M6 10.5v5c0 3 2.7 5.5 6 5.5s6-2.5 6-5.5v-5"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Hanging side tassel */}
    <path
      d="M20 9v7.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="20" cy="18" r="1.5" fill="currentColor" />
    <circle cx="12" cy="8" r="1.2" fill="currentColor" />
  </>
));

/**
 * Isometric Open Curriculum Book / Course Codex
 * Features multi-leaf page layers, volumetric spine, and bookmark ribbon.
 */
export const IconCourse = createIcon("IconCourse", () => (
  <>
    {/* Left Page Layer */}
    <path
      d="M3 5.5C4.5 4.5 7.5 4 11.5 5.5v13.5c-4-1.2-7-.8-8.5.5V5.5z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Right Page Layer */}
    <path
      d="M21 5.5c-1.5-1-4.5-1.5-8.5 0v13.5c4-1.2 7-.8 8.5.5V5.5z"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Central Bookmark ribbon */}
    <path d="M11.5 5.5v8l1.5-1 1.5 1V5.5" fill="currentColor" opacity="0.8" />
    <line
      x1="5.5"
      y1="9"
      x2="9.5"
      y2="9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="5.5"
      y1="12"
      x2="8.5"
      y2="12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="14.5"
      y1="9"
      x2="18.5"
      y2="9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </>
));

/**
 * Developer IDE Editor & Ribbon (VS Code / Coding Arena style)
 * Features window header dots, code indentation blocks, and glowing slash tag.
 */
export const IconCode = createIcon("IconCode", () => (
  <>
    {/* IDE Window Frame with fill */}
    <rect
      x="2.5"
      y="3.5"
      width="19"
      height="17"
      rx="3"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Top titlebar */}
    <line
      x1="2.5"
      y1="8"
      x2="21.5"
      y2="8"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="5.5" cy="5.8" r=".9" fill="currentColor" />
    <circle cx="8" cy="5.8" r=".9" fill="currentColor" />
    {/* Code tags */}
    <path
      d="M8 12l-2.5 2.5L8 17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 12l2.5 2.5L16 17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 11l-3 7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
));

/**
 * Cyber Terminal / Command Shell
 * Features a glowing command prompt, block cursor, and command execution dots.
 */
export const IconTerminal = createIcon("IconTerminal", () => (
  <>
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="3"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <polyline
      points="6 9 9.5 12 6 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="12" y="14" width="6" height="2" rx="1" fill="currentColor" />
    <circle cx="18" cy="8" r="1" fill="currentColor" opacity="0.6" />
  </>
));

/**
 * Chemical Conical Flask (Interactive Science Lab)
 * Features graduated measurement markings, bubbling liquid core, and vapor.
 */
export const IconLab = createIcon("IconLab", () => (
  <>
    {/* Beaker body with reactive liquid fill */}
    <path
      d="M9 2h6v5.2l5.4 11A2 2 0 0 1 18.6 21H5.4a2 2 0 0 1-1.8-2.8L9 7.2V2z"
      fill="currentColor"
      fillOpacity="0.18"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Fluid meniscus line */}
    <path
      d="M6.8 15c2.4-1.2 4.6 1 7.2-.2 1.4-.7 2.2-.4 3.2.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Reactive bubbles */}
    <circle cx="10" cy="18" r="1.2" fill="currentColor" />
    <circle cx="14" cy="17.2" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12.5" r=".9" fill="currentColor" />
    {/* Top lip */}
    <line
      x1="8"
      y1="2"
      x2="16"
      y2="2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>
));

/**
 * Multi-Tiered Isometric Cylinder Database Array
 * Matches the blue database icon in the user's screenshot.
 */
export const IconDatabase = createIcon("IconDatabase", () => (
  <>
    {/* Top Ellipse Cap */}
    <ellipse
      cx="12"
      cy="5.5"
      rx="8.5"
      ry="3"
      fill="currentColor"
      fillOpacity="0.24"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Mid Tier */}
    <path
      d="M3.5 5.5v6c0 1.66 3.8 3 8.5 3s8.5-1.34 8.5-3v-6"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Bottom Tier */}
    <path
      d="M3.5 11.5v6c0 1.66 3.8 3 8.5 3s8.5-1.34 8.5-3v-6"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Status indicator LEDs */}
    <circle cx="6.5" cy="11.5" r=".9" fill="currentColor" />
    <circle cx="6.5" cy="17.5" r=".9" fill="currentColor" />
  </>
));

/**
 * 3D Isometric Infrastructure Container / Server Box
 * Matches the blue isometric server cube in the user's screenshot.
 */
export const IconContainer = createIcon("IconContainer", () => (
  <>
    {/* Top Diamond Face */}
    <polygon
      points="12 2.5 20.5 7.5 12 12.5 3.5 7.5 12 2.5"
      fill="currentColor"
      fillOpacity="0.26"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Left Face */}
    <polygon
      points="3.5 7.5 12 12.5 12 21.5 3.5 16.5 3.5 7.5"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Right Face */}
    <polygon
      points="12 12.5 20.5 7.5 20.5 16.5 12 21.5 12 12.5"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Central Seam */}
    <line
      x1="12"
      y1="12.5"
      x2="12"
      y2="21.5"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </>
));

/**
 * React Atomic Orbitals / Web Dev Lab
 * Matches the cyan atom in the user's screenshot.
 */
export const IconReactAtom = createIcon("IconReactAtom", () => (
  <>
    {/* Nucleus core */}
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    {/* Diagonal Orbit 1 */}
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="4"
      transform="rotate(30 12 12)"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Diagonal Orbit 2 */}
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="4"
      transform="rotate(90 12 12)"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Diagonal Orbit 3 */}
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="4"
      transform="rotate(150 12 12)"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </>
));

/**
 * Silicon CPU Microchip with Gold Leads & Die Core
 */
export const IconCpu = createIcon("IconCpu", () => (
  <>
    <rect
      x="4.5"
      y="4.5"
      width="15"
      height="15"
      rx="2.5"
      fill="currentColor"
      fillOpacity="0.18"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Internal silicon core */}
    <rect
      x="8.5"
      y="8.5"
      width="7"
      height="7"
      rx="1.5"
      fill="currentColor"
      opacity="0.3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    {/* 8 perimeter pins */}
    <line
      x1="8.5"
      y1="1.5"
      x2="8.5"
      y2="4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="15.5"
      y1="1.5"
      x2="15.5"
      y2="4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="8.5"
      y1="19.5"
      x2="8.5"
      y2="22.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="15.5"
      y1="19.5"
      x2="15.5"
      y2="22.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="1.5"
      y1="8.5"
      x2="4.5"
      y2="8.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="1.5"
      y1="15.5"
      x2="4.5"
      y2="15.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="19.5"
      y1="8.5"
      x2="22.5"
      y2="8.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="19.5"
      y1="15.5"
      x2="22.5"
      y2="15.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
));

/**
 * 3D Volumetric Analytics & Telemetry Chart
 * Features stepped shaded columns and an ascending zigzag trend line.
 */
export const IconAnalytics = createIcon("IconAnalytics", () => (
  <>
    {/* Column 1 */}
    <rect
      x="3.5"
      y="13"
      width="4"
      height="7.5"
      rx="1.2"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Column 2 */}
    <rect
      x="10"
      y="8"
      width="4"
      height="12.5"
      rx="1.2"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Column 3 */}
    <rect
      x="16.5"
      y="4.5"
      width="4"
      height="16"
      rx="1.2"
      fill="currentColor"
      fillOpacity="0.32"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Ascending trend line with nodes */}
    <polyline
      points="2.5 11 8.5 7 14 10 21.5 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="21.5" cy="3" r="1.5" fill="currentColor" />
  </>
));

/**
 * Multi-User Interlocking Shield Avatars
 */
export const IconUsers = createIcon("IconUsers", () => (
  <>
    {/* Primary foreground user */}
    <path
      d="M14 20.5v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle
      cx="7.5"
      cy="7.5"
      r="3.5"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Secondary background user with offset depth */}
    <path
      d="M22 20.5v-2a4 4 0 0 0-3-3.87"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
));

/**
 * Industrial Mechanical Cog Turbine (Settings)
 * 8-point radial gear with internal hexagonal keyhole.
 */
export const IconSettings = createIcon("IconSettings", () => (
  <>
    {/* Central core wheel */}
    <circle
      cx="12"
      cy="12"
      r="3.5"
      fill="currentColor"
      fillOpacity="0.3"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Radial turbine perimeter with depth */}
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.7"
    />
  </>
));

/**
 * Dogear Script Folio (Document)
 * Features an embossed folded flap and code/text grooves.
 */
export const IconDocument = createIcon("IconDocument", () => (
  <>
    <path
      d="M14 2H5.5A2.5 2.5 0 0 0 3 4.5v15A2.5 2.5 0 0 0 5.5 22h13a2.5 2.5 0 0 0 2.5-2.5V8.5L14 2z"
      fill="currentColor"
      fillOpacity="0.18"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <polygon
      points="14 2 14 8.5 20.5 8.5"
      fill="currentColor"
      opacity="0.4"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <line
      x1="7"
      y1="13"
      x2="16.5"
      y2="13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="7"
      y1="17"
      x2="14"
      y2="17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="8" cy="9.5" r=".9" fill="currentColor" />
  </>
));

/**
 * Overlapping Conversation Bubbles (Chat)
 */
export const IconChat = createIcon("IconChat", () => (
  <>
    {/* Secondary background bubble */}
    <path
      d="M17 3.5H7a5 5 0 0 0-5 5c0 2 .9 3.8 2.4 4.7L3.5 17l4-1.2h4.5a5 5 0 0 0 5-5v-7.3z"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Primary foreground bubble */}
    <path
      d="M21 9.5h-9a5 5 0 0 0-5 5c0 1.9.9 3.6 2.3 4.6L8.5 22.5l3.8-1.1h8.7a5 5 0 0 0 5-5v-1.9a5 5 0 0 0-5-5z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="15" r=".9" fill="currentColor" />
    <circle cx="15.5" cy="15" r=".9" fill="currentColor" />
    <circle cx="19" cy="15" r=".9" fill="currentColor" />
  </>
));

/**
 * Acoustic Bell with Radiating Halo Ring (Notifications)
 */
export const IconBell = createIcon("IconBell", () => (
  <>
    {/* Bell dome with volumetric fill */}
    <path
      d="M18 8.5A6 6 0 0 0 6 8.5c0 7-3 8.5-3 8.5h18s-3-1.5-3-8.5"
      fill="currentColor"
      fillOpacity="0.18"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Radiating notification wave alert */}
    <circle cx="18.5" cy="4.5" r="2.5" fill="currentColor" />
  </>
));

/**
 * Precision Magnifying Lens with Crosshair (Search)
 */
export const IconSearch = createIcon("IconSearch", () => (
  <>
    <circle
      cx="10.5"
      cy="10.5"
      r="7.5"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Diagonal handle with grip node */}
    <line
      x1="21.5"
      y1="21.5"
      x2="16"
      y2="16"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Reflective light arc */}
    <path
      d="M7 10.5a3.5 3.5 0 0 1 3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </>
));

/**
 * Multi-Point Radiant AI Sparkle Starburst
 */
export const IconSparkles = createIcon("IconSparkles", () => (
  <>
    {/* Major diamond starburst with fill */}
    <path
      d="M12 1.5l2.6 6.9 6.9 2.6-6.9 2.6L12 20.5l-2.6-6.9L2.5 11l6.9-2.6L12 1.5z"
      fill="currentColor"
      fillOpacity="0.24"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Satellite sparkle */}
    <path
      d="M19 15.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="5" cy="6" r="1" fill="currentColor" />
  </>
));

/**
 * Triple-Tongue Learning Streak Fire Flame
 */
export const IconFlame = createIcon("IconFlame", () => (
  <>
    {/* Outer flame boundary with depth */}
    <path
      d="M12 2.5c-.8 2.5-3 5-4.5 7.5A7.5 7.5 0 0 0 12 22a7.5 7.5 0 0 0 7.5-7.5c0-4-3-6-4-8.5-1.2 2-2 3.5-3.5 3.5-1.5 0-1.5-1.5-1.5-3.5 0-1.5 1.5-2.5 1.5-3.5z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Inner combustion teardrop */}
    <path
      d="M12 14c-1.5 0-2.5 1.2-2.5 2.7a2.5 2.5 0 0 0 5 0c0-1.5-1-2.7-2.5-2.7z"
      fill="currentColor"
    />
  </>
));

/**
 * Reinforced Security Shield Crest
 */
export const IconShield = createIcon("IconShield", () => (
  <>
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <path
      d="M7 9l5 4 5-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
));

/**
 * Hardened Vault Padlock
 */
export const IconLock = createIcon("IconLock", () => (
  <>
    <rect
      x="3.5"
      y="10.5"
      width="17"
      height="11"
      rx="2.5"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M7 10.5V7a5 5 0 0 1 10 0v3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
    <line
      x1="12"
      y1="17"
      x2="12"
      y2="19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
));

/**
 * Cloud Infrastructure Node
 */
export const IconCloud = createIcon("IconCloud", () => (
  <>
    <path
      d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <line
      x1="9"
      y1="15"
      x2="15"
      y2="15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
  </>
));

/**
 * Volumetric Play Trigger Shield
 */
export const IconPlay = createIcon("IconPlay", () => (
  <polygon
    points="6 4 20 12 6 20 6 4"
    fill="currentColor"
    fillOpacity="0.24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  />
));

/* ── Standard Action Vectors (Duotone styled) ── */

export const IconCheck = createIcon("IconCheck", () => (
  <polyline
    points="20 6 9 17 4 12"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const IconCheckCircle = createIcon("IconCheckCircle", () => (
  <>
    <circle
      cx="12"
      cy="12"
      r="9.5"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <polyline
      points="16 9 10.5 14.5 8 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
));

export const IconClose = createIcon("IconClose", () => (
  <>
    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </>
));

export const IconArrowRight = createIcon("IconArrowRight", () => (
  <>
    <line
      x1="4"
      y1="12"
      x2="19"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline
      points="12 5 19 12 12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
));

export const IconArrowUpRight = createIcon("IconArrowUpRight", () => (
  <>
    <line
      x1="6"
      y1="18"
      x2="18"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline
      points="8 6 18 6 18 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
));

export const IconChevronDown = createIcon("IconChevronDown", () => (
  <polyline
    points="5 9 12 16 19 9"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const IconChevronRight = createIcon("IconChevronRight", () => (
  <polyline
    points="9 19 16 12 9 5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const IconChevronLeft = createIcon("IconChevronLeft", () => (
  <polyline
    points="15 19 8 12 15 5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const IconUpload = createIcon("IconUpload", () => (
  <>
    <path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <polyline
      points="17 8 12 3 7 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="3"
      x2="12"
      y2="15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>
));

export const IconDownload = createIcon("IconDownload", () => (
  <>
    <path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <polyline
      points="7 10 12 15 17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="15"
      x2="12"
      y2="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>
));

export const IconTrash = createIcon("IconTrash", () => (
  <>
    <polyline
      points="3 6 5 6 21 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <line
      x1="10"
      y1="11"
      x2="10"
      y2="17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="11"
      x2="14"
      y2="17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
));

export const IconPalette = createIcon("IconPalette", () => (
  <>
    <path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.67-.75 1.67-1.67 0-.44-.18-.84-.46-1.14-.27-.3-.44-.7-.44-1.19 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9.67-10-9.67z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="13.5" cy="6.5" r="1" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
  </>
));

export const IconSun = createIcon("IconSun", () => (
  <>
    <circle
      cx="12"
      cy="12"
      r="5"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <line
      x1="12"
      y1="1"
      x2="12"
      y2="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="21"
      x2="12"
      y2="23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="4.22"
      y1="4.22"
      x2="5.64"
      y2="5.64"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18.36"
      y1="18.36"
      x2="19.78"
      y2="19.78"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="1"
      y1="12"
      x2="3"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="21"
      y1="12"
      x2="23"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="4.22"
      y1="19.78"
      x2="5.64"
      y2="18.36"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18.36"
      y1="5.64"
      x2="19.78"
      y2="4.22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>
));

export const IconMoon = createIcon("IconMoon", () => (
  <path
    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    fill="currentColor"
    fillOpacity="0.24"
    stroke="currentColor"
    strokeWidth="1.8"
  />
));
