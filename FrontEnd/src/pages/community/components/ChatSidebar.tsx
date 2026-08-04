import { Search, Filter } from "lucide-react";
import { Avatar } from "@/components/ui";

const ChatSidebar = ({
  conversations,
  activeConvId,
  setActiveConvId,
  isLoading,
  isAdmin,
  getOtherParticipant,
  // user
}: any) => {
  return (
    <div className="w-[30%] min-w-[300px] max-w-[400px] flex flex-col shrink-0 border-r z-20"
      style={{
        background: "var(--bg-surface-1)",
        borderColor: "var(--border-default)"
      }}>
      
      {/* Sidebar Header */}
      {/* <div className="h-16 px-4 flex items-center justify-between shrink-0"
        style={{ background: "var(--bg-surface-2)" }}>
        <Avatar
          src={user?.profileUrl}
          fallback={user?.fullName?.[0] || "U"}
          size="md"
          className="w-10 h-10 rounded-full cursor-pointer"
        />
        <div className="flex items-center gap-4" style={{ color: "var(--text-muted)" }}>
          <MessageSquarePlus className="w-5 h-5 cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
        </div>
      </div> */}
      
      {/* Search Bar Area */}
      <div className="px-3 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: "var(--border-default)", background: "var(--bg-surface-1)" }}>
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-3 py-1.5 rounded-lg text-[14px] transition-all focus:outline-none"
            style={{
              background: "var(--bg-surface-2)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <Filter className="w-5 h-5 cursor-pointer transition-colors shrink-0" style={{ color: "var(--text-muted)" }} />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-0"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-default) transparent" }}>
        {isLoading ? (
          <div className="p-4 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            Loading chats...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            No chats available.
          </div>
        ) : (
          conversations.map((conv: any) => {
            const otherUser = getOtherParticipant(conv);
            const isSelected = conv.conversationId === activeConvId;
            const name = isAdmin
              ? `${conv.participants[0]?.user.fullName} & ${conv.participants[1]?.user.fullName}`
              : otherUser?.fullName;
            
            // Mock latest message preview (in a real app, this comes from the DB)
            const latestMessage = conv.messages?.[0]?.content || "Tap to view conversation";

            return (
              <div
                key={conv.conversationId}
                onClick={() => setActiveConvId(conv.conversationId)}
                className="flex items-center cursor-pointer transition-colors"
                style={{
                  background: isSelected ? "var(--accent-primary-subtle)" : "transparent",
                }}
                onMouseEnter={(event: React.SyntheticEvent<any>) => {
                  if (!isSelected) event.currentTarget.style.background = "var(--bg-surface-2)";
                }}
                onMouseLeave={(event: React.SyntheticEvent<any>) => {
                  if (!isSelected) event.currentTarget.style.background = "transparent";
                }}
              >
                <div className="pl-3 pr-3 py-3 shrink-0">
                  <Avatar
                    src={otherUser?.profileUrl}
                    fallback={otherUser?.fullName?.[0] || "U"}
                    size="md"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                
                <div className="flex-1 min-w-0 py-3 pr-4 border-b flex flex-col justify-center h-full"
                  style={{ borderColor: "var(--border-default)" }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[16px] truncate"
                      style={{ color: "var(--text-primary)" }}>
                      {name}
                    </span>
                    <span className="text-[12px] shrink-0" style={{ color: isSelected ? "var(--text-primary)" : "var(--text-muted)" }}>
                      10:42 AM
                    </span>
                  </div>
                  <div className="text-[13px] truncate" style={{ color: "var(--text-muted)" }}>
                    {latestMessage}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
