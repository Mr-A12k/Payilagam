import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useSocketContext } from "@/context/SocketContext";
import WorkspaceRail from "./components/WorkspaceRail";
import ChannelSidebar from "./components/ChannelSidebar";
import ChatArena from "./components/ChatArena";

const Chat = () => {
  const { user } = useSelector((state: any) => state.auth);

  // State
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]); // Legacy DMs

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<any>(null); // null = DM view
  const [activeChannelId, setActiveChannelId] = useState<any>(null);
  const [activeConvId, setActiveConvId] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const isAdmin = user?.pageAccess?.includes("PG_ADM");

  // WebSocket Hook
  const { socket, isConnected, emitEvent } = useSocketContext();

  // Fetch initial data (Workspaces & DMs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch Workspaces
        const wsRes = await executeHttpGetRequest(API_PATHS.CHAT.WORKSPACES);
        if (wsRes.data.success) {
          setWorkspaces(wsRes.data.data);
        }

        // Fetch DMs
        const dmRes = await executeHttpGetRequest(API_PATHS.CHAT.BASE);
        if (dmRes.data.success) {
          setConversations(dmRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch chat data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set default active channel when workspace changes
  useEffect(() => {
    if (activeWorkspaceId) {
      const workspace = workspaces.find(
        (w: any) => w.workspaceId === activeWorkspaceId,
      );
      if (workspace?.channels?.length > 0) {
        setActiveChannelId(workspace.channels[0].channelId);
      } else {
        setActiveChannelId(null);
      }
    }
  }, [activeWorkspaceId, workspaces]);

  // Fetch messages and manage socket rooms
  useEffect(() => {
    const isDMView = activeWorkspaceId === null;
    const currentId = isDMView ? activeConvId : activeChannelId;

    if (!currentId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const path = isDMView
          ? API_PATHS.CHAT.MESSAGES(currentId!)
          : API_PATHS.CHAT.CHANNEL_MESSAGES(currentId!);

        const response = await executeHttpGetRequest(path);
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();

    // Socket: Join room
    if (isConnected) {
      if (isDMView) emitEvent("join_chat", currentId);
      else emitEvent("join_channel", currentId);
    }

    return () => {
      // Socket: Leave room on unmount or context change
      if (isConnected) {
        if (isDMView) emitEvent("leave_chat", currentId);
        else emitEvent("leave_channel", currentId);
      }
    };
  }, [
    activeWorkspaceId,
    activeConvId,
    activeChannelId,
    isConnected,
    emitEvent,
  ]);

  // Handle incoming socket events
  useEffect(() => {
    if (!socket) return;

    const isDMView = activeWorkspaceId === null;
    const currentId = isDMView ? activeConvId : activeChannelId;

    const handleNewMessage = (newMessage: any) => {
      if (isDMView && newMessage.conversationId === currentId) {
        setMessages((prev: any) => {
          if (prev.some((m: any) => m.messageId === newMessage.messageId))
            return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleNewChannelMessage = (newMessage: any) => {
      if (!isDMView && newMessage.channelId === currentId) {
        setMessages((prev: any) => {
          if (prev.some((m: any) => m.messageId === newMessage.messageId))
            return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleUserTyping = ({
      conversationId,
      isTyping: typingStatus,
    }: any) => {
      if (isDMView && conversationId === currentId) setIsTyping(typingStatus);
    };

    const handleChannelTyping = ({
      channelId,
      isTyping: typingStatus,
    }: any) => {
      if (!isDMView && channelId === currentId) setIsTyping(typingStatus);
    };

    const handleMessagesRead = ({ conversationId, messageIds }: any) => {
      if (isDMView && conversationId === currentId) {
        setMessages((prev: any) =>
          prev.map((m: any) =>
            messageIds.includes(m.messageId) ? { ...m, isRead: true } : m,
          ),
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("new_channel_message", handleNewChannelMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("channel_user_typing", handleChannelTyping);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_channel_message", handleNewChannelMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("channel_user_typing", handleChannelTyping);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, activeWorkspaceId, activeConvId, activeChannelId]);

  // Handlers
  const handleSendMessage = useCallback(
    (content: any) => {
      const isDMView = activeWorkspaceId === null;
      const currentId = isDMView ? activeConvId : activeChannelId;

      if (!content.trim() || !currentId) return;

      const optimisticMessage = {
        messageId: `temp-${Date.now()}`,
        [isDMView ? "conversationId" : "channelId"]: currentId,
        senderId: user.userId,
        content,
        type: "TEXT",
        createdAt: new Date().toISOString(),
        sender: user,
      };

      setMessages((prev: any) => [...prev, optimisticMessage]);

      emitEvent(
        isDMView ? "send_message" : "send_channel_message",
        {
          [isDMView ? "conversationId" : "channelId"]: currentId,
          content,
          type: "TEXT",
        },
        (response: any) => {
          if (response.success) {
            setMessages((prev: any) =>
              prev.map((m: any) =>
                m.messageId === optimisticMessage.messageId
                  ? response.message
                  : m,
              ),
            );
          } else {
            setMessages((prev: any) =>
              prev.filter(
                (m: any) => m.messageId !== optimisticMessage.messageId,
              ),
            );
          }
        },
      );
    },
    [activeWorkspaceId, activeConvId, activeChannelId, emitEvent, user],
  );

  const handleTyping = useCallback(
    (isTypingStatus: any) => {
      const isDMView = activeWorkspaceId === null;
      const currentId = isDMView ? activeConvId : activeChannelId;

      if (!currentId) return;

      emitEvent(isDMView ? "typing" : "channel_typing", {
        [isDMView ? "conversationId" : "channelId"]: currentId,
        isTyping: isTypingStatus,
      });
    },
    [activeWorkspaceId, activeConvId, activeChannelId, emitEvent],
  );

  const emitReadReceipt = useCallback(
    (messageIds: any) => {
      const isDMView = activeWorkspaceId === null;
      if (!isDMView || !activeConvId || !messageIds.length) return;

      emitEvent("mark_read", {
        conversationId: activeConvId,
        messageIds,
      });

      // Optimistically update local state so we don't trigger it again
      setMessages((prev: any) =>
        prev.map((m: any) =>
          messageIds.includes(m.messageId) ? { ...m, isRead: true } : m,
        ),
      );
    },
    [activeWorkspaceId, activeConvId, emitEvent],
  );

  // Helpers
  const activeConv = conversations.find(
    (c: any) => c.conversationId === activeConvId,
  );
  const activeWorkspace = workspaces.find(
    (w: any) => w.workspaceId === activeWorkspaceId,
  );
  const activeChannel = activeWorkspace?.channels?.find(
    (c: any) => c.channelId === activeChannelId,
  );

  const getOtherParticipant = useCallback(
    (conv: any) => {
      if (!conv || !conv.participants) return null;
      return (
        conv.participants.find((p: any) => p.userId !== user.userId)?.user ||
        conv.participants[0]?.user
      );
    },
    [user.userId],
  );

  return (
    <div className="h-full w-full flex overflow-hidden font-sans bg-slate-950">
      {/* Pane 1: Workspace Rail */}
      <WorkspaceRail
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
      />

      {/* Pane 2: Channel/DM Sidebar */}
      <ChannelSidebar
        workspaces={workspaces}
        conversations={conversations}
        activeConvId={activeConvId}
        setActiveConvId={setActiveConvId}
        activeChannelId={activeChannelId}
        setActiveChannelId={setActiveChannelId}
        isLoading={isLoading}
        activeWorkspaceId={activeWorkspaceId}
        getOtherParticipant={getOtherParticipant}
        isAdmin={isAdmin}
        user={user}
        onNewConversation={(conv: any) => {
          setConversations((prev: any) => [conv, ...prev]);
          setActiveConvId(conv.conversationId);
        }}
      />

      {/* Pane 3: Chat Arena */}
      <ChatArena
        isDMView={activeWorkspaceId === null}
        activeConv={activeConv}
        activeChannel={activeChannel}
        messages={messages}
        user={user}
        isAdmin={isAdmin}
        getOtherParticipant={getOtherParticipant}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        emitReadReceipt={emitReadReceipt}
      />
    </div>
  );
};

export default Chat;
