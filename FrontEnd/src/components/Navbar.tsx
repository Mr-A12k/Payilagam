import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button, Avatar } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PayilagamLogo from "@/components/ui/PayilagamLogo";
import NotificationPopover from "./NotificationPopover";
import ThemePicker from "@/components/ThemePicker";
import { useAppSelector } from "@/hooks/reduxHooks";

const navLinks = [
  {
    label: "Courses",
    to: "/courses",
    dropdown: [
      { label: "All courses", to: "/courses" },
      { label: "Web development", to: "/courses?category=web" },
      { label: "Data science & AI", to: "/courses?category=data" },
      { label: "Cloud computing", to: "/courses?category=cloud" },
      { label: "My learning", to: "/learning" },
    ],
  },
  { label: "Resources", to: "/resources" },
  { label: "Labs", to: "/labs" },
  { label: "Mentors", to: "/mentors" },
  {
    label: "Enterprise",
    to: "/enterprise",
    dropdown: [
      { label: "For business", to: "/enterprise" },
      { label: "For universities", to: "/enterprise/universities" },
      { label: "For government", to: "/enterprise/government" },
    ],
  },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const user = useAppSelector((state) => state.auth.user) as {
    pageAccess?: string[];
    profileUrl?: string;
    fullName?: string;
  } | null;
  const location = useLocation();
  const [menuLocation, setMenuLocation] = useState<string | null>(null);
  const mobileOpen = menuLocation === location.key;
  const setMobileOpen = (open: boolean) =>
    setMenuLocation(open ? location.key : null);
  const dashboardPath = user?.pageAccess?.includes("PG_ADM")
    ? "/admin"
    : user?.pageAccess?.includes("PG_MNT")
      ? "/mentor"
      : "/dashboard";
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuLocation(null);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const navClass = (path: string) =>
    `inline-flex min-h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-hover)] ${isActive(path) ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`;

  const authLinks = user ? (
    <Link
      to={dashboardPath}
      onClick={() => setMobileOpen(false)}
      className="flex min-w-0 items-center gap-2 rounded-md p-2 hover:bg-[var(--bg-hover)]"
      aria-label="Open your dashboard"
    >
      <Avatar
        src={user.profileUrl}
        fallback={user.fullName?.[0] || "U"}
        size="sm"
      />
      <span className="max-w-32 truncate text-sm font-medium">
        {user.fullName || "Dashboard"}
      </span>
    </Link>
  ) : (
    <>
      <Button asChild variant="ghost">
        <Link to="/login" onClick={() => setMobileOpen(false)}>
          Log in
        </Link>
      </Button>
      <Button asChild>
        <Link to="/signup" onClick={() => setMobileOpen(false)}>
          Sign up
        </Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-[var(--border-default)] bg-[var(--header-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
        <Link
          to="/"
          aria-label="Payilagam home"
          className="flex shrink-0 items-center gap-2.5 text-lg font-semibold"
        >
          <PayilagamLogo size={30} />
          <span>Payilagam</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-0.5 xl:flex"
        >
          {navLinks.map((link) =>
            link.dropdown ? (
              <DropdownMenu key={link.to}>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={navClass(link.to)}>
                    {link.label}
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={12}
                  className="w-56 border border-[var(--border-default)] bg-[var(--bg-surface)] p-1.5"
                >
                  {link.dropdown.map((item) => (
                    <DropdownMenuItem
                      key={item.to}
                      asChild
                      className="min-h-10 px-3 focus:bg-[var(--bg-hover)]"
                    >
                      <Link to={item.to}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={navClass(link.to)}
                aria-current={isActive(link.to) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemePicker />
          {user && <NotificationPopover />}
          <div className="hidden items-center gap-1 xl:flex">{authLinks}</div>
          <Dialog.Root
            key={location.key}
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          >
            <Dialog.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label="Open navigation menu"
                title="Open navigation menu"
              >
                <Menu size={20} />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-x-4 top-4 z-50 max-h-[calc(100dvh-32px)] overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-[var(--text-primary)] sm:left-auto sm:w-96"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <Dialog.Title className="text-lg font-semibold">
                    Payilagam
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close navigation menu"
                      title="Close navigation menu"
                    >
                      <X size={20} />
                    </Button>
                  </Dialog.Close>
                </div>
                <nav aria-label="Mobile navigation" className="space-y-1">
                  {navLinks.map((link) =>
                    link.dropdown ? (
                      <details
                        key={link.to}
                        className="group rounded-md"
                        open={isActive(link.to) || undefined}
                      >
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-3 text-sm font-medium hover:bg-[var(--bg-hover)] [&::-webkit-details-marker]:hidden">
                          {link.label}
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className="transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <div className="ml-3 border-l border-[var(--border-default)] pl-2">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex min-h-11 items-center rounded-md px-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive(link.to) ? "page" : undefined}
                        className={`${navClass(link.to)} flex min-h-11 px-3`}
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </nav>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-default)] pt-4">
                  {authLinks}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
