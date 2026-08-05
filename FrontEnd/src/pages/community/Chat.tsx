import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { useSocketContext } from "@/context/SocketContext";
import WorkspaceRail from "./components/WorkspaceRail";
import ChannelSidebar from "./components/ChannelSidebar";
import ChatArena from "./components/ChatArena";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Button,
  Label
} from "@/components/ui";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

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

  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const wsRes = await executeHttpGetRequest(API_PATHS.CHAT.WORKSPACES);
      if (wsRes.data.success) {
        setWorkspaces(wsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces", error);
    }
  };

  const handleCreateWorkspace = async (e: any) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const response: any = await executeHttpPostRequest(API_PATHS.CHAT.WORKSPACES, {
        name: newWorkspaceName,
        description: newWorkspaceDesc,
      });
      if (response.data.success) {
        toast.success("Group created successfully!");
        setNewWorkspaceName("");
        setNewWorkspaceDesc("");
        setShowCreateWorkspaceModal(false);
        await fetchWorkspaces();
      } else {
        toast.error(response.data.message || "Failed to create group");
      }
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || "Failed to create group");
    }
  };

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
        onCreateWorkspace={() => setShowCreateWorkspaceModal(true)}
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

      {/* Create Workspace Modal */}
      <Dialog open={showCreateWorkspaceModal} onOpenChange={setShowCreateWorkspaceModal}>
        <DialogContent className="sm:max-w-[420px] bg-gradient-to-br from-[#182533] to-[#0e1621] border border-blue-500/25 text-slate-200 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/35 flex items-center justify-center text-blue-400 mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-bounce duration-1000">
            <Users className="w-5.5 h-5.5" />
          </div>

          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-black text-slate-100 text-center">Create Group</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 text-center leading-relaxed">
              Create a collaborative workspace for your team and student members.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-5 mt-5">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 font-bold tracking-wider uppercase">Group Name</Label>
              <Input
                value={newWorkspaceName}
                onChange={(e: any) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Advanced Java Prep"
                className="h-11 bg-[#0e1621]/80 border-slate-800 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 text-slate-200 rounded-xl transition-all duration-300 shadow-inner px-4 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 font-bold tracking-wider uppercase">Description</Label>
              <Input
                value={newWorkspaceDesc}
                onChange={(e: any) => setNewWorkspaceDesc(e.target.value)}
                placeholder="A brief description of this group..."
                className="h-11 bg-[#0e1621]/80 border-slate-800 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 text-slate-200 rounded-xl transition-all duration-300 shadow-inner px-4 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateWorkspaceModal(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 rounded-xl font-bold px-5 h-10.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all font-bold px-6 h-10.5 cursor-pointer"
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
