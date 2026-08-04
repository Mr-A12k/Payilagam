import { Smile, Paperclip, Mic, Send } from "lucide-react";
import { useState, useEffect } from "react";

const ChatInput = ({ onSendMessage, disabled, placeholder, emitTyping }: any) => {
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
    <div className="px-4 py-3 shrink-0 bg-[#17212b] flex items-end gap-2">
      <button type="button" className="p-3 hover:bg-[#242f3d] rounded-full text-[#6b7d8d] hover:text-[#7da8ce] transition-colors shrink-0">
        <Paperclip className="w-[22px] h-[22px]" />
      </button>

      <div className="flex-1 bg-[#242f3d] rounded-3xl flex items-end px-2 py-1 focus-within:ring-1 focus-within:ring-[#2b5278] transition-all">
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={message}
            onChange={(event: React.SyntheticEvent<any>) => setMessage((event.target as HTMLInputElement).value)}
            placeholder={placeholder || "Message"}
            disabled={disabled}
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-[#6b7d8d] text-[15px] py-2.5 px-3"
          />
        </form>
        <button type="button" className="p-2.5 mb-0.5 rounded-full text-[#6b7d8d] hover:text-[#7da8ce] transition-colors shrink-0">
          <Smile className="w-[22px] h-[22px]" />
        </button>
      </div>

      {message.trim() ? (
        <button 
          onClick={handleSubmit} 
          disabled={disabled} 
          className="w-[46px] h-[46px] mb-0.5 bg-[#2b5278] hover:bg-[#34628f] text-white rounded-full transition-colors flex items-center justify-center shrink-0 shadow-sm"
        >
          <Send className="w-[20px] h-[20px] ml-0.5" />
        </button>
      ) : (
        <button type="button" className="w-[46px] h-[46px] mb-0.5 hover:bg-[#242f3d] text-[#6b7d8d] hover:text-[#7da8ce] rounded-full transition-colors flex items-center justify-center shrink-0">
          <Mic className="w-[22px] h-[22px]" />
        </button>
      )}
    </div>
  );
};

export default ChatInput;
