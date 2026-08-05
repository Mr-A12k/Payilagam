import { Send } from "lucide-react";
import { useState, useEffect } from "react";

const ChatInput = ({
  onSendMessage,
  disabled,
  placeholder,
  emitTyping,
}: any) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!emitTyping) return;

    if (message.length > 0) {
      emitTyping(true);
    }

    const timeout = setTimeout(() => {
      if (emitTyping) emitTyping(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [message, emitTyping]);

  const handleSubmit = (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (!message.trim() || disabled) return;

    onSendMessage(message);
    setMessage("");
    if (emitTyping) emitTyping(false);
  };

  return (
    <div className="px-4 py-3 shrink-0 bg-[#17212b] flex items-center gap-2 border-t border-slate-900/40">
      <div className="flex-1 bg-[#242f3d] rounded-xl flex items-center px-3 py-0.5 transition-all">
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={message}
            onChange={(event: React.SyntheticEvent<any>) =>
              setMessage((event.target as HTMLInputElement).value)
            }
            placeholder={placeholder || "Type a message..."}
            disabled={disabled}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-[#6b7d8d] text-sm py-2 px-1"
          />
        </form>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
        className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shrink-0 shadow-sm active:scale-95 ${
          message.trim() && !disabled
            ? "bg-[#2b5278] hover:bg-[#34628f] text-white cursor-pointer"
            : "bg-[#242f3d] text-[#6b7d8d] cursor-not-allowed opacity-50"
        }`}
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </div>
  );
};

export default ChatInput;
