/**
 * @file Navbar.jsx
 * @description Premium sticky navigation bar for Payilagam — an educational platform.
 *
 * Desktop (md+):  Full-width sticky header · glass background · PayilagamLogo left ·
 *                 centred nav links (with hover dropdowns) · user actions right.
 * Mobile  (<md):  Logo + animated hamburger → full-screen slide-in drawer with
 *                 accordion dropdown sections, stacked links, and auth CTAs.
 *
 * Keeps the existing Redux auth logic (user avatar when logged-in, Login/Sign Up
 * when logged-out).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import PayilagamLogo from "@/components/ui/PayilagamLogo";
import NotificationPopover from "./NotificationPopover";
import { useSelector } from "react-redux";

/* ═══════════════════════════════════════════════════════════
   Navigation data
   ═══════════════════════════════════════════════════════════ */
const coursesDropdown = [
  { label: "All Courses", to: "/courses" },
  { label: "Web Development", to: "/courses?category=web" },
  { label: "Data Science & AI", to: "/courses?category=data" },
  { label: "Cloud Computing", to: "/courses?category=cloud" },
  { divider: true },
  { label: "My Learning", to: "/learning" },
];

const enterpriseDropdown = [
  { label: "For Business", to: "/enterprise" },
  { label: "For Universities", to: "/enterprise/universities" },
  { label: "For Government", to: "/enterprise/government" },
];

