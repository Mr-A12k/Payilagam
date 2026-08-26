import { useState, useEffect, useRef } from "react";
import { ArrowUp, Smile, Paperclip } from "lucide-react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";

const ChatInput = ({ onSendMessage, disabled, placeholder, emitTyping }: any) => {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

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
  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message.trim());
    setMessage("");
    setShowEmoji(false);
    if (emitTyping) emitTyping(false);
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
    <div className="relative px-4 pb-4 pt-3 shrink-0 chat-font">
      {/* ── Emoji Picker Popup ── */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-full mb-2 left-4 z-50 shadow-2xl shadow-black/70 rounded-2xl overflow-hidden border border-white/10"
        >
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme={Theme.DARK}
            emojiStyle={EmojiStyle.NATIVE}
            searchPlaceholder="Search emoji…"
            skinTonesDisabled
            height={380}
            width={320}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* ── Apple iMessage Input Container ── */}
      <div
        className={`flex items-end gap-1.5 rounded-[22px] border transition-all duration-200 px-3 py-1.5 ${
          hasMessage && !disabled
            ? "border-blue-500/50 bg-[#161d2d] shadow-[0_0_0_3px_rgba(0,122,255,0.12)]"
            : "border-white/[0.12] bg-[#161d2d]/90 hover:border-white/20 focus-within:border-blue-500/50"
        }`}
      >
        {/* Attachment button */}
        <button
          disabled={disabled}
          title="Attach file"
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all shrink-0 self-end mb-1 cursor-pointer"
        >
          <Paperclip className="w-[18px] h-[18px]" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => { setMessage(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? (placeholder || "Read only…") : (placeholder || "iMessage")}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[14px] text-[#f2f2f7] placeholder-slate-500 resize-none focus:outline-none py-1.5 leading-relaxed custom-scrollbar max-h-[120px] overflow-y-auto font-medium"
        />

        {/* Emoji button */}
        <button
          ref={emojiButtonRef}
          disabled={disabled}
          onClick={() => setShowEmoji((v) => !v)}
          title="Emoji"
          className={`p-1.5 rounded-full transition-all shrink-0 self-end mb-1 cursor-pointer ${
            showEmoji
              ? "text-amber-400 bg-amber-400/10"
              : "text-slate-400 hover:text-amber-400 hover:bg-white/10"
          }`}
        >
          <Smile className="w-[18px] h-[18px]" />
        </button>

        {/* Apple Send Button (Iconic Circle with Arrow Up) */}
        <button
          onClick={handleSend}
          disabled={!hasMessage || disabled}
          title="Send iMessage"
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end mb-0.5 transition-all duration-200 ${
            hasMessage && !disabled
              ? "bg-[#007aff] hover:bg-[#0062e0] text-white shadow-lg shadow-blue-500/30 active:scale-90 cursor-pointer"
              : "bg-slate-800 text-slate-600 cursor-not-allowed opacity-40"
          }`}
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-1.5 select-none font-medium">
        Press Enter to send &nbsp;·&nbsp; Shift+Enter for line break
      </p>
    </div>
  );
};

export default ChatInput;
