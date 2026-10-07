import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Hash, Users, ShieldCheck, LockKeyhole,
  MoreHorizontal, Pencil, Trash2, CheckCheck, Check, Reply,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
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
    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 border-[var(--border-default)]">
      {avatarUrl
        ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
        : <div className="w-full h-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[11px] font-bold text-[var(--text-secondary)]">{name?.[0]?.toUpperCase() ?? "?"}</div>}
    </div>
    <div className="relative flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg rounded-bl-[4px] px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-[6px] h-[6px] rounded-full bg-[var(--bg-surface-2)] block"
          style={{ animation: "typingDot 1.3s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  </div>
);

/* ── Empty pane ──────────────────────────────────────────────────── */
const EmptyPane = ({ icon: Icon, title, subtitle, onBack }: any) => (
  <div className="relative min-w-0 flex-1 flex flex-col items-center justify-center p-4 bg-[var(--bg-surface)]">
    <button onClick={onBack} title="Back to conversations" aria-label="Back to conversations" className="absolute left-2 top-2 md:hidden p-2 rounded-lg hover:bg-[var(--bg-surface-2)]"><ArrowLeft className="w-5 h-5" /></button>
    <div className="flex flex-col items-center gap-5 max-w-[260px] text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-lg bg-[var(--bg-surface-2)] flex items-center justify-center">
          <Icon className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
      </div>
      <div>
        <h2 className="text-[16px] font-bold text-[var(--text-primary)] mb-1.5 tracking-normal">{title}</h2>
        <p className="text-[12.5px] text-[var(--text-muted)] leading-relaxed">{subtitle}</p>
      </div>
    </div>
  </div>
);

/* ── ChatArena Component (Authentic Apple iMessage Sharp Tails) ──── */
const ChatArena = ({
  isDMView, activeConv, activeChannel, onBack,
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
  const [replyTarget, setReplyTarget] = useState<any>(null);
  const chatKey = `${isDMView ? "dm" : "channel"}-${isDMView ? activeConv?.conversationId : activeChannel?.channelId}`;
  const isMyChat = !isDMView || !!activeConv?.participants?.some((p: any) => Number(p.userId) === Number(user.userId));
  const inputDisabled = isDMView && !isMyChat;
  const isAdminReview = isAdmin && inputDisabled;
  useEffect(() => { setReplyTarget(null); setEditId(null); setDeleteTarget(null); }, [chatKey]);
  useEffect(() => {
    if (replyTarget) setReplyTarget(messages.find((m: any) => m.messageId === replyTarget.messageId) || null);
  }, [messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    if (!isDMView || !isMyChat || !emitReadReceipt || !messages.length) return;
    const ids = messages.filter((m: any) => m.sender?.userId !== user.userId && !m.isRead).map((m: any) => m.messageId);
    if (ids.length) emitReadReceipt(ids);
  }, [messages, isDMView, isMyChat, emitReadReceipt, user.userId]);

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
  if (isDMView && !activeConv) return <EmptyPane onBack={onBack} icon={Users} title="Messages" subtitle="No conversation selected." />;
  if (!isDMView && !activeChannel) return <EmptyPane onBack={onBack} icon={Hash} title="Channels" subtitle="No channel selected." />;

  /* Participant & Online state */
  const other = isDMView ? getOtherParticipant(activeConv) : null;
  const isOnline = other?.userId ? onlineUsers.includes(Number(other.userId)) : false;
  const chatTitle = isDMView ? (isAdminReview ? activeConv.participants.map((p: any) => p.user?.fullName || "Unknown").join(" & ") : other?.fullName || "Unknown") : activeChannel.name;
  const avatarUrl = other?.profileUrl ?? null;
  const avatarFallback = chatTitle[0]?.toUpperCase() || "U";
  const channelSlug = chatTitle.toLowerCase().replace(/\s+/g, "-");
  const inputPlaceholder = inputDisabled ? "Read only" : isDMView ? "Message" : `Message #${channelSlug}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[var(--bg-surface)]">

      {/* ══════ APPLE GLASSHOUSE HEADER ════════════════════════════ */}
      <div className="h-14 px-2 sm:px-4 flex items-center gap-2 shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
        <button onClick={onBack} title="Back to conversations" aria-label="Back to conversations" className="md:hidden p-2 shrink-0 rounded-lg hover:bg-[var(--bg-surface-2)]"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {isAdminReview ? <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5" /></div> : isDMView ? (
            <div className="relative shrink-0">
              <div className="w-9.5 h-9.5 rounded-full overflow-hidden ring-2 border-[var(--border-default)]">
                {avatarUrl
                  ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[14px] font-bold text-[var(--text-primary)]">{avatarFallback}</div>
                }
              </div>
              {/* Online indicator dot: ONLY IF ACTIVE ONLINE */}
              {isOnline && (
                <span className="absolute -bottom-px -right-px w-3 h-3 rounded-full bg-emerald-500 border-[2.5px] border-[var(--bg-surface)] animate-pulse" />
              )}
            </div>
          ) : (
            <div className="w-9.5 h-9.5 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
          )}
          <div className="min-w-0">
            <div title={chatTitle} className="text-[14px] font-bold text-[var(--text-primary)] truncate leading-snug tracking-normal">
              {isDMView ? chatTitle : `#${channelSlug}`}
            </div>
            <div className="text-[11px] leading-snug truncate mt-0.5 font-medium">
              {isAdminReview ? <span className="text-[var(--accent-primary)]">Admin view · Read only</span> : isDMView
                ? isTyping
                  ? <span className="text-[var(--text-secondary)] font-semibold">typing…</span>
                  : isOnline
                    ? <span className="text-[var(--text-secondary)]">Active now</span>
                    : <span className="text-[var(--text-muted)]">Offline</span>
                : <span className="text-[var(--text-muted)]">{activeChannel.description || "No description"}</span>
              }
            </div>
          </div>
        </div>

      </div>

      {isAdminReview && <div className="flex items-start gap-3 px-4 py-3 bg-[var(--accent-primary-subtle)] border-b border-[var(--accent-primary-border)]">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent-primary)]" />
        <div className="min-w-0 text-xs leading-relaxed">
          <p className="font-semibold text-[var(--text-primary)]">Viewing other members’ conversation</p>
          <p className="text-[var(--text-secondary)] [overflow-wrap:anywhere]">{chatTitle}. You can read this chat, but cannot send messages or change its history.</p>
        </div>
      </div>}

      {/* ══════ APPLE IMESSAGE FEED ════════════════════════════════ */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-1 sm:px-4 bg-[var(--bg-base)]">

        {isDMView && messages.length === 0 && <div className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">{isAdminReview ? "No messages in this conversation." : "Start the conversation with a message."}</div>}

        {/* Channel welcome */}
        {!isDMView && messages.length === 0 && (
          <div className="min-w-0 px-4 py-6 text-center flex flex-col items-center [overflow-wrap:anywhere]">
            <div className="w-16 h-16 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-default)] flex items-center justify-center mb-4">
              <Hash className="w-7 h-7 text-[var(--text-secondary)]" />
            </div>
            <h1 className="max-w-full text-lg font-semibold text-[var(--text-primary)] mb-1">#{channelSlug}</h1>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-sm">
              {activeChannel.description || `Welcome to #${channelSlug}. Start the discussion.`}
            </p>
            <div className="mt-8 h-px w-full max-w-md bg-[var(--bg-surface-2)]" />
          </div>
        )}

        {/* Messages list */}
        <div className="py-4 max-w-5xl mx-auto">
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
            const sentCorners = isLast ? "rounded-lg rounded-br-[4px]" : "rounded-lg rounded-br-[6px]";
            const recvCorners = isLast ? "rounded-lg rounded-bl-[4px]" : "rounded-lg rounded-bl-[6px]";

            return (
              <div key={msg.messageId ?? idx}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center my-6 select-none">
                    <span className="text-[10px] font-bold uppercase tracking-normal text-[var(--text-muted)] px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      {dateLabel}
                    </span>
                  </div>
                )}

                {/* Message row */}
                <div className={`group/row flex items-end px-3 transition-colors hover:bg-[var(--bg-surface-2)] rounded-lg ${isFirst ? "mt-4" : "mt-[3px]"} ${isOwn ? "flex-row-reverse gap-2" : "flex-row gap-2"}`}>

                  {/* Avatar slot (only on final message of a cluster) */}
                  <div className="w-8 shrink-0 self-end pb-0.5">
                    {isLast && (
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 border-[var(--border-default)]">
                        {isOwn
                          ? (user.profileUrl
                            ? <img src={user.profileUrl} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[12px] font-bold text-[var(--text-primary)]">{user.fullName?.[0]?.toUpperCase() ?? "U"}</div>)
                          : (msg.sender?.profileUrl
                            ? <img src={msg.sender.profileUrl} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[12px] font-bold text-[var(--text-primary)]">{msg.sender?.fullName?.[0]?.toUpperCase() ?? "U"}</div>)
                        }
                      </div>
                    )}
                  </div>

                  {/* Bubble & content */}
                  <div className={`flex min-w-0 flex-col max-w-[calc(100%-2.5rem)] sm:max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    {/* Sender name for received first message in cluster */}
                    {!isOwn && isFirst && (
                      <div className="flex min-w-0 flex-wrap items-baseline gap-2 mb-1 ml-1 [overflow-wrap:anywhere]">
                        <span className="text-[12px] font-bold text-[var(--text-secondary)] tracking-normal leading-none">{msg.sender?.fullName}</span>
                        <span className="text-[10px] text-[var(--text-muted)] leading-none">{fmtTime(msg.createdAt)}</span>
                      </div>
                    )}

                    <div className={`flex items-center gap-1.5 w-full ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {/* 3-dot dropdown menu for own messages */}
                      {!inputDisabled && Number.isInteger(msg.messageId) && !isEditing && (
                        <div className="self-center shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button title="Message actions" aria-label="Message actions" className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align={isOwn ? "end" : "start"}
                              sideOffset={8}
                              className="min-w-[160px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-1.5 z-50"
                            >
                              <DropdownMenuItem onClick={() => setReplyTarget(msg)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] cursor-pointer text-[12.5px] font-medium">
                                <Reply className="w-3.5 h-3.5 text-emerald-500 shrink-0" />Reply
                              </DropdownMenuItem>
                              {isOwn && <>
                              <DropdownMenuItem
                                onClick={() => startEdit(msg)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-primary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] cursor-pointer text-[12.5px] font-medium"
                              >
                                <Pencil className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-[var(--bg-surface-2)]" />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(msg)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/[0.12] cursor-pointer text-[12.5px] font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                Delete
                              </DropdownMenuItem>
                              </>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {/* ── Apple iMessage Bubble with Authentic Sharp Tail ── */}
                      <div className={`relative min-w-0 max-w-full transition-colors duration-150
                        ${isOwn
                          ? `bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] text-[var(--text-primary)] ${sentCorners}`
                          : `bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] ${recvCorners}`
                        }`}
                      >

                        <div className={`px-4 ${isEditing ? "pt-3 pb-2.5" : "pt-2.5 pb-2"}`}>
                          {msg.replyToId && (
                            <div className="mb-2 min-w-0 border-l-2 border-emerald-500 bg-[var(--bg-input)] rounded-r-md px-2 py-1.5 text-xs [overflow-wrap:anywhere]">
                              <p className="font-semibold text-[var(--text-secondary)]">{msg.replyTo?.isDeleted || !msg.replyTo ? "Original message unavailable" : msg.replyTo.sender?.fullName || "Message"}</p>
                              {msg.replyTo && !msg.replyTo.isDeleted && <p className="text-[var(--text-muted)] line-clamp-2 whitespace-pre-wrap">{msg.replyTo.content}</p>}
                            </div>
                          )}

                          {/* Edit mode */}
                          {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-0 w-56 max-w-full">
                              <input
                                ref={editRef}
                                type="text"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveEdit(msg); if (e.key === "Escape") cancelEdit(); }}
                                aria-label="Edit message"
                                className="w-full min-w-0 bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3 py-2 rounded-lg border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                              />
                              <div className="flex items-center justify-end">
                                <div className="flex gap-3">
                                  <button onClick={cancelEdit} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">Cancel</button>
                                  <button onClick={() => saveEdit(msg)} className="text-[11px] font-bold text-[var(--text-primary)] hover:text-[var(--text-secondary)] cursor-pointer">Save</button>
                                </div>
                              </div>
                            </div>

                          ) : msg.type === "CODE_SNIPPET" ? (
                            <pre className="bg-[var(--bg-surface-2)] rounded-lg p-3 overflow-x-auto font-mono text-xs border border-[var(--border-default)] my-1">
                              <code className="text-[var(--text-secondary)]">{msg.content}</code>
                            </pre>

                          ) : (
                            <div className="text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap text-[var(--text-primary)] [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_img]:max-w-full">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}

                          {/* Meta timestamp & read receipts */}
                          {!isEditing && (
                            <div className={`flex items-center gap-1 mt-1 select-none ${isOwn ? "justify-end" : "justify-end"}`}>
                              {msg.isEdited && (
                                <span className={`text-[9.5px] italic ${isOwn ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]"}`}>edited</span>
                              )}
                              <span className={`text-[10px] ${isOwn ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>{fmtTime(msg.createdAt)}</span>
                              {isOwn && (
                                msg.isRead
                                  ? <CheckCheck className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                                  : <Check className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
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
        {isTyping && isDMView && !inputDisabled && (
          <TypingBubble
            avatarUrl={getOtherParticipant(activeConv)?.profileUrl}
            name={getOtherParticipant(activeConv)?.fullName}
          />
        )}
        <div ref={endRef} className="h-4" />
      </div>

      {/* ══════ APPLE INPUT BAR ═════════════════════════════════════ */}
      <div className="border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        {inputDisabled ? <div className="flex items-center justify-center gap-2 px-4 py-5 text-xs text-[var(--text-muted)]"><LockKeyhole className="w-4 h-4 shrink-0" />Read-only conversation · Only participants can reply</div> : <ChatInput key={chatKey} onSendMessage={onSendMessage} placeholder={inputPlaceholder} emitTyping={onTyping} replyTarget={replyTarget} onCancelReply={() => setReplyTarget(null)} />}
      </div>

      {/* ══════ DELETE CONFIRMATION ═════════════════════════════════ */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete message?"
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

export default ChatArena;
