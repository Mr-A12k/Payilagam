import { useEffect, useRef, useState } from "react";
import {
  Hash, Users, PhoneCall, Video, Search, Info,
  MoreHorizontal, Pencil, Trash2, CheckCheck, Check, Sparkles,
} from "lucide-react";
import {
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useSocketContext } from "@/context/SocketContext";
import ChatInput from "./ChatInput";
import ReactMarkdown from "react-markdown";

/* ── Helpers ─────────────────────────────────────────────────────── */
const getDateLabel = (d: string) => {
  if (!d) return "";
  try {
    const date = new Date(d);
    const today = new Date();
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  } catch { return ""; }
};
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ── Typing indicator bubble ─────────────────────────────────────── */
const TypingBubble = ({ avatarUrl, name }: { avatarUrl?: string; name?: string }) => (
  <div className="flex items-end gap-2.5 px-5 py-2">
    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10 shadow-sm">
      {avatarUrl
        ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
        : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300">{name?.[0]?.toUpperCase() ?? "?"}</div>}
    </div>
    <div className="relative flex items-center gap-1.5 bg-[#1c2333] border border-white/[0.08] rounded-[20px] rounded-bl-[4px] px-4 py-3 shadow-md">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-[6px] h-[6px] rounded-full bg-slate-400 block"
          style={{ animation: "typingDot 1.3s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
      ))}
      <svg className="absolute -left-[6px] bottom-0 w-[10px] h-[15px] text-[#1c2333] fill-current pointer-events-none" viewBox="0 0 10 15">
        <path d="M10,0 C8,4 5,9 0,15 C6,15 10,10 10,5 Z" />
      </svg>
    </div>
  </div>
);

