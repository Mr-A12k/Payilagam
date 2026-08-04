import { useState } from "react";
import { Search, Hash, Volume2, Plus, Loader2 } from "lucide-react";
import { Avatar, Dialog, DialogContent, DialogTrigger } from "@/components/ui";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import toast from "react-hot-toast";

const ChannelSidebar = ({
  activeWorkspaceId,
  workspaces,
  conversations,
  activeConvId,
  setActiveConvId,
  activeChannelId,
  setActiveChannelId,
  isLoading,
  getOtherParticipant,
  isAdmin,
  user,
  onNewConversation,
}: any) => {
  const isDMView = activeWorkspaceId === null;
  const activeWorkspace = workspaces.find(
    (w: any) => w.workspaceId === activeWorkspaceId,
  );
  const channels = activeWorkspace?.channels || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setIsStartingChat] = useState(false);

  const handleSearch = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await executeHttpGetRequest(
        `${API_PATHS.USERS.SEARCH}?questionText =${searchQuery}`,
      );
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to search users");
      console.error("Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = async (userId: string) => {
    setIsStartingChat(true);
    try {
      // POST to get or create conversation
      const response = await executeHttpPostRequest(API_PATHS.CHAT.BASE, {
        targetUserId: userId,
      });
      if (response.data.success) {
        const conv = response.data.data;
        // Check if it already exists in the list
        if (
          !conversations.find(
            (c: any) => c.conversationId === conv.conversationId,
          )
        ) {
          if (onNewConversation) onNewConversation(conv);
        } else {
          setActiveConvId(conv.conversationId);
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to start chat");
      console.error("Error:", error);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="w-[280px] flex flex-col shrink-0 bg-[#17212b] border-r border-[#0e1621] z-20">
      {/* Sidebar Header */}
      <div className="h-14 px-4 flex items-center justify-between shadow-sm z-10 border-b border-[#0e1621]">
        <h2 className="font-bold text-slate-100 truncate">
          {isDMView ? "Direct Messages" : activeWorkspace?.name}
        </h2>
        {isDMView && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 text-slate-100">
              <div className="p-2">
                <h3 className="text-lg font-bold mb-4">New Message</h3>
                <form onSubmit={handleSearch} className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event: React.SyntheticEvent<any>) =>
                      setSearchQuery((event.target as HTMLInputElement).value)
                    }
                    placeholder="Search users by name or email..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="hidden" />
                </form>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {isSearching ? (
                    <div className="flex-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : searchResults.length === 0 && searchQuery ? (
                    <div className="text-center py-8 text-slate-500">
                      No users found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((userItem: any) => (
                        <div
                          key={userItem.userId}
                          onClick={() => startChat(userItem.userId)}
                          className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <Avatar
                            src={userItem.profileUrl}
                            fallback={userItem.fullName?.[0] || "U"}
                            className="w-10 h-10 rounded-full border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-sm">
                              {userItem.fullName}
                            </div>
                            <div className="text-xs text-slate-500">
                              @{userItem.userName} &bull;{" "}
                              {userItem.role?.roleName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      {/* <div className="px-3 py-3">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder={isDMView ? "Find a conversation" : "Search channels"}
            className="w-full pl-9 pr-3 py-1.5 rounded-full text-[13px] bg-[#242f3d] border-none text-slate-200 placeholder:text-[#6b7d8d] focus:outline-none focus:ring-1 focus:ring-[#2b5278] transition-all"
          />
        </div>
      </div> */}

      {/* List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-0.5">
        {isLoading ? (
          <div className="p-4 text-center text-[13px] text-slate-500">
            Loading...
          </div>
        ) : isDMView ? (
          // --- DIRECT MESSAGES VIEW ---
          conversations.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center mt-10">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-slate-200 font-medium mb-2">
                No conversations yet
              </h3>
              <p className="text-[13px] text-slate-500 mb-6">
                Search for a user to start chatting.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
              >
                Find Members
              </button>
            </div>
          ) : (
            conversations.map((conv: any) => {
              const otherUser = getOtherParticipant(conv);
              const isSelected = conv.conversationId === activeConvId;
              const isMyChat =
                user &&
                conv.participants.some((p: any) => p.userId === user.userId);
              const name =
                isAdmin && !isMyChat
                  ? `${conv.participants[0]?.user?.fullName || "Unknown"} & ${conv.participants[1]?.user?.fullName || "Unknown"}`
                  : otherUser?.fullName || "Unknown User";

              return (
                <div
                  key={conv.conversationId}
                  onClick={() => setActiveConvId(conv.conversationId)}
                  className={`flex items-center gap-3 px-2 py-2 cursor-pointer rounded-xl transition-colors ${
                    isSelected
                      ? "bg-[#2b5278] text-white"
                      : "text-[#6b7d8d] hover:bg-[#242f3d] hover:text-[#7da8ce]"
                  }`}
                >
                  <Avatar
                    src={otherUser?.profileUrl}
                    fallback={otherUser?.fullName?.[0] || "U"}
                    size="sm"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{name}</div>
                  </div>
                </div>
              );
            })
          )
        ) : // --- WORKSPACE CHANNELS VIEW ---
        channels.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-slate-500">
            No channels available.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Text Channels
              </h3>
              {channels
                .filter((c: any) => c.type === "TEXT")
                .map((channel: any) => {
                  const isSelected = channel.channelId === activeChannelId;
                  return (
                    <div
                      key={channel.channelId}
                      onClick={() => setActiveChannelId(channel.channelId)}
                      className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-xl transition-colors ${
                        isSelected
                          ? "bg-[#2b5278] text-white"
                          : "text-[#6b7d8d] hover:bg-[#242f3d] hover:text-[#7da8ce]"
                      }`}
                    >
                      <Hash className="w-5 h-5 opacity-70" />
                      <span className="font-medium text-sm truncate">
                        {channel.name.toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Optional Voice Channels if needed later */}
            {channels.filter((c: any) => c.type === "VOICE").length > 0 && (
              <div>
                <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 mt-4">
                  Voice Channels
                </h3>
                {channels
                  .filter((c: any) => c.type === "VOICE")
                  .map((channel: any) => (
                    <div
                      key={channel.channelId}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-not-allowed rounded-md text-slate-500"
                    >
                      <Volume2 className="w-5 h-5 opacity-70" />
                      <span className="font-medium text-sm truncate">
                        {channel.name}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelSidebar;
