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

  return (
    <div className="w-16 flex flex-col items-center py-4 gap-4 bg-[#0e1621] border-r border-slate-900 shrink-0 z-30 shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.02)]">
      {/* DM Home Icon */}
      <div
        className="relative group cursor-pointer w-12 h-12 flex justify-center items-center"
        onClick={() => setActiveWorkspaceId(null)}
      >
        <div
          className={cn(
            "absolute left-0 w-1 rounded-r-md transition-all duration-300 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
            activeWorkspaceId === null ? "h-10" : "h-0 group-hover:h-5"
          )}
        />
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md",
            activeWorkspaceId === null 
              ? "bg-gradient-to-tr from-[#2b5278] to-[#3c6b9b] text-white rounded-xl shadow-[0_0_12px_rgba(43,82,120,0.4)]" 
              : "bg-[#182533] text-[#6b7d8d] hover:bg-[#2b5278] hover:text-white hover:rounded-xl hover:scale-105 active:scale-95"
          )}
        >
          <MessageSquare className="w-5.5 h-5.5" />
        </div>
      </div>

      <div className="w-8 h-[1px] bg-slate-800/80 shadow-sm" />

      {/* Workspaces List */}
      <div className="flex-1 overflow-y-auto space-y-3 w-full flex flex-col items-center custom-scrollbar">
        {workspaces.map((workspace: any) => {
          const Icon = getIconById(workspace.workspaceId);
          const isActive = activeWorkspaceId === workspace.workspaceId;
          return (
            <div
              key={workspace.workspaceId}
              className="relative group cursor-pointer w-12 h-12 flex justify-center items-center"
              onClick={() => setActiveWorkspaceId(workspace.workspaceId)}
            >
              <div
                className={cn(
                  "absolute left-0 w-1 rounded-r-md transition-all duration-300 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
                  isActive ? "h-10" : "h-0 group-hover:h-5"
                )}
              />
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-md",
                  isActive 
                    ? "bg-gradient-to-tr from-[#2b5278] to-[#3c6b9b] text-white rounded-xl shadow-[0_0_12px_rgba(43,82,120,0.4)]" 
                    : "bg-[#182533] text-[#6b7d8d] hover:bg-[#2b5278] hover:text-white hover:rounded-xl hover:scale-105 active:scale-95"
                )}
              >
                <Icon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}

        {/* Add Group Button for Mentors/Admins */}
        {(user?.roleId === 1 || user?.roleId === 2 || user?.role === "admin" || user?.role === "mentor") && (
          <div
            className="relative group cursor-pointer w-12 h-12 flex justify-center items-center mt-1"
            onClick={onCreateWorkspace}
          >
            <div
              className="w-12 h-12 rounded-2xl border border-dashed border-slate-800 bg-[#182533]/40 hover:border-blue-500/50 hover:bg-[#2b5278]/20 text-slate-500 hover:text-blue-400 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-inner hover:rounded-xl"
              title="Create Group"
            >
              <Plus className="w-5.5 h-5.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceRail;
