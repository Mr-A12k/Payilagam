import {
  Home,
  BookOpen,
  BookMarked,
  BarChart2,
  ClipboardList,
  Settings,
  Users,
  MessageCircle,
  UserPlus,
  PlusCircle,
  Bot,
} from "lucide-react";

export function sectionFor(path: string) {
  if (["/chat", "/network", "/mentors"].includes(path)) return "Community";
  if (
    path === "/settings" ||
    path.includes("/users") ||
    path.includes("/students") ||
    path.includes("/course/create") ||
    path.includes("analytics") ||
    path.includes("mentor-applications")
  )
    return "Workspace";
  return "Learning";
}
export const navigationSections = ["Learning", "Community", "Workspace"];
export function getWorkspaceNavigation(
  user: { roleId?: number; pageAccess?: string[] } | null,
) {
  const getNavLinks = () => {
    const commonLinks = [
      { name: "Courses", path: "/courses", icon: BookOpen },
      { name: "Mentors", path: "/mentors", icon: Users },
      { name: "Documents", path: "/documents", icon: ClipboardList },
      { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
      { name: "Chat", path: "/chat", icon: MessageCircle },
      { name: "Network", path: "/network", icon: UserPlus },
    ];

    if (user?.roleId === 1 || user?.pageAccess?.includes("PG_ADM")) {
      return [
        { name: "Overview", path: "/admin", icon: Home },
        ...commonLinks,
        { name: "Users", path: "/admin/users", icon: Users },
        {
          name: "Mentor applications",
          path: "/admin/mentor-applications",
          icon: ClipboardList,
        },
        {
          name: "Create Course",
          path: "/mentor/course/create",
          icon: PlusCircle,
        },
        { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
        { name: "Site Config", path: "/admin/settings", icon: Settings },
        { name: "Settings", path: "/settings", icon: Settings },
      ];
    } else if (user?.roleId === 2 || user?.pageAccess?.includes("PG_MNT")) {
      return [
        { name: "Dashboard", path: "/mentor", icon: Home },
        ...commonLinks,
        { name: "My Students", path: "/mentor/students", icon: Users },
        {
          name: "Create Course",
          path: "/mentor/course/create",
          icon: PlusCircle,
        },
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

  return getNavLinks().sort(
    (a, b) =>
      navigationSections.indexOf(sectionFor(a.path)) -
      navigationSections.indexOf(sectionFor(b.path)),
  );
}
