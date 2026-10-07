import { useState, useEffect, useRef } from "react";
import { ArrowUp, Smile, Reply, X } from "lucide-react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import { useTheme } from "@/context/ThemeContext";

const ChatInput = ({ onSendMessage, disabled, placeholder, emitTyping, replyTarget, onCancelReply }: any) => {
  const { isLight } = useTheme();
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (replyTarget) textareaRef.current?.focus(); }, [replyTarget?.messageId]);

  /* ── typing indicator ── */
  useEffect(() => {
    if (!emitTyping) return;
    if (message.length > 0) emitTyping(true);
    const t = setTimeout(() => { if (emitTyping) emitTyping(false); }, 1500);
    return () => clearTimeout(t);
  }, [message, emitTyping]);

  /* ── close picker on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target as Node) &&
        !emojiButtonRef.current?.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── auto-resize ── */
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  /* ── send ── */
  const handleSend = async () => {
    if (!message.trim() || disabled || sending) return;
    setSending(true);
    let sent;
    try { sent = await onSendMessage(message.trim(), replyTarget); }
    finally { setSending(false); }
    if (sent === false) return;
    setMessage("");
    onCancelReply?.();
    setShowEmoji(false);
    if (emitTyping) emitTyping(false);
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onCancelReply?.(); setShowEmoji(false); }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── emoji pick ── */
  const onEmojiClick = (emojiData: any) => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? message.length;
      const end = el.selectionEnd ?? message.length;
      const next = message.slice(0, start) + emojiData.emoji + message.slice(end);
      setMessage(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + emojiData.emoji.length;
        el.setSelectionRange(pos, pos);
        autoResize();
      });
    } else {
      setMessage((m) => m + emojiData.emoji);
    }
  };

  const hasMessage = message.trim().length > 0;

  return (
    <div className="relative min-w-0 p-2 sm:p-3 shrink-0">
      {replyTarget && (
        <div className="mb-2 flex min-w-0 items-center gap-2 border-l-2 border-emerald-500 bg-[var(--bg-surface-2)] px-3 py-2 rounded-r-md">
          <Reply className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-semibold text-[var(--text-primary)] truncate">{replyTarget.sender?.fullName || "Message"}</p>
            <p className="text-[var(--text-muted)] truncate">{replyTarget.content}</p>
          </div>
          <button type="button" onClick={onCancelReply} title="Cancel reply" aria-label="Cancel reply" className="w-7 h-7 flex items-center justify-center shrink-0 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"><X className="w-4 h-4" /></button>
        </div>
      )}
      {/* ── Emoji Picker Popup ── */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-full mb-2 left-2 right-2 sm:right-auto sm:w-80 z-50 rounded-lg overflow-hidden border border-[var(--border-default)]"
        >
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme={isLight ? Theme.LIGHT : Theme.DARK}
            emojiStyle={EmojiStyle.NATIVE}
            searchPlaceholder="Search emoji…"
            skinTonesDisabled
            height="min(380px, 55dvh)"
            width="100%"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* ── Apple iMessage Input Container ── */}
      <div
        className="flex min-w-0 items-end gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] focus-within:border-[var(--border-focus)] px-2 py-1.5"
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => { setMessage(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          aria-label="Message"
          placeholder={disabled ? (placeholder || "Read only…") : (placeholder || "Message")}
          disabled={disabled || sending}
          rows={1}
          className="flex-1 min-w-0 w-0 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none !border-0 !outline-none !ring-0 !shadow-none px-1 py-1.5 leading-6 custom-scrollbar max-h-[120px] overflow-y-auto"
        />

        {/* Emoji button */}
        <button
          ref={emojiButtonRef}
          disabled={disabled || sending}
          onClick={() => setShowEmoji((v) => !v)}
          title="Emoji"
          aria-label="Choose emoji"
          aria-expanded={showEmoji}
          className={`p-1.5 rounded-full transition-all shrink-0 self-end mb-1 cursor-pointer ${
            showEmoji
              ? "text-amber-400 bg-amber-400/10"
              : "text-amber-500 hover:text-amber-400 hover:bg-[var(--bg-surface-2)]"
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Apple Send Button (Iconic Circle with Arrow Up) */}
        <button
          onClick={handleSend}
          disabled={!hasMessage || disabled || sending}
          title="Send message"
          aria-label="Send message"
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end mb-0.5 transition-all duration-200 ${
            hasMessage && !disabled && !sending
              ? "bg-[var(--action-bg)] text-[var(--action-text)] hover:bg-[var(--action-hover)] cursor-pointer"
              : "bg-[var(--bg-surface-2)] text-[var(--text-muted)] cursor-not-allowed opacity-40"
          }`}
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};

export default ChatInput;
