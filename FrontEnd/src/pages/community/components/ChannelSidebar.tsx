import { useState, useEffect } from "react";
import { Search, Hash, Volume2, Loader2, X, Eraser, MessageSquarePlus } from "lucide-react";
import { Avatar, Dialog, DialogContent, DialogTrigger, ConfirmDialog } from "@/components/ui";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useSocketContext } from "@/context/SocketContext";
import toast from "react-hot-toast";

/* ─── Tiny relative time helper ─────────────────────────────────── */
const relativeTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  } catch { return ""; }
};

/* ─── Component ─────────────────────────────────────────────────── */
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
  onNewConversation,
}: any) => {
  const { onlineUsers } = useSocketContext();
  const isDMView = activeWorkspaceId === null;
  const activeWorkspace = workspaces.find((w: any) => w.workspaceId === activeWorkspaceId);
  const channels = activeWorkspace?.channels || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, setIsStartingChat] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [isLoadingFollows, setIsLoadingFollows] = useState(false);

  // Dialog states for rich confirmations
  const [confirmClearId, setConfirmClearId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* ── Fetch followed users on modal open ── */
  useEffect(() => {
    if (!isModalOpen) return;
    const run = async () => {
      setIsLoadingFollows(true);
      try {
        const res = await executeHttpGetRequest(API_PATHS.NETWORK.FOLLOWING);
        if (res.data.success) {
          setFollowedUsers(res.data.data.map((item: any) => item.following) || []);
        }
      } catch { /* silent */ } finally { setIsLoadingFollows(false); }
    };
    run();
  }, [isModalOpen]);

  /* ── Live search ── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const id = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await executeHttpGetRequest(`${API_PATHS.USERS.SEARCH}?q=${encodeURIComponent(searchQuery)}`);
        if (res.data.success) setSearchResults(res.data.data);
      } catch { /* silent */ } finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const startChat = async (userId: string) => {
    setIsStartingChat(true);
    try {
      const res = await executeHttpPostRequest(API_PATHS.CHAT.BASE, { targetUserId: userId });
      if (res.data.success) {
        const conv = res.data.data;
        if (!conversations.find((c: any) => c.conversationId === conv.conversationId)) {
          onNewConversation?.(conv);
        } else {
          setActiveConvId(conv.conversationId);
        }
        setIsModalOpen(false);
      }
    } catch { toast.error("Failed to start chat"); } finally { setIsStartingChat(false); }
  };

  const handleClearChat = async (convId: number) => {
    setIsProcessing(true);
    try {
      const res = await executeHttpDeleteRequest(`/chat/${convId}/messages`);
      if (res.data.success) {
        toast.success("Chat cleared");
        if (activeConvId === convId) { setActiveConvId(null); setTimeout(() => setActiveConvId(convId), 10); }
      }
    } catch { toast.error("Failed to clear chat"); } finally {
      setIsProcessing(false);
      setConfirmClearId(null);
    }
  };

  const handleDeleteChat = async (convId: number) => {
    setIsProcessing(true);
    try {
      const res = await executeHttpDeleteRequest(`/chat/${convId}`);
      if (res.data.success) {
        toast.success("Conversation removed");
        if (activeConvId === convId) setActiveConvId(null);
        window.dispatchEvent(new CustomEvent("refresh_conversations"));
      }
    } catch { toast.error("Failed to remove conversation"); } finally {
      setIsProcessing(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="w-[280px] flex flex-col shrink-0 bg-[#0d1117] border-r border-slate-800/60 z-20">

      {/* ════════════════════════════════════════
          HEADER
      ════════════════════════════════════════ */}
      <div className="h-[58px] px-4 flex items-center justify-between border-b border-slate-800/60 bg-[#0d1117] shrink-0">
        <h2 className="font-semibold text-[13px] text-slate-200 truncate tracking-tight">
          {isDMView ? "Messages" : activeWorkspace?.name}
        </h2>

        {isDMView && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/70 transition-all cursor-pointer" title="New Message">
                <MessageSquarePlus className="w-4.5 h-4.5" />
              </button>
            </DialogTrigger>

            {/* ── New Message Modal ── */}
            <DialogContent className="w-[440px] max-w-[95vw] bg-[#0d1117] border border-slate-700/60 text-slate-200 rounded-2xl shadow-2xl shadow-black/50 p-0 overflow-hidden">
              <div className="relative">
                {/* Glow accents */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[15px] font-bold text-slate-100 tracking-tight">New Message</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Start a conversation with a member</p>
                </div>

                {/* Search */}
                <div className="px-5 pt-4 pb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email…"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#161f2e] border border-slate-700/50 rounded-xl text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="px-5 pb-5 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {isSearching || isLoadingFollows ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : searchQuery.trim() ? (
                    searchResults.length === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-sm">No users found</div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Search Results</p>
                        <div className="space-y-0.5">
                          {searchResults.map((u: any) => (
                            <UserRow key={u.userId} userItem={u} isOnline={onlineUsers.includes(Number(u.userId))} onClick={() => startChat(u.userId)} />
                          ))}
                        </div>
                      </div>
                    )
                  ) : followedUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-sm leading-relaxed">
                      You're not following anyone yet.<br />Search to find members.
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Your Connections</p>
                      <div className="space-y-0.5">
                        {followedUsers.map((u: any) => (
                          <UserRow key={u.userId} userItem={u} isOnline={onlineUsers.includes(Number(u.userId))} onClick={() => startChat(u.userId)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ════════════════════════════════════════
          LIST AREA
      ════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : isDMView ? (
          /* ── Direct Messages ── */
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center border border-slate-700/40">
                <MessageSquarePlus className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">No messages yet</p>
                <p className="text-xs text-slate-600">Start a conversation with a member</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 rounded-lg transition-all hover:bg-blue-500/5 cursor-pointer"
              >
                New Message
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-0.5">
              {conversations.map((conv: any) => {
                const other = getOtherParticipant(conv);
                const isSelected = conv.conversationId === activeConvId;
                const name = other?.fullName || "Unknown";
                const lastMsg = conv.lastMessage;
                const isOnline = other?.userId ? onlineUsers.includes(Number(other.userId)) : false;

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => setActiveConvId(conv.conversationId)}
                    className={`group/item relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-slate-700/50 shadow-sm"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Avatar with online dot (ONLY if currently online) */}
                    <div className="relative shrink-0">
                      <Avatar
                        src={other?.profileUrl}
                        fallback={name[0] || "U"}
                        size="sm"
                        className="w-10 h-10 rounded-full ring-1 ring-slate-700/40 shadow-sm"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-[2px] ring-[#0d1117] shadow-sm animate-pulse" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1 mb-0.5">
                        <span className={`text-[13px] font-semibold truncate ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                          {name}
                        </span>
                        {lastMsg?.createdAt && (
                          <span className="text-[10px] text-slate-600 shrink-0">{relativeTime(lastMsg.createdAt)}</span>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="text-[11px] text-slate-600 truncate leading-tight">
                          {lastMsg.content || ""}
                        </p>
                      )}
                    </div>

                    {/* Action icons on hover */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover/item:flex items-center gap-1 bg-[#0d1117]/90 rounded-lg px-1 py-1 border border-slate-700/40">
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmClearId(conv.conversationId); }}
                        title="Clear history"
                        className="p-1 text-slate-500 hover:text-amber-400 hover:bg-slate-700/60 rounded transition-all cursor-pointer"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(conv.conversationId); }}
                        title="Remove conversation"
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Channel List ── */
          channels.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-600">No channels available</div>
          ) : (
            <div className="px-2 space-y-5 pt-2">
              {/* Text channels */}
              {channels.filter((c: any) => c.type === "TEXT").length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">
                    Text Channels
                  </p>
                  <div className="space-y-0.5">
                    {channels.filter((c: any) => c.type === "TEXT").map((ch: any) => {
                      const isSel = ch.channelId === activeChannelId;
                      return (
                        <div
                          key={ch.channelId}
                          onClick={() => setActiveChannelId(ch.channelId)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                            isSel
                              ? "bg-slate-700/50 text-slate-100 shadow-sm"
                              : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                          }`}
                        >
                          <Hash className={`w-4 h-4 shrink-0 ${isSel ? "text-blue-400" : "opacity-60"}`} />
                          <span className="text-[13px] font-medium truncate">
                            {ch.name.toLowerCase().replace(/\s+/g, "-")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Voice channels */}
              {channels.filter((c: any) => c.type === "VOICE").length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">
                    Voice Channels
                  </p>
                  <div className="space-y-0.5">
                    {channels.filter((c: any) => c.type === "VOICE").map((ch: any) => (
                      <div
                        key={ch.channelId}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 cursor-not-allowed opacity-60"
                      >
                        <Volume2 className="w-4 h-4 shrink-0" />
                        <span className="text-[13px] font-medium truncate">{ch.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* ── Confirm Dialogs ── */}
      <ConfirmDialog
        isOpen={!!confirmClearId}
        onClose={() => setConfirmClearId(null)}
        onConfirm={() => confirmClearId && handleClearChat(confirmClearId)}
        title="Clear Chat History?"
        description="All messages in this conversation will be cleared. This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        destructive
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDeleteChat(confirmDeleteId)}
        title="Remove Conversation?"
        description="This conversation will be hidden from your sidebar. You can message this user again anytime."
        confirmText="Remove"
        cancelText="Cancel"
        destructive
        isLoading={isProcessing}
      />
    </div>
  );
};

/* ─── Reusable User Row ──────────────────────────────────────────── */
const UserRow = ({ userItem, isOnline, onClick }: any) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all group"
  >
    <div className="relative shrink-0">
      <Avatar
        src={userItem.profileUrl}
        fallback={userItem.fullName?.[0] || "U"}
        className="w-9 h-9 rounded-full ring-1 ring-slate-700/50"
      />
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-[2px] ring-[#0d1117]" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
        {userItem.fullName}
      </div>
      <div className="text-[11px] text-slate-500 truncate">
        @{userItem.userName}{userItem.role?.roleName ? ` · ${userItem.role.roleName}` : ""}
      </div>
    </div>
    <div className="text-[10px] font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      Message →
    </div>
  </div>
);

export default ChannelSidebar;
