
import { MessageSquare } from "lucide-react";
import { getIconById } from "@/utils/iconUtils";

const WorkspaceRail = ({ workspaces, activeWorkspaceId, setActiveWorkspaceId }: any) => {
  return (
    <div className="w-16 flex flex-col items-center py-4 gap-4 bg-[#0e1621] border-r border-[#0e1621] shrink-0 z-30">
      
      {/* DM Home Icon */}
      <div className="relative group cursor-pointer w-12 h-12 flex justify-center items-center" onClick={() => setActiveWorkspaceId(null)}>
        <div className={`absolute left-0 w-1 bg-white rounded-r-md transition-all duration-300 ${activeWorkspaceId === null ? "h-10" : "h-0 group-hover:h-5"}`} />
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeWorkspaceId === null ? "bg-[#2b5278] text-white rounded-xl" : "bg-[#242f3d] text-[#6b7d8d] group-hover:bg-[#2b5278] group-hover:text-white group-hover:rounded-xl"}`}>
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>

      <div className="w-8 h-px bg-[#242f3d]" />

      {/* Workspaces List */}
      <div className="flex-1 overflow-y-auto space-y-3 w-full flex flex-col items-center custom-scrollbar">
        {workspaces.map((workspace: any) => {
          const Icon = getIconById(workspace.workspaceId);
          return (
            <div key={workspace.workspaceId} className="relative group cursor-pointer w-12 h-12 flex justify-center items-center" onClick={() => setActiveWorkspaceId(workspace.workspaceId)}>
              <div className={`absolute left-0 w-1 bg-white rounded-r-md transition-all duration-300 ${activeWorkspaceId === workspace.workspaceId ? "h-10" : "h-0 group-hover:h-5"}`} />
              <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg transition-all duration-300 ${activeWorkspaceId === workspace.workspaceId ? "bg-[#2b5278] text-white rounded-xl" : "bg-[#242f3d] text-[#6b7d8d] group-hover:bg-[#2b5278] group-hover:text-white group-hover:rounded-xl"}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceRail;
