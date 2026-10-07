import { MessageSquare, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { getIconById } from "@/utils/iconUtils";
import { cn } from "@/lib/utils";

const WorkspaceRail = ({
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  onCreateWorkspace,
}: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const canCreate =
    user?.roleId === 1 ||
    user?.roleId === 2 ||
    user?.role === "admin" ||
    user?.role === "mentor" ||
    user?.pageAccess?.includes("PG_ADM");

  return (
    <div className="w-14 min-h-0 flex flex-col items-center py-3 gap-2 bg-[var(--bg-surface-2)] border-r border-[var(--border-default)] shrink-0 z-30 select-none">
      {/* DM Home Icon */}
      <RailItem
        isActive={activeWorkspaceId === null}
        onClick={() => setActiveWorkspaceId(null)}
        title="Direct Messages"
        color="text-emerald-500"
      >
        <MessageSquare className="w-4 h-4" />
      </RailItem>

      {/* Divider */}
      <div className="w-7 h-[1px] bg-[var(--bg-surface-2)] my-1" />

      {/* Workspaces List */}
      <div className="flex-1 flex flex-col items-center gap-3 w-full overflow-y-auto custom-scrollbar py-1">
        {workspaces.map((ws: any) => {
          const Icon = getIconById(ws.workspaceId);
          return (
            <RailItem
              key={ws.workspaceId}
              isActive={activeWorkspaceId === ws.workspaceId}
              onClick={() => setActiveWorkspaceId(ws.workspaceId)}
              title={ws.name}
              color={["text-sky-500", "text-rose-500", "text-amber-500", "text-emerald-500"][ws.workspaceId % 4]}
            >
              <Icon className="w-4 h-4" />
            </RailItem>
          );
        })}

        {/* Add group button */}
        {canCreate && (
          <button
            onClick={onCreateWorkspace}
            title="Create Group"
            aria-label="Create group"
            className="w-9 h-9 shrink-0 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-2)] text-emerald-500 flex items-center justify-center transition-colors mt-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Rail Item Component ────────────────────────────────────────── */
const RailItem = ({
  isActive,
  onClick,
  title,
  children,
  color,
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  color: string;
}) => (
  <button
    type="button"
    aria-label={title}
    aria-pressed={isActive}
    className="relative group cursor-pointer w-9 h-9 shrink-0 flex justify-center items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
    onClick={onClick}
    title={title}
  >
    {/* Active left indicator pill */}
    <div
      className={cn(
        "absolute -left-1 w-1 rounded-r-full transition-all duration-150 bg-[var(--text-secondary)]",
        isActive ? "h-8" : "h-0 group-hover:h-4 opacity-70"
      )}
    />
    {/* Icon Container */}
    <div
      className={cn(
        "w-9 h-9 flex items-center justify-center transition-all duration-200 ",
        isActive
          ? "rounded-lg bg-[var(--bg-surface-3)]"
          : "rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-2)]",
        color
      )}
    >
      {children}
    </div>
  </button>
);

export default WorkspaceRail;
