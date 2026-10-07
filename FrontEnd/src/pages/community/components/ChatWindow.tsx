import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui";

const ChatWindow = ({
  messages,
  activeConv,
  user,
  isAdmin,
  getOtherParticipant,
  isTyping,
}: any) => {
  const messagesEndRef = useRef<any>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!activeConv) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center border-l"
        style={{
          background: "var(--bg-base)",
          borderColor: "var(--border-default)",
          color: "var(--text-muted)",
        }}
      >
        <MessageSquare className="w-10 h-10 mb-4" />
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--text-heading)" }}
        >
          Messages
        </h2>
        <p className="text-[14px] max-w-md text-center leading-relaxed">
          No conversation selected.
        </p>
      </div>
    );
  }

  const otherParticipantName = getOtherParticipant(activeConv)?.fullName;
  const otherParticipantAvatar = getOtherParticipant(activeConv)?.profileUrl;
  const chatTitle = isAdmin
    ? `${activeConv.participants[0]?.user.fullName} & ${activeConv.participants[1]?.user.fullName}`
    : otherParticipantName;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
      {/* Chat Header */}
      <div
        className="h-16 px-4 flex items-center justify-between shrink-0 z-10 border-b"
        style={{
          background: "var(--bg-surface-2)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={otherParticipantAvatar}
            fallback={chatTitle?.[0] || "U"}
            size="md"
            className="w-10 h-10 rounded-full"
          />
          <div className="min-w-0 flex flex-col">
            <span
              className="truncate text-sm font-medium"
              style={{ color: "var(--text-heading)" }}
            >
              {chatTitle}
            </span>
            <span
              className="text-[13px]"
              style={{ color: "var(--text-muted)" }}
            >
              {isTyping ? (
                <span style={{ color: "var(--accent-primary)" }}>
                  typing...
                </span>
              ) : (
                ""
              )}
            </span>
          </div>
        </div>

      </div>

      {/* Messages Area */}
      <div
        className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-4 space-y-1 relative"
        style={{
          background: "var(--bg-base)",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border-default) transparent",
        }}
      >

        {/* Date Badge */}
        <div className="flex justify-center my-4 sticky top-2 z-10">
          <span
            className="px-3 py-1.5 rounded-lg text-[12.5px] uppercase"
            style={{
              background: "var(--bg-surface-2)",
              color: "var(--text-muted)",
            }}
          >
            Today
          </span>
        </div>

        {messages.map((message: any, index: any) => {
          const isMine = message.senderId === user.userId;
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];

          const isFirstInGroup =
            !prevMsg || prevMsg.senderId !== message.senderId;
          const isLastInGroup =
            !nextMsg || nextMsg.senderId !== message.senderId;

          const timeString = new Date(
            message.createdAt || now,
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <div
              key={message.messageId || `temp-${index}`}
              className={`flex ${isMine ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-2" : "mb-0.5"}`}
            >
              <div
                className="relative min-w-0 max-w-[90%] sm:max-w-[75%] px-3 py-2 text-sm leading-relaxed [overflow-wrap:anywhere]"
                style={{
                  background: isMine
                    ? "var(--bg-surface-2)"
                    : "var(--bg-surface)",
                  color: "var(--text-primary)",
                  borderRadius: "7.5px",
                  borderTopRightRadius:
                    isMine && isFirstInGroup ? "0px" : "7.5px",
                  borderTopLeftRadius:
                    !isMine && isFirstInGroup ? "0px" : "7.5px",
                }}
              >
                {/* WhatsApp Chat Bubble Tail SVG */}
                {isFirstInGroup && isMine && (
                  <svg
                    viewBox="0 0 8 13"
                    width="8"
                    height="13"
                    className="absolute top-0 -right-[8px]"
                    style={{ color: "var(--bg-surface-2)" }}
                  >
                    <path
                      opacity=".13"
                      d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"
                    />
                  </svg>
                )}
                {isFirstInGroup && !isMine && (
                  <svg
                    viewBox="0 0 8 13"
                    width="8"
                    height="13"
                    className="absolute top-0 -left-[8px]"
                    style={{ color: "var(--bg-surface)" }}
                  >
                    <path
                      opacity=".13"
                      d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
                    />
                    <path
                      fill="currentColor"
                      d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"
                    />
                  </svg>
                )}

                <span>{message.content}</span>

                <div className="mt-1 flex justify-end items-center gap-1">
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {timeString}
                  </span>
                  {/* WhatsApp Double Checkmark for outgoing messages */}
                  {isMine && (
                    <svg viewBox="0 0 16 11" width="16" height="11">
                      <path
                        fill="var(--accent-primary)"
                        d="M11.8 1.6L10.4.2 4.4 6.2 2 3.8.6 5.2 4.4 9l7.4-7.4zM15.4.2l-1.4-1.4-5.2 5.2 1.4 1.4 5.2-5.2zM8 4.8l-1.4-1.4-3.4 3.4 1.4 1.4 3.4-3.4z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