const navLinks = [
  { label: "Courses", to: "/courses", dropdown: coursesDropdown },
  { label: "Resources", to: "/resources" },
  { label: "Labs", to: "/labs" },
  { label: "Mentors", to: "/mentors" },
  { label: "Enterprise", to: "/enterprise", dropdown: enterpriseDropdown },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
const Navbar = () => {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  /* ── State ──────────────────────────────────────────── */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>(
    {},
  );
  const drawerRef = useRef<any>(null);

  /* ── Helpers ────────────────────────────────────────── */
  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleAccordion = (label: string) =>
    setAccordionOpen((prev: any) => ({ ...prev, [label]: !prev[label] }));

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setAccordionOpen({});
  }, []);

  /* ── Side-effects ───────────────────────────────────── */
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  /* ── Auth block (shared between desktop & mobile) ──── */
  const renderAuthDesktop = () =>
    user ? (
      <div className="flex items-center gap-4">
        <NotificationPopover />
        <Link
          to={
            user.pageAccess?.includes("PG_ADM")
              ? "/admin"
              : user.pageAccess?.includes("PG_MNT")
                ? "/mentor"
                : "/dashboard"
          }
          className="flex items-center gap-3 hover:bg-slate-800 p-1.5 rounded-lg transition-all"
        >
          <span className="text-sm font-bold hidden sm:block text-slate-200">
            {user.fullName || "Dashboard"}
          </span>
          <Avatar
            src={user.profileUrl}
            fallback={user.fullName?.[0] || "U"}
            size="sm"
          />
        </Link>
      </div>
    ) : (
      <>
        <Link
          to="/login"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block"
        >
          Log In
        </Link>
        <Button
          onClick={() => navigate("/signup")}
          className="bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold rounded-lg px-5 h-9 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all"
        >
          Sign Up
        </Button>
      </>
    );

  const renderAuthMobile = () =>
    user ? (
      <Link
        to={
          user.pageAccess?.includes("PG_ADM")
            ? "/admin"
            : user.pageAccess?.includes("PG_MNT")
              ? "/mentor"
              : "/dashboard"
        }
        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
        onClick={closeMobile}
      >
        <Avatar
          src={user.profileUrl}
          fallback={user.fullName?.[0] || "U"}
          size="sm"
        />
        <span className="text-sm font-bold text-slate-200">
          {user.fullName || "Dashboard"}
        </span>
      </Link>
    ) : (
      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={() => {
            navigate("/login");
            closeMobile();
          }}
          className="w-full h-11 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 font-semibold hover:bg-slate-800 transition-colors"
        >
          Log In
        </Button>
        <Button
          onClick={() => {
            navigate("/signup");
            closeMobile();
          }}
          className="w-full h-11 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all"
        >
          Sign Up
        </Button>
      </div>
    );

  /* ═══════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Sticky header bar ─────────────────────────────── */}
      <header className="premium-header sticky top-0 z-50 h-16 w-full bg-slate-950/60 backdrop-blur-2xl border-b border-slate-800/50">
        <div className="max-w-8xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* — Brand — */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Payilagam Home"
          >
            <PayilagamLogo
              size={36}
              className="transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
            />
            <span className="font-bold text-xl tracking-tight text-slate-200 group-hover:text-sky-300 transition-colors duration-200">
              Payilagam
            </span>
          </Link>

          {/* — Desktop nav links (centred) — */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 font-medium text-sm text-slate-300 h-full"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link: any) =>
              link.dropdown ? (
                /* Dropdown link */
                <div
                  key={link.label}
                  className="relative group h-full flex items-center"
                >
                  <Link
                    to={link.to}
                    className={`nav-link relative flex items-center gap-1 px-3 py-2 transition-colors duration-200 h-full ${
                      isActive(link.to)
                        ? "text-sky-300 font-semibold"
                        : "hover:text-white"
                    }`}
                  >
                    <span className="nav-link-text relative">
                      {link.label}
                      {/* Animated underline — exactly under text */}
                      <span
                        className={`absolute -bottom-1 left-0 w-full h-0.5 rounded-full transition-transform duration-300 ease-out origin-left ${
                          isActive(link.to)
                            ? "bg-sky-400 scale-x-100 shadow-[0_0_8px_rgba(14,165,233,0.6)] nav-underline-active"
                            : "bg-sky-400/70 scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  {/* Dropdown panel */}
                  <div className="absolute top-full left-0 pt-1 hidden group-hover:block">
                    <div className="w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50 rounded-xl p-1.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
                      {link.dropdown.map((item: any, i: any) =>
                        item.divider ? (
                          <div
                            key={`div-${i}`}
                            className="h-px bg-slate-800 my-1 mx-2"
                          />
                        ) : (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors duration-150 font-medium"
                          >
                            {item.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Simple link */
                <Link
                  key={link.label}
                  to={link.to}
                  className={`nav-link group/link relative flex items-center px-3 py-2 transition-colors duration-200 h-full ${
                    isActive(link.to)
                      ? "text-sky-300 font-semibold"
                      : "hover:text-white"
                  }`}
                >
                  <span className="nav-link-text relative">
                    {link.label}
                    {/* Animated underline — exactly under text */}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-0.5 rounded-full transition-transform duration-300 ease-out origin-left ${
                        isActive(link.to)
                          ? "bg-sky-400 scale-x-100 shadow-[0_0_8px_rgba(14,165,233,0.6)] nav-underline-active"
                          : "bg-sky-400/70 scale-x-0 group-hover/link:scale-x-100"
                      }`}
                    />
                  </span>
                </Link>
              ),
            )}
          </nav>

          {/* — Right: auth actions (desktop) + hamburger (mobile) — */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-4">
              {renderAuthDesktop()}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen((v: any) => !v)}
              aria-expanded={mobileOpen}
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              <span className="sr-only">
                {mobileOpen ? "Close menu" : "Open menu"}
              </span>
              {/* Animated hamburger → X */}
              <span className="flex flex-col items-center justify-center w-5 h-5 relative">
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out ${
                    mobileOpen
                      ? "rotate-45 translate-y-[3px]"
                      : "-translate-y-[4px]"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out ${
                    mobileOpen ? "opacity-0 scale-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out ${
                    mobileOpen
                      ? "-rotate-45 -translate-y-[3px]"
                      : "translate-y-[4px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
         Mobile drawer
         ═══════════════════════════════════════════════════ */}

      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Slide-in drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-[70] w-full max-w-sm h-full bg-slate-950 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={closeMobile}
            aria-label="Payilagam Home"
          >
            <PayilagamLogo
              size={30}
              className="drop-shadow-[0_0_8px_rgba(14,165,233,0.5)] group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-lg text-slate-200 group-hover:text-sky-300 transition-colors">
              Payilagam
            </span>
          </Link>
          <button
            type="button"
            onClick={closeMobile}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer body — scrollable links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navLinks.map((link: any) =>
            link.dropdown ? (
              /* Accordion section */
              <div key={link.label}>
                <button
                  type="button"
                  onClick={() => toggleAccordion(link.label)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? "text-sky-300 bg-slate-900 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                  aria-expanded={!!accordionOpen[link.label]}
                >
                  {link.label}
                  <ChevronDown
                    className={`w-4 h-4 opacity-70 transition-transform duration-200 ${
                      accordionOpen[link.label] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Accordion children */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-out ${
                    accordionOpen[link.label]
                      ? "max-h-96 opacity-100 mt-1"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pl-4 pr-2 pb-1 space-y-0.5 border-l border-slate-800 ml-4">
                    {link.dropdown
                      .filter((d: any) => !d.divider)
                      .map((item: any) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={closeMobile}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-sky-300 hover:bg-slate-900 rounded-lg transition-colors duration-150"
                        >
                          <ChevronRight className="w-3 h-3 opacity-40" />
                          {item.label}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Simple link */
              <Link
                key={link.label}
                to={link.to}
                onClick={closeMobile}
                className={`block px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-sky-300 bg-slate-900 shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        {/* Drawer footer — auth */}
        <div className="px-5 pb-6 pt-4 border-t border-slate-800 shrink-0">
          {renderAuthMobile()}
        </div>
      </div>
    </>
  );
};

export default Navbar;
