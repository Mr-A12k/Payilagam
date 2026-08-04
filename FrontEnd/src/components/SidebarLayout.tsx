/**
 * @file SidebarLayout.jsx
 * @description Authenticated shell layout with a premium dark-themed sidebar, top header bar
 * (search + notifications + avatar), and a main content area rendered via Outlet.
 */
import { useState } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import toast from "react-hot-toast";
import {
  Home,
  BookOpen,
  BookMarked,
  BarChart2,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  Users,
  Menu,
  Bell,
  Search,
  Plus,
  MessageCircle,
  UserPlus,
  ChevronRight,
  // Sparkles,
  PlusCircle,
  Bot,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CursorTooltip } from "@/components/ui/CursorTooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";

const SidebarLayout = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const {  toggleTheme, isLight } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleSearch = (event: React.SyntheticEvent<any>) => {
    if ((event as unknown as KeyboardEvent).key === "Enter" && searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const getNavLinks = () => {
    const commonLinks = [
      { name: "Courses", path: "/courses", icon: BookOpen },
      { name: "Mentors", path: "/mentors", icon: Users },
      { name: "Documents", path: "/documents", icon: ClipboardList },
      { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
      { name: "Chat", path: "/chat", icon: MessageCircle },
      { name: "Network", path: "/network", icon: UserPlus },
    ];

    if (user?.pageAccess?.includes("PG_ADM")) {
      return [
        { name: "Overview", path: "/admin", icon: Home },
        ...commonLinks,
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Create Course", path: "/mentor/course/create", icon: PlusCircle },
        { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
        { name: "Settings", path: "/settings", icon: Settings },
      ];
    } else if (user?.pageAccess?.includes("PG_MNT")) {
      return [
        { name: "Dashboard", path: "/mentor", icon: Home },
        ...commonLinks,
        { name: "My Students", path: "/mentor/students", icon: Users },
        { name: "Create Course", path: "/mentor/course/create", icon: PlusCircle },
        { name: "Analytics", path: "/mentor/analytics", icon: BarChart2 },
        { name: "Settings", path: "/settings", icon: Settings },
      ];
    } else {
      return [
        { name: "Home", path: "/dashboard", icon: Home },
        ...commonLinks,
        { name: "My Learning", path: "/learning", icon: BookMarked },
        { name: "Analytics", path: "/analytics", icon: BarChart2 },
        { name: "Assignments", path: "/assignments", icon: ClipboardList },
        { name: "Settings", path: "/settings", icon: Settings },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="h-[100dvh] flex overflow-hidden font-inter selection:bg-blue-500/30"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden transition-opacity"
            style={{ background: "var(--bg-overlay)" }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Premium Sidebar (Dark Theme) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none border-r",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            isCollapsed ? "w-[80px]" : "w-[220px]",
          )}
          style={{
            backgroundColor: "var(--sidebar-bg)",
            borderColor: "var(--sidebar-border)",
            color: "var(--text-primary)"
          }}
        >
          {/* Logo Area */}
          <div
            className={cn(
              "h-16 flex items-center shrink-0 border-b",
              isCollapsed ? "justify-center" : "px-6 justify-between",
            )}
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <img 
                  src="https://payilagam.com/wp-content/uploads/2016/09/payilagam-logo.png" 
                  alt="Payilagam Logo" 
                  className="w-full h-full object-contain"
                  onError={(e: any) => {
                    e.target.onerror = null; // prevent infinite loop
                    (e.target as HTMLTextAreaElement).style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div style={{display: 'none'}} className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--text-heading)" }}>
                  Payilagam
                </span>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex p-1.5 rounded-md transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e: React.SyntheticEvent<any>) => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={(e: React.SyntheticEvent<any>) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-1 px-3 flex flex-col gap-1 custom-scrollbar">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Main Menu
              </div>
            )}

            {navLinks.map((link: any) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                location.pathname.startsWith(link.path + "/");

                const linkContent = (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg transition-all duration-300 ease-out group relative",
                      isCollapsed ? "justify-center p-3 h-12" : "px-3 py-2.5 gap-3",
                      isActive
                        ? "bg-[var(--sidebar-bg-active)] text-[var(--sidebar-text-active)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-bg-hover)] hover:text-[var(--text-primary)]"
                    )}
                  >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-[0_0_10px_var(--accent-primary)] bg-[var(--accent-primary)]" />
                  )}

                  <Icon
                    className={cn(
                      "icon-base",
                      isActive && "scale-110",
                    )}
                    style={{ color: isActive ? "var(--accent-primary)" : "inherit" }}
                  />

                  {!isCollapsed && (
                    <span
                      className={cn(
                        "text-[13px] font-medium leading-none",
                        isActive && "font-semibold",
                      )}
                      style={{ color: isActive ? "var(--text-heading)" : "inherit" }}
                    >
                      {link.name}
                    </span>
                  )}
                </NavLink>
              );

              if (isCollapsed) {
                return (
                  <CursorTooltip key={link.name} content={link.name}>
                    {linkContent}
                  </CursorTooltip>
                );
              }

              return linkContent;
            })}
          </div>

          {/* Expand Toggle (when collapsed) */}
          {isCollapsed && (
            <div className="p-0 flex justify-center border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <Button
                variant="ghost"
                onClick={() => setIsCollapsed(false)}
                className="w-full"
              >
                <ChevronRight className="icon-base" />
              </Button>
            </div>
          )}

          {/* Footer Actions */}
          <div
            className={cn(
              "p-4 border-t flex flex-col gap-2",
              isCollapsed && "items-center px-2",
            )}
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {isCollapsed ? (
              <CursorTooltip content="Help Center">
                <Button variant="ghost" size="icon">
                  <HelpCircle className="icon-base" />
                </Button>
              </CursorTooltip>
            ) : (
              <button className="flex items-center rounded-lg transition-colors group px-3 py-2 gap-3 w-full text-left"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e: React.SyntheticEvent<any>) => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={(e: React.SyntheticEvent<any>) => e.currentTarget.style.color = "var(--text-muted)"}>
                <HelpCircle className="shrink-0 w-4 h-4" />
                <span className="text-[13px] font-medium">Help Center</span>
              </button>
            )}

            {isCollapsed ? (
              <CursorTooltip content="Log out">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="hover:!text-red-500 hover:!bg-red-500/10"
                >
                  <LogOut className="icon-base" />
                </Button>
              </CursorTooltip>
            ) : (
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors group px-3 py-2 gap-3 w-full text-left"
                style={{ color: "var(--text-muted)" }}
              >
                <LogOut className="shrink-0 w-4 h-4 group-hover:text-red-500" />
                <span className="text-[13px] font-medium">Log out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Floating Header */}
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-30 pointer-events-none">
            <header className="pointer-events-auto h-14 premium-header rounded-2xl flex items-center justify-between px-4 sm:px-6 transition-all">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="icon-md" />
                </Button>

                <div className="hidden md:flex items-center relative group">
                  <Search className="w-4 h-4 absolute left-3 transition-colors group-focus-within:text-blue-500" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Press / to search..."
                    value={searchQuery}
                    onChange={(event: React.SyntheticEvent<any>) => setSearchQuery((event.target as HTMLInputElement).value)}
                    onKeyDown={handleSearch}
                    className="pl-9 pr-4 py-2 rounded-xl text-[13px] w-64 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", borderWidth: 1, color: "var(--input-text)" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {/* Quick Actions (Desktop only) */}
                {user?.pageAccess?.some((p: any) => p.pageCode === "PG_ADM" || p.pageCode === "PG_MNT") && (
                  <div className="hidden md:flex items-center gap-2 mr-2">
                    <button 
                      onClick={() => toast("Quick Action: Create Course")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Course
                    </button>
                    <button 
                      onClick={() => toast("Quick Action: Invite Student")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold border"
                      style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)", borderColor: "var(--border-default)" }}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Invite
                    </button>
                  </div>
                )}
                {/* Premium Upgrade Badge (Demo) */}
                {/* <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold tracking-wide hover:shadow-md hover:shadow-amber-900/20 transition-all">
                  <Sparkles className="w-3.5 h-3.5" />
                  UPGRADE
                </button> */}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:!text-blue-500 hover:!bg-blue-500/10"
                  aria-label="Toggle Theme"
                >
                  {isLight ? (
                    <Moon className="icon-md" />
                  ) : (
                    <Sun className="icon-md" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toast("No new notifications")}
                  className="hover:!text-blue-500 hover:!bg-blue-500/10 relative"
                >
                  <Bell className="icon-md" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2" style={{ borderColor: "var(--bg-surface)" }}></span>
                </Button>

                <div className="h-6 w-px hidden sm:block" style={{ background: "var(--border-default)" }}></div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className="flex items-center gap-3 p-1 pr-3 rounded-xl transition-colors cursor-pointer border border-transparent outline-none"
                      onMouseEnter={(e: React.SyntheticEvent<any>) => e.currentTarget.style.background = "var(--bg-surface-2)"}
                      onMouseLeave={(e: React.SyntheticEvent<any>) => e.currentTarget.style.background = "transparent"}
                    >
                      <Avatar
                        src={user?.profileUrl}
                        fallback={user?.fullName?.[0] || user?.userName?.[0] || "U"}
                        size="sm"
                        className="ring-2 ring-white shadow-sm"
                      />
                      <div className="hidden sm:flex flex-col">
                        <span className="text-[13px] font-bold leading-none mb-1" style={{ color: "var(--text-primary)" }}>
                          {user?.fullName || user?.userName}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider leading-none" style={{ color: "var(--text-muted)" }}>
                          {/* Map the UI string using roleId rather than the backend role name (1 = Admin, 2 = Mentor, 3 = Student) */}
                          {user?.roleId === 1 ? "Admin" : user?.roleId === 2 ? "Mentor" : "Student"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none" style={{ color: "var(--text-primary)" }}>{user?.fullName || user?.userName}</p>
                        <p className="text-xs leading-none" style={{ color: "var(--text-muted)" }}>{user?.email || "user@payilagam.com"}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ background: "var(--border-subtle)" }} />
                    <DropdownMenuItem className="cursor-pointer" style={{ color: "var(--text-primary)" }} onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" style={{ color: "var(--text-primary)" }} onClick={() => navigate("/profile")}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ background: "var(--border-subtle)" }} />
                    <DropdownMenuItem className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-500" onClick={() => setIsLogoutConfirmOpen(true)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          </div>

          {/* Page Content Container */}
          <main className="flex-1 overflow-hidden pt-24 px-2 sm:px-4 pb-4">
            <div className="h-[calc(100dvh-120px)] overflow-y-auto relative custom-scrollbar rounded-2xl bg-[var(--bg-base)]">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Quick Action FAB */}
        {/* <button
          onClick={() => toast.success("Quick Actions coming soon!")}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all z-40 group"
          style={{ background: "var(--accent-primary)", color: "white", boxShadow: "0 20px 25px -5px var(--accent-primary-border)" }}
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button> */}

        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}} />

        <ConfirmDialog
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            handleLogout();
          }}
          title="Log Out"
          description="Are you sure you want to log out of your account?"
          confirmText="Log Out"
          destructive={true}
        />
      </div>
  );
};

export default SidebarLayout;



