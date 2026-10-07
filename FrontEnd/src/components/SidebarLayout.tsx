import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { logout } from "@/store/authSlice";
import { cn } from "@/lib/utils";
import PayilagamLogo from "@/components/ui/PayilagamLogo";
import { Avatar, Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationPopover from "./NotificationPopover";
import ThemePicker from "@/components/ThemePicker";
import {
  getWorkspaceNavigation,
  navigationSections,
  sectionFor,
} from "@/app/navigation";
import "@/styles/shell.css";

function NavigationHint({
  children,
  label,
  enabled = true,
}: {
  children: ReactNode;
  label: string;
  enabled?: boolean;
}) {
  return enabled ? (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  ) : (
    children
  );
}

export default function SidebarLayout() {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navLinks = getWorkspaceNavigation(user);
  const homePath =
    user?.roleId === 1
      ? "/admin"
      : user?.roleId === 2
        ? "/mentor"
        : "/dashboard";
  const goBack = useBackNavigation(homePath);
  const collapsed = isCollapsed && !mobileMenuOpen;
  const activeLink = [...navLinks]
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (link) =>
        location.pathname === link.path ||
        (!["/admin", "/mentor"].includes(link.path) &&
          location.pathname.startsWith(link.path + "/")),
    );
  const pageName = location.pathname.includes("/course/edit/")
    ? "Edit course"
    : activeLink?.name || "Workspace";
  const roleName =
    user?.roleId === 1 ? "Admin" : user?.roleId === 2 ? "Mentor" : "Student";

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = requestAnimationFrame(() =>
      sidebarRef.current
        ?.querySelector<HTMLButtonElement>('[aria-label="Close navigation"]')
        ?.focus(),
    );
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
      if (event.key !== "Tab") return;
      const items = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) || [],
      ).filter((item) => item.getClientRects().length > 0);
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      opener?.focus();
    };
  }, [mobileMenuOpen]);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/courses?search=" + encodeURIComponent(searchQuery.trim()));
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <TooltipProvider delayDuration={180}>
      <div className="workspace-shell">
        <a className="shell-skip-link" href="#workspace-content">
          Skip to content
        </a>
        {mobileMenuOpen && (
          <div
            className="shell-scrim"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <aside
          ref={sidebarRef}
          className={cn(
            "app-sidebar shell-sidebar",
            mobileMenuOpen && "is-open",
          )}
          data-collapsed={collapsed}
          role={mobileMenuOpen ? "dialog" : undefined}
          aria-modal={mobileMenuOpen || undefined}
          aria-label="Primary navigation"
        >
          <div className="shell-brand-row">
            <NavLink
              to={homePath}
              className="shell-brand"
              aria-label="Payilagam home"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PayilagamLogo size={30} />
              {!collapsed && (
                <span>
                  Payilagam
                  <span className="shell-brand-caption">
                    Learning workspace
                  </span>
                </span>
              )}
            </NavLink>
            <NavigationHint
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <button
                type="button"
                className="shell-edge-toggle"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={() => setIsCollapsed((value) => !value)}
              >
                {collapsed ? (
                  <ChevronsRight aria-hidden="true" />
                ) : (
                  <ChevronsLeft aria-hidden="true" />
                )}
              </button>
            </NavigationHint>
            <Button
              variant="ghost"
              size="icon"
              className="shell-mobile-control"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X />
            </Button>
          </div>

          <nav className="shell-navigation" aria-label="Workspace">
            {navigationSections.map((section) => (
              <div key={section} className="shell-nav-group">
                {!collapsed && (
                  <div className="shell-nav-heading">{section}</div>
                )}
                {navLinks
                  .filter((link) => sectionFor(link.path) === section)
                  .map((link) => {
                    const Icon = link.icon;
                    const active =
                      location.pathname === link.path ||
                      (!["/admin", "/mentor"].includes(link.path) &&
                        location.pathname.startsWith(link.path + "/"));
                    return (
                      <NavigationHint
                        key={link.path}
                        label={link.name}
                        enabled={collapsed}
                      >
                        <NavLink
                          to={link.path}
                          end={["/admin", "/mentor"].includes(link.path)}
                          aria-label={link.name}
                          className={cn(
                            "shell-nav-link",
                            active && "is-active",
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon
                            className="shell-nav-icon"
                            aria-hidden="true"
                            strokeWidth={1.7}
                          />
                          {!collapsed && <span>{link.name}</span>}
                        </NavLink>
                      </NavigationHint>
                    );
                  })}
              </div>
            ))}
          </nav>
          <div className="shell-sidebar-footer">
            <NavigationHint label="Help Center" enabled={collapsed}>
              <button
                type="button"
                className="shell-help"
                aria-label="Help Center"
                onClick={() => {
                  navigate("/contact");
                  setMobileMenuOpen(false);
                }}
              >
                <HelpCircle aria-hidden="true" />
                {!collapsed && (
                  <>
                    <span>Help Center</span>
                    <ArrowUpRight className="shell-help-arrow" />
                  </>
                )}
              </button>
            </NavigationHint>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="shell-account"
                  aria-label="Account menu"
                >
                  <Avatar
                    src={user?.profileUrl}
                    fallback={user?.fullName?.[0] || user?.userName?.[0] || "U"}
                    size="sm"
                  />
                  {!collapsed && (
                    <>
                      <span className="shell-account-copy">
                        <strong>
                          {user?.fullName || user?.userName || "Account"}
                        </strong>
                        <span>{roleName}</span>
                      </span>
                      <ChevronDown className="shell-account-chevron" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                sideOffset={10}
                className="w-60"
              >
                <DropdownMenuLabel>
                  <div className="text-sm font-medium truncate">
                    {user?.fullName || user?.userName}
                  </div>
                  <div className="mt-1 text-xs font-normal text-[var(--text-muted)] truncate">
                    {user?.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    navigate("/settings");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Account settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    setMobileMenuOpen(false);
                    setIsLogoutConfirmOpen(true);
                  }}
                  className="text-[var(--status-danger)]"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
        <div className="shell-main" inert={mobileMenuOpen}>
          <header className="shell-header">
            <div className="shell-location">
              <Button
                variant="ghost"
                size="icon"
                className="shell-mobile-control"
                aria-label="Open navigation"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shell-back"
                aria-label="Previous page"
                title="Previous page"
                onClick={goBack}
              >
                <ArrowLeft />
              </Button>
              <nav className="shell-breadcrumb" aria-label="Breadcrumb">
                <span>
                  {activeLink ? sectionFor(activeLink.path) : "Workspace"}
                </span>
                <span aria-hidden="true">/</span>
                <strong aria-current="page">{pageName}</strong>
              </nav>
            </div>
            <div className="shell-header-actions">
              <form
                role="search"
                onSubmit={handleSearch}
                className={cn("shell-search", searchOpen && "is-open")}
              >
                <Search aria-hidden="true" />
                <input
                  ref={searchRef}
                  aria-label="Search courses"
                  type="search"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setSearchOpen(false);
                  }}
                />
                {searchOpen && (
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X />
                  </button>
                )}
              </form>
              <Button
                variant="ghost"
                size="icon"
                className="shell-search-toggle"
                aria-label="Open course search"
                onClick={() => setSearchOpen((value) => !value)}
              >
                <Search />
              </Button>
              <ThemePicker />
              <NotificationPopover />
            </div>
          </header>
          <main id="workspace-content" tabIndex={-1} className="shell-content">
            <div className="app-content">
              <Outlet />
            </div>
          </main>
        </div>
        <ConfirmDialog
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            dispatch(logout());
            navigate("/");
          }}
          title="Log out"
          description="Are you sure you want to log out of your account?"
          confirmText="Log out"
          destructive
        />
      </div>
    </TooltipProvider>
  );
}