/* ── Empty pane ──────────────────────────────────────────────────── */
const EmptyPane = ({ icon: Icon, title, subtitle }: any) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-[#070a12] border-l border-white/[0.05]">
    <div className="flex flex-col items-center gap-5 max-w-[260px] text-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-slate-800/90 to-slate-900 border border-white/[0.08] flex items-center justify-center shadow-2xl">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-[#070a12]">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <div>
        <h2 className="text-[16px] font-bold text-slate-100 mb-1.5 tracking-tight">{title}</h2>
        <p className="text-[12.5px] text-slate-500 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  </div>
);

/* ── ChatArena Component (Authentic Apple iMessage Sharp Tails) ──── */
const ChatArena = ({
  isDMView, activeConv, activeChannel,
  messages, user, isAdmin, getOtherParticipant,
  isTyping, onSendMessage, onTyping, emitReadReceipt,
  onEditMessage, onDeleteMessage, onEditChannelMessage, onDeleteChannelMessage,
}: any) => {
  const { onlineUsers } = useSocketContext();
  const endRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    if (!isDMView || !emitReadReceipt || !messages.length) return;
    const ids = messages.filter((m: any) => m.sender?.userId !== user.userId && !m.isRead).map((m: any) => m.messageId);
    if (ids.length) emitReadReceipt(ids);
  }, [messages, isDMView, emitReadReceipt, user.userId]);

  useEffect(() => { if (editId) setTimeout(() => editRef.current?.focus(), 60); }, [editId]);

  const startEdit = (msg: any) => { setEditId(msg.messageId); setEditText(msg.content); };
  const cancelEdit = () => { setEditId(null); setEditText(""); };
  const saveEdit = (msg: any) => {
    if (!editText.trim()) return;
    isDMView ? onEditMessage?.(msg.messageId, editText) : onEditChannelMessage?.(msg.messageId, editText);
    cancelEdit();
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try { isDMView ? onDeleteMessage?.(deleteTarget.messageId) : onDeleteChannelMessage?.(deleteTarget.messageId); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  /* Empty states */
  if (isDMView && !activeConv) return <EmptyPane icon={Users} title="iMessage" subtitle="Select a conversation or start a new message to chat with mentors and peers." />;
  if (!isDMView && !activeChannel) return <EmptyPane icon={Hash} title="Select a Channel" subtitle="Choose a channel from the sidebar to collaborate with your workspace." />;

  /* Participant & Online state */
  const other = isDMView ? getOtherParticipant(activeConv) : null;
  const isOnline = other?.userId ? onlineUsers.includes(Number(other.userId)) : false;
  const chatTitle = isDMView ? (other?.fullName || "Unknown") : activeChannel.name;
  const avatarUrl = other?.profileUrl ?? null;
  const avatarFallback = chatTitle[0]?.toUpperCase() || "U";
  const isMyChat = isDMView ? activeConv?.participants?.some((p: any) => p.userId === user.userId) : true;
  const channelSlug = chatTitle.toLowerCase().replace(/\s+/g, "-");
  const inputDisabled = isAdmin && !isMyChat && isDMView;
  const inputPlaceholder = inputDisabled ? "Admins cannot reply to this chat…" : isDMView ? `iMessage` : `Message #${channelSlug}`;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#070a12] border-l border-white/[0.05] chat-font">

      {/* ══════ APPLE GLASSHOUSE HEADER ════════════════════════════ */}
      <div className="h-[60px] px-6 flex items-center justify-between shrink-0 bg-[#0c101d]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          {isDMView ? (
            <div className="relative shrink-0">
              <div className="w-9.5 h-9.5 rounded-full overflow-hidden ring-2 ring-white/[0.1] shadow-md">
                {avatarUrl
                  ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[14px] font-bold text-white">{avatarFallback}</div>
                }
              </div>
              {/* Online indicator dot: ONLY IF ACTIVE ONLINE */}
              {isOnline && (
                <span className="absolute -bottom-px -right-px w-3 h-3 rounded-full bg-emerald-500 border-[2.5px] border-[#0c101d] shadow-sm animate-pulse" />
              )}
            </div>
          ) : (
            <div className="w-9.5 h-9.5 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-blue-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-slate-100 truncate leading-snug tracking-tight">
              {isDMView ? chatTitle : `#${channelSlug}`}
            </div>
            <div className="text-[11px] leading-snug truncate mt-0.5 font-medium">
              {isDMView
                ? isTyping
                  ? <span className="text-emerald-400 font-semibold">typing…</span>
                  : isOnline
                    ? <span className="text-emerald-400">Active now</span>
                    : <span className="text-slate-500">Offline</span>
                : <span className="text-slate-500">{activeChannel.description || "No description"}</span>
              }
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {isDMView && <>
            <HdrBtn icon={PhoneCall} label="Voice Call" />
            <HdrBtn icon={Video} label="FaceTime Video" />
          </>}
          <HdrBtn icon={Search} label="Search Chat" />
          <HdrBtn icon={Info} label="Details" />
        </div>
      </div>

      {/* ══════ APPLE IMESSAGE FEED ════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth px-2">

        {/* Channel welcome */}
        {!isDMView && messages.length === 0 && (
          <div className="px-6 pt-10 pb-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mb-4 shadow-xl">
              <Hash className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mb-1">#{channelSlug}</h1>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">
              {activeChannel.description || `Welcome to #${channelSlug}. Start the discussion.`}
            </p>
            <div className="mt-8 h-px w-full max-w-md bg-white/[0.06]" />
          </div>
        )}

        {/* Messages list */}
        <div className="py-4">
          {messages.map((msg: any, idx: number) => {
            const isOwn = msg.sender?.userId === user.userId;
            const prev = messages[idx - 1];
            const next = messages[idx + 1];
            const sameAsPrev = prev?.sender?.userId === msg.sender?.userId;
            const sameAsNext = next?.sender?.userId === msg.sender?.userId;
            const isFirst = !sameAsPrev;
            const isLast = !sameAsNext;
            const isEditing = editId === msg.messageId;

            const dateLabel = getDateLabel(msg.createdAt);
            const prevLabel = idx > 0 ? getDateLabel(messages[idx - 1].createdAt) : null;
            const showDate = dateLabel && dateLabel !== prevLabel;

            /* Apple iMessage message grouping rounded corners */
            const sentCorners = isLast ? "rounded-[20px] rounded-br-[4px]" : "rounded-[20px] rounded-br-[6px]";
            const recvCorners = isLast ? "rounded-[20px] rounded-bl-[4px]" : "rounded-[20px] rounded-bl-[6px]";

            return (
              <div key={msg.messageId ?? idx}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center my-6 select-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] shadow-sm">
                      {dateLabel}
                    </span>
                  </div>
                )}

                {/* Message row */}
                <div className={`group/row flex items-end px-3 transition-colors hover:bg-white/[0.01] rounded-xl ${isFirst ? "mt-4" : "mt-[3px]"} ${isOwn ? "flex-row-reverse gap-2" : "flex-row gap-2"}`}>

                  {/* Avatar slot (only on final message of a cluster) */}
                  <div className="w-8 shrink-0 self-end pb-0.5">
                    {isLast && (
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 shadow-sm">
                        {isOwn
                          ? (user.profileUrl
                            ? <img src={user.profileUrl} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[12px] font-bold text-white">{user.fullName?.[0]?.toUpperCase() ?? "U"}</div>)
                          : (msg.sender?.profileUrl
                            ? <img src={msg.sender.profileUrl} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-[12px] font-bold text-white">{msg.sender?.fullName?.[0]?.toUpperCase() ?? "U"}</div>)
                        }
                      </div>
                    )}
                  </div>

                  {/* Bubble & content */}
                  <div className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
                    {/* Sender name for received first message in cluster */}
                    {!isOwn && isFirst && (
                      <div className="flex items-baseline gap-2 mb-1 ml-1">
                        <span className="text-[12px] font-bold text-emerald-400 tracking-tight leading-none">{msg.sender?.fullName}</span>
                        <span className="text-[10px] text-slate-500 leading-none">{fmtTime(msg.createdAt)}</span>
                      </div>
                    )}

                    <div className={`flex items-center gap-1.5 w-full ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {/* 3-dot dropdown menu for own messages */}
                      {isOwn && !isEditing && (
                        <div className="opacity-0 group-hover/row:opacity-100 transition-all duration-150 self-center shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align={isOwn ? "end" : "start"}
                              sideOffset={8}
                              className="min-w-[160px] bg-[#1a1f2c] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/80 p-1.5 z-50"
                            >
                              <DropdownMenuItem
                                onClick={() => startEdit(msg)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/[0.08] cursor-pointer text-[12.5px] font-medium"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-white/[0.08]" />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(msg)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/[0.12] cursor-pointer text-[12.5px] font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {/* ── Apple iMessage Bubble with Authentic Sharp Tail ── */}
                      <div className={`relative min-w-[50px] shadow-md transition-all duration-150
                        ${isOwn
                          ? `bg-gradient-to-br from-[#007aff] to-[#0056d2] text-white ${sentCorners}`
                          : `bg-[#1c2333] border border-white/[0.08] text-[#f2f2f7] ${recvCorners}`
                        }`}
                      >
                        {/* Sharp SVG Tail for Sent Message */}
                        {isOwn && isLast && (
                          <svg className="absolute -right-[6px] bottom-0 w-[10px] h-[15px] text-[#0056d2] fill-current pointer-events-none" viewBox="0 0 10 15">
                            <path d="M0,0 C2,4 5,9 10,15 C4,15 0,10 0,5 Z" />
                          </svg>
                        )}

                        {/* Sharp SVG Tail for Received Message */}
                        {!isOwn && isLast && (
                          <svg className="absolute -left-[6px] bottom-0 w-[10px] h-[15px] text-[#1c2333] fill-current pointer-events-none" viewBox="0 0 10 15">
                            <path d="M10,0 C8,4 5,9 0,15 C6,15 10,10 10,5 Z" />
                          </svg>
                        )}

                        <div className={`px-4 ${isEditing ? "pt-3 pb-2.5" : "pt-2.5 pb-2"}`}>

                          {/* Edit mode */}
                          {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[220px]">
                              <input
                                ref={editRef}
                                type="text"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveEdit(msg); if (e.key === "Escape") cancelEdit(); }}
                                className="w-full bg-black/25 text-white text-[13.5px] px-3 py-2 rounded-xl border border-white/25 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50">Enter to save · Esc to cancel</span>
                                <div className="flex gap-3">
                                  <button onClick={cancelEdit} className="text-[11px] text-white/60 hover:text-white cursor-pointer">Cancel</button>
                                  <button onClick={() => saveEdit(msg)} className="text-[11px] font-bold text-white hover:text-blue-100 cursor-pointer">Save</button>
                                </div>
                              </div>
                            </div>

                          ) : msg.type === "CODE_SNIPPET" ? (
                            <pre className="bg-black/40 rounded-xl p-3 overflow-x-auto font-mono text-xs border border-white/10 my-1">
                              <code className="text-sky-300">{msg.content}</code>
                            </pre>

                          ) : (
                            <div className={`text-[14px] leading-relaxed break-words whitespace-pre-wrap ${isOwn ? "text-white" : "text-[#f2f2f7]"}`}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}

                          {/* Meta timestamp & read receipts */}
                          {!isEditing && (
                            <div className={`flex items-center gap-1 mt-1 select-none ${isOwn ? "justify-end" : "justify-end"}`}>
                              {msg.isEdited && (
                                <span className={`text-[9.5px] italic ${isOwn ? "text-white/40" : "text-slate-500"}`}>edited</span>
                              )}
                              <span className={`text-[10px] ${isOwn ? "text-blue-100/70" : "text-slate-500"}`}>{fmtTime(msg.createdAt)}</span>
                              {isOwn && (
                                msg.isRead
                                  ? <CheckCheck className="w-3.5 h-3.5 text-sky-200 shrink-0" />
                                  : <Check className="w-3.5 h-3.5 text-white/40 shrink-0" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing indicator */}
        {isTyping && isDMView && (
          <TypingBubble
            avatarUrl={getOtherParticipant(activeConv)?.profileUrl}
            name={getOtherParticipant(activeConv)?.fullName}
          />
        )}
        <div ref={endRef} className="h-4" />
      </div>

      {/* ══════ APPLE INPUT BAR ═════════════════════════════════════ */}
      <div className="border-t border-white/[0.06] bg-[#0c101d]/90 backdrop-blur-xl">
        <ChatInput onSendMessage={onSendMessage} disabled={inputDisabled} placeholder={inputPlaceholder} emitTyping={onTyping} />
      </div>

      {/* ══════ DELETE CONFIRMATION ═════════════════════════════════ */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete iMessage?"
        description="This message will be deleted for everyone in this conversation. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        isLoading={isDeleting}
      />

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ── Header button helper ────────────────────────────────────────── */
const HdrBtn = ({ icon: Icon, label }: any) => (
  <button title={label} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all cursor-pointer">
    <Icon className="w-[17px] h-[17px]" />
  </button>
);

export default ChatArena;
