import { useState, useEffect } from "react";
import { Search, Hash, Volume2, Loader2, X, Eraser, MessageSquarePlus, ShieldCheck, Users } from "lucide-react";
import { Avatar, Dialog, DialogContent, DialogTitle, DialogTrigger, ConfirmDialog } from "@/components/ui";
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
  isAdmin,
  user,
}: any) => {
  const { onlineUsers } = useSocketContext();
  const isDMView = activeWorkspaceId === null;
  const activeWorkspace = workspaces.find((w: any) => w.workspaceId === activeWorkspaceId);
  const channels = activeWorkspace?.channels || [];
  const [chatScope, setChatScope] = useState("mine");
  const [conversationSearch, setConversationSearch] = useState("");
  const isParticipant = (conv: any) => conv.participants?.some((p: any) => Number(p.userId) === Number(user.userId));
  const personalCount = conversations.filter(isParticipant).length;
  const visibleConversations = conversations.filter((conv: any) => {
    const matchesScope = !isAdmin || (chatScope === "mine" ? isParticipant(conv) : !isParticipant(conv));
    return matchesScope && conv.participants?.some((p: any) => p.user?.fullName?.toLowerCase().includes(conversationSearch.trim().toLowerCase()));
  });
  useEffect(() => {
    const selected = conversations.find((conv: any) => conv.conversationId === activeConvId);
    if (selected) setChatScope(isParticipant(selected) ? "mine" : "others");
  }, [activeConvId, conversations, user.userId]);

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
    <div className="min-w-0 min-h-0 w-0 flex-1 md:flex-none md:w-64 lg:w-80 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-default)] z-20">

      {/* ════════════════════════════════════════
          HEADER
      ════════════════════════════════════════ */}
      <div className="h-[58px] px-4 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
        <h2 className="font-semibold text-[13px] text-[var(--text-primary)] truncate tracking-normal">
          {isDMView ? "Messages" : activeWorkspace?.name}
        </h2>

        {isDMView && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-all cursor-pointer" title="New Message" aria-label="New message">
                <MessageSquarePlus className="w-4.5 h-4.5" />
              </button>
            </DialogTrigger>

            {/* ── New Message Modal ── */}
            <DialogContent aria-describedby={undefined} className="w-[calc(100%-2rem)] sm:max-w-[440px] max-h-[90dvh] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg p-0 overflow-y-auto">
              <div className="relative">

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-[var(--border-default)]">
                  <div className="flex items-center justify-between mb-1">
                    <DialogTitle className="text-base font-semibold text-[var(--text-primary)] pr-8">New message</DialogTitle>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">Start a conversation with a member</p>
                </div>

                {/* Search */}
                <div className="px-5 pt-4 pb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="text"
                      aria-label="Search members"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email…"
                      className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-[13px] text-[var(--text-primary)] placeholder-slate-600 focus:outline-none focus:border-[var(--border-default)] focus:ring-2 focus:ring-blue-500/10 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="px-5 pb-5 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {isSearching || isLoadingFollows ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--text-secondary)]" />
                    </div>
                  ) : searchQuery.trim() ? (
                    searchResults.length === 0 ? (
                      <div className="text-center py-8 text-[var(--text-muted)] text-sm">No users found</div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-normal text-[var(--text-muted)] mb-2">Search Results</p>
                        <div className="space-y-0.5">
                          {searchResults.map((u: any) => (
                            <UserRow key={u.userId} userItem={u} isOnline={onlineUsers.includes(Number(u.userId))} onClick={() => startChat(u.userId)} />
                          ))}
                        </div>
                      </div>
                    )
                  ) : followedUsers.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)] text-sm leading-relaxed">
                      You're not following anyone yet.<br />Search to find members.
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-normal text-[var(--text-muted)] mb-2">Your Connections</p>
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

      {isDMView && (
        <div className="px-3 py-3 space-y-3 border-b border-[var(--border-default)]">
          {isAdmin && <div className="flex gap-1 rounded-lg bg-[var(--bg-surface-2)] p-1" aria-label="Conversation scope">
            {[{ value: "mine", label: "My chats", count: personalCount }, { value: "others", label: "Other chats", count: conversations.length - personalCount }].map(scope => (
              <button key={scope.value} aria-pressed={chatScope === scope.value} onClick={() => { setChatScope(scope.value); setActiveConvId(null); }} className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] ${chatScope === scope.value ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)]"}`}>
                {scope.label} <span className="ml-1 opacity-70">{scope.count}</span>
              </button>
            ))}
          </div>}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
            <input aria-label="Search conversations" placeholder="Search conversations…" value={conversationSearch} onChange={e => setConversationSearch(e.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]" />
          </div>
          {isAdmin && chatScope === "others" && <p className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><ShieldCheck className="w-4 h-4 shrink-0 text-[var(--accent-primary)]" />Admin view · Read only</p>}
        </div>
      )}

      {/* ════════════════════════════════════════
          LIST AREA
      ════════════════════════════════════════ */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto custom-scrollbar py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : isDMView ? (
          /* ── Direct Messages ── */
          visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-surface-2)] flex items-center justify-center border border-[var(--border-default)]">
                <MessageSquarePlus className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{conversationSearch ? "No matching conversations" : "No conversations yet"}</p>
                <p className="text-xs text-[var(--text-muted)]">{conversationSearch ? "Try another name." : chatScope === "others" ? "Other members’ conversations will appear here." : "Start a conversation with a member."}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--border-default)] px-4 py-2 rounded-lg transition-all hover:bg-[var(--bg-surface-2)] cursor-pointer"
              >
                New Message
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-0.5">
              {visibleConversations.map((conv: any) => {
                const other = getOtherParticipant(conv);
                const isSelected = conv.conversationId === activeConvId;
                const isReview = isAdmin && !isParticipant(conv);
                const name = isReview ? conv.participants.map((p: any) => p.user?.fullName || "Unknown").join(" & ") : other?.fullName || "Unknown";
                const lastMsg = conv.lastMessage;
                const isOnline = other?.userId ? onlineUsers.includes(Number(other.userId)) : false;

                return (
                  <div
                    key={conv.conversationId}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open conversation with ${name}`}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setActiveConvId(conv.conversationId); } }}
                    onClick={() => setActiveConvId(conv.conversationId)}
                    className={`group/item relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-[var(--accent-primary-subtle)] ring-1 ring-inset ring-[var(--accent-primary-border)]"
                        : "hover:bg-[var(--bg-surface-2)]"
                    }`}
                  >
                    {/* Avatar with online dot (ONLY if currently online) */}
                    <div className="relative shrink-0">
                      <Avatar
                        src={isReview ? undefined : other?.profileUrl}
                        fallback={isReview ? <Users className="w-4 h-4" /> : name[0] || "U"}
                        size="sm"
                        className="w-10 h-10 rounded-full ring-1 ring-slate-700/40"
                      />
                      {!isReview && isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-[2px] ring-[var(--bg-surface)] animate-pulse" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1 mb-0.5">
                        <span className={`text-[13px] font-semibold truncate ${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                          <span title={name}>{name}</span>
                        </span>
                        {lastMsg?.createdAt && (
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0">{relativeTime(lastMsg.createdAt)}</span>
                        )}
                      </div>
                      {isReview && <p className="flex items-center gap-1 text-[10px] text-[var(--accent-primary)]"><ShieldCheck className="w-3 h-3" />Read only</p>}
                      {lastMsg && (
                        <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight">
                          {lastMsg.content || ""}
                        </p>
                      )}
                    </div>

                    {/* Action icons on hover */}
                    {!isReview && <div className="flex shrink-0 flex-col items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmClearId(conv.conversationId); }}
                        title="Clear history"
                        className="p-1 text-[var(--text-muted)] hover:text-amber-400 hover:bg-[var(--bg-surface-2)] rounded transition-all cursor-pointer"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(conv.conversationId); }}
                        title="Remove conversation"
                        className="p-1 text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-surface-2)] rounded transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Channel List ── */
          channels.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">No channels available</div>
          ) : (
            <div className="px-2 space-y-5 pt-2">
              {/* Text channels */}
              {channels.filter((c: any) => c.type === "TEXT").length > 0 && (
                <div>
                  <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-normal mb-1">
                    Text Channels
                  </p>
                  <div className="space-y-0.5">
                    {channels.filter((c: any) => c.type === "TEXT").map((ch: any) => {
                      const isSel = ch.channelId === activeChannelId;
                      return (
                        <div
                          key={ch.channelId}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSel}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveChannelId(ch.channelId); } }}
                          onClick={() => setActiveChannelId(ch.channelId)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                            isSel
                              ? "bg-[var(--bg-surface-2)] text-[var(--text-primary)] "
                              : "text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-secondary)]"
                          }`}
                        >
                          <Hash className={`w-4 h-4 shrink-0 ${isSel ? "text-[var(--text-secondary)]" : "opacity-60"}`} />
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
                  <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-normal mb-1">
                    Voice Channels
                  </p>
                  <div className="space-y-0.5">
                    {channels.filter((c: any) => c.type === "VOICE").map((ch: any) => (
                      <div
                        key={ch.channelId}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-muted)] cursor-not-allowed opacity-60"
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
  <button
    type="button"
    onClick={onClick}
    className="flex w-full min-w-0 text-left items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-surface-2)] cursor-pointer transition-all group"
  >
    <div className="relative shrink-0">
      <Avatar
        src={userItem.profileUrl}
        fallback={userItem.fullName?.[0] || "U"}
        className="w-9 h-9 rounded-full ring-1 ring-slate-700/50"
      />
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-[2px] ring-[var(--bg-surface)]" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
        {userItem.fullName}
      </div>
      <div className="text-[11px] text-[var(--text-muted)] truncate">
        @{userItem.userName}{userItem.role?.roleName ? ` · ${userItem.role.roleName}` : ""}
      </div>
    </div>
  </button>
);

export default ChannelSidebar;
