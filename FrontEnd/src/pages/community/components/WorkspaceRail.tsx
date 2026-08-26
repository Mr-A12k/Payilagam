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
    <div className="w-[68px] flex flex-col items-center py-4 gap-3 bg-[#060911] border-r border-white/[0.06] shrink-0 z-30 select-none">
      {/* DM Home Icon */}
      <RailItem
        isActive={activeWorkspaceId === null}
        onClick={() => setActiveWorkspaceId(null)}
        title="Direct Messages"
      >
        <MessageSquare className="w-5 h-5" />
      </RailItem>

      {/* Divider */}
      <div className="w-7 h-[1px] bg-white/[0.08] my-1" />

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
            >
              <Icon className="w-5 h-5" />
            </RailItem>
          );
        })}

        {/* Add group button */}
        {canCreate && (
          <button
            onClick={onCreateWorkspace}
            title="Create Group"
            className="w-11 h-11 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 hover:border-blue-500/60 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 mt-1 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
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
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <div
    className="relative group cursor-pointer w-11 h-11 flex justify-center items-center"
    onClick={onClick}
    title={title}
  >
    {/* Active left indicator pill */}
    <div
      className={cn(
        "absolute left-[-10px] w-1 rounded-r-full transition-all duration-300 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]",
        isActive ? "h-8" : "h-0 group-hover:h-4 opacity-70"
      )}
    />
    {/* Icon Container */}
    <div
      className={cn(
        "w-11 h-11 flex items-center justify-center transition-all duration-200 shadow-md",
        isActive
          ? "rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25 shadow-lg"
          : "rounded-[20px] bg-slate-900/80 border border-white/[0.05] text-slate-400 hover:rounded-2xl hover:bg-slate-800 hover:text-slate-100 active:scale-95"
      )}
    >
      {children}
    </div>
  </div>
);

export default WorkspaceRail;
