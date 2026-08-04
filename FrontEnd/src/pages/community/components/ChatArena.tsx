import { useEffect, useRef } from "react";
import { Hash, Users, Pin, Check, CheckCheck } from "lucide-react";
import { Avatar } from "@/components/ui";
import ChatInput from "./ChatInput";
import ReactMarkdown from 'react-markdown';

const ChatArena = ({
  // activeWorkspaceId,
  isDMView,
  activeConv,
  activeChannel,
  messages,
  user,
  isAdmin,
  getOtherParticipant,
  isTyping,
  onSendMessage,
  onTyping,
  emitReadReceipt
}: any) => {
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Track read receipts
  useEffect(() => {
    if (!isDMView || !emitReadReceipt || !messages.length) return;

    const unreadMessageIds = messages
      .filter((m: any) => m.sender?.userId !== user.userId && !m.isRead)
      .map((m: any) => m.messageId);

    if (unreadMessageIds.length > 0) {
      emitReadReceipt(unreadMessageIds);
    }
  }, [messages, isDMView, emitReadReceipt, user.userId]);

  if (isDMView && !activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 border-l border-slate-800">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select a Message</h2>
        <p className="text-slate-400 max-w-md text-center">
          Choose an existing conversation from the sidebar or start a new one to connect with mentors and peers.
        </p>
      </div>
    );
  }

  if (!isDMView && !activeChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 border-l border-slate-800">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Hash className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome to the Workspace</h2>
        <p className="text-slate-400 max-w-md text-center">
          Select a channel on the left to start collaborating and sharing code.
        </p>
      </div>
    );
  }

  // Determine Chat Context
  let chatTitle;
  let chatSubtitle;
  let avatarUrl = null;
  let avatarFallback = "";
  
  const isMyChat = isDMView ? activeConv?.participants?.some((p: any) => p.userId === user.userId) : true;

  if (isDMView) {
    const otherParticipant = getOtherParticipant(activeConv);
    chatTitle = isAdmin
      ? `${activeConv.participants[0]?.user.fullName} & ${activeConv.participants[1]?.user.fullName}`
      : otherParticipant?.fullName;
    avatarUrl = otherParticipant?.profileUrl;
    avatarFallback = chatTitle?.[0] || "U";
    chatSubtitle = isTyping ? <span className="text-blue-400 font-medium">typing...</span> : (otherParticipant?.role === 'mentor' ? 'Mentor' : 'Student');
  } else {
    chatTitle = activeChannel.name;
    chatSubtitle = activeChannel.description || "Welcome to the start of the channel.";
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0e1621] relative">
      
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between shrink-0 z-10 bg-[#17212b]">
        <div className="flex items-center gap-3">
          {isDMView ? (
            <Avatar
              src={avatarUrl}
              fallback={avatarFallback}
              size="sm"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <Hash className="w-6 h-6 text-slate-400" />
          )}
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-slate-100 flex items-center gap-2">
              {isDMView ? chatTitle : chatTitle.toLowerCase().replace(/\s+/g, '-')}
            </span>
            {chatSubtitle && (
              <span className="text-[12px] text-slate-400 line-clamp-1">{chatSubtitle}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400">
          <Pin className="w-5 h-5 cursor-pointer hover:text-slate-100 transition-colors" />
          <Users className="w-5 h-5 cursor-pointer hover:text-slate-100 transition-colors" />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar relative z-0">
        
        {/* Intro Message */}
        {!isDMView && messages.length === 0 && (
          <div className="mb-10">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{chatTitle.toLowerCase().replace(/\s+/g, '-')}!</h1>
            <p className="text-slate-400">This is the start of the #{chatTitle} channel.</p>
          </div>
        )}

        {messages.map((message: any, index: any) => {
          const isOwn = message.sender?.userId === user.userId;
          const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?.userId !== message.sender?.userId);
          
          return (
            <div key={message.messageId || index} className={`flex gap-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              
              {!isOwn && (
                <div className="w-10 shrink-0">
                  {showAvatar && (
                    <Avatar
                      src={message.sender?.profileUrl}
                      fallback={message.sender?.fullName?.[0] || "U"}
                      size="sm"
                      className="w-10 h-10 rounded-full shadow-md"
                    />
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                {!isOwn && showAvatar && (
                  <span className="text-sm font-semibold text-slate-300 mb-1 ml-1">
                    {message.sender?.fullName}
                  </span>
                )}
                
                <div className={`px-3 pt-1 pb-5 rounded-2xl shadow-sm relative min-w-[90px] ${
                  isOwn 
                    ? 'bg-[#2b5278] text-white rounded-br-sm' 
                    : 'bg-[#182533] text-white rounded-bl-sm'
                }`}>
                  {message.type === 'CODE_SNIPPET' ? (
                    <pre className="bg-[#0e1621] p-3 rounded-md overflow-x-auto my-1 font-mono text-sm">
                      <code className="text-blue-300">{message.content}</code>
                    </pre>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none break-words">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                  
                  {/* Meta info floating bottom right */}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className={`text-[9px] font-medium leading-none ${isOwn ? 'text-[#7da8ce]' : 'text-[#6b7d8d]'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwn && isDMView && (
                      message.isRead 
                        ? <CheckCheck className="w-3.5 h-3.5 text-[#7da8ce]" />
                        : <Check className="w-3.5 h-3.5 text-[#7da8ce]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={(isAdmin && !isMyChat) && isDMView}
        placeholder={(isAdmin && !isMyChat) && isDMView ? "Admins cannot reply directly..." : `Message ${isDMView ? getOtherParticipant(activeConv)?.fullName : '#' + chatTitle.toLowerCase()}`}
        emitTyping={onTyping}
      />
    </div>
  );
};

export default ChatArena;
