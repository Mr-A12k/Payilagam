import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
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

const updateQuotedMessage = (messages: any[], messageId: number, edited?: any) => messages
  .filter((message: any) => edited || message.messageId !== messageId)
  .map((message: any) => {
    if (edited && message.messageId === messageId) return { ...message, ...edited };
    if (message.replyToId !== messageId) return message;
    return { ...message, replyTo: edited
      ? { ...message.replyTo, content: edited.content }
      : { messageId, isDeleted: true, content: null, sender: null } };
  });

const Chat = () => {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  // State
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]); // Legacy DMs

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<any>(null); // null = DM view
  const [activeChannelId, setActiveChannelId] = useState<any>(null);
  const [activeConvId, setActiveConvId] = useState<any>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

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

  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.pageAccess?.includes("PG_ADM");

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

    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener("refresh_conversations", handleRefresh);
    return () => {
      window.removeEventListener("refresh_conversations", handleRefresh);
    };
  }, []);

  // Auto-select conversation or channel from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryConvId = params.get("conversationId");
    const queryChannelId = params.get("channelId");

    if (queryConvId && conversations.length > 0) {
      const conversation = conversations.find((c: any) => String(c.conversationId) === queryConvId);
      if (conversation) {
        setActiveWorkspaceId(null);
        setActiveConvId(conversation.conversationId);
        setShowMobileChat(true);
        // Clear query parameters so clicking around doesn't re-trigger it
        window.history.replaceState({}, document.title, "/chat");
      }
    } else if (queryChannelId && workspaces.length > 0) {
      // Find workspace containing this channel
      let foundWorkspaceId = null;
      for (const ws of workspaces) {
        if (ws.channels?.some((ch: any) => String(ch.channelId) === queryChannelId)) {
          foundWorkspaceId = ws.workspaceId;
          break;
        }
      }
      if (foundWorkspaceId) {
        setActiveWorkspaceId(foundWorkspaceId);
        const workspace = workspaces.find((ws: any) => ws.workspaceId === foundWorkspaceId);
        setActiveChannelId(workspace.channels.find((ch: any) => String(ch.channelId) === queryChannelId).channelId);
        setShowMobileChat(true);
        // Clear query parameters so clicking around doesn't re-trigger it
        window.history.replaceState({}, document.title, "/chat");
      }
    }
  }, [conversations, workspaces, location.search]);

  // Set default active channel when workspace changes
  useEffect(() => {
    if (activeWorkspaceId) {
      const workspace = workspaces.find(
        (w: any) => w.workspaceId === activeWorkspaceId,
      );
      if (workspace?.channels?.length > 0) {
        setActiveChannelId((current: any) => workspace.channels.some((ch: any) => ch.channelId === current) ? current : workspace.channels[0].channelId);
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

    socket.on("message_edited", (editedMsg: any) => {
      setMessages((prev: any) =>
        updateQuotedMessage(prev, editedMsg.messageId, editedMsg)
      );
    });

    socket.on("message_deleted", ({ messageId }: any) => {
      setMessages((prev: any) => updateQuotedMessage(prev, messageId));
    });

    socket.on("channel_message_edited", (editedMsg: any) => {
      setMessages((prev: any) =>
        updateQuotedMessage(prev, editedMsg.messageId, editedMsg)
      );
    });

    socket.on("channel_message_deleted", ({ messageId }: any) => {
      setMessages((prev: any) => updateQuotedMessage(prev, messageId));
    });

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_channel_message", handleNewChannelMessage);
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("channel_message_edited");
      socket.off("channel_message_deleted");
      socket.off("user_typing");
      socket.off("channel_user_typing");
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, activeWorkspaceId, activeConvId, activeChannelId]);

  // Handlers
  const handleEditMessage = useCallback(
    (messageId: number, content: string) => {
      if (!socket) return;
      socket.emit("edit_message", { messageId, content }, (res: any) => {
        if (res.success) {
          setMessages((prev: any) =>
            updateQuotedMessage(prev, messageId, res.message)
          );
          toast.success("Message updated!");
        } else {
          toast.error(res.error || "Failed to edit message");
        }
      });
    },
    [socket]
  );

  const handleDeleteMessage = useCallback(
    (messageId: number) => {
      if (!socket) return;
      socket.emit("delete_message", { messageId }, (res: any) => {
        if (res.success) {
          setMessages((prev: any) => updateQuotedMessage(prev, messageId));
          toast.success("Message deleted!");
        } else {
          toast.error(res.error || "Failed to delete message");
        }
      });
    },
    [socket]
  );

  const handleEditChannelMessage = useCallback(
    (messageId: number, content: string) => {
      if (!socket) return;
      socket.emit("edit_channel_message", { messageId, content }, (res: any) => {
        if (res.success) {
          setMessages((prev: any) =>
            updateQuotedMessage(prev, messageId, res.message)
          );
          toast.success("Message updated!");
        } else {
          toast.error(res.error || "Failed to edit message");
        }
      });
    },
    [socket]
  );

  const handleDeleteChannelMessage = useCallback(
    (messageId: number) => {
      if (!socket) return;
      socket.emit("delete_channel_message", { messageId }, (res: any) => {
        if (res.success) {
          setMessages((prev: any) => updateQuotedMessage(prev, messageId));
          toast.success("Message deleted!");
        } else {
          toast.error(res.error || "Failed to delete message");
        }
      });
    },
    [socket]
  );

  const handleSendMessage = useCallback(
    (content: any, replyTarget: any = null) => {
      const isDMView = activeWorkspaceId === null;
      const currentId = isDMView ? activeConvId : activeChannelId;

      if (!content.trim() || !currentId) return false;
      if (!isConnected) { toast.error("Chat is offline. Try again when connected."); return false; }

      const optimisticMessage = {
        messageId: `temp-${Date.now()}`,
        [isDMView ? "conversationId" : "channelId"]: currentId,
        senderId: user.userId,
        content,
        replyToId: replyTarget?.messageId ?? null,
        replyTo: replyTarget,
        type: "TEXT",
        createdAt: new Date().toISOString(),
        sender: user,
      };

      setMessages((prev: any) => [...prev, optimisticMessage]);

      return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        setMessages((prev: any) => prev.filter((m: any) => m.messageId !== optimisticMessage.messageId));
        toast.error("Message delivery could not be confirmed. Check the chat before retrying.");
        resolve(false);
      }, 15000);
      emitEvent(
        isDMView ? "send_message" : "send_channel_message",
        {
          [isDMView ? "conversationId" : "channelId"]: currentId,
          content,
          type: "TEXT",
          replyToId: replyTarget?.messageId ?? null,
        },
        (response: any) => {
          clearTimeout(timer);
          if (response.success) {
            setMessages((prev: any) =>
              prev.map((m: any) =>
                m.messageId === optimisticMessage.messageId
                  ? response.message
                  : m,
              ),
            );
          } else {
            toast.error(response.error || "Failed to send message");
            setMessages((prev: any) =>
              prev.filter(
                (m: any) => m.messageId !== optimisticMessage.messageId,
              ),
            );
          }
          resolve(Boolean(response.success));
        },
      );
      });
    },
    [activeWorkspaceId, activeConvId, activeChannelId, emitEvent, user, isConnected],
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
    <div className="h-full min-h-0 min-w-0 w-full flex overflow-hidden font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className={`${showMobileChat ? "hidden" : "flex"} min-h-0 min-w-0 w-full md:w-auto md:flex shrink-0`}>
      {/* Pane 1: Workspace Rail */}
      <WorkspaceRail
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={(id: any) => { setActiveWorkspaceId(id); setShowMobileChat(false); }}
        onCreateWorkspace={() => setShowCreateWorkspaceModal(true)}
      />

      {/* Pane 2: Channel/DM Sidebar */}
      <ChannelSidebar
        workspaces={workspaces}
        conversations={conversations}
        activeConvId={activeConvId}
        setActiveConvId={(id: any) => { setActiveConvId(id); setShowMobileChat(id !== null); }}
        activeChannelId={activeChannelId}
        setActiveChannelId={(id: any) => { setActiveChannelId(id); setShowMobileChat(id !== null); }}
        isLoading={isLoading}
        activeWorkspaceId={activeWorkspaceId}
        getOtherParticipant={getOtherParticipant}
        isAdmin={isAdmin}
        user={user}
        onNewConversation={(conv: any) => {
          setConversations((prev: any) => [conv, ...prev]);
          setActiveConvId(conv.conversationId);
          setShowMobileChat(true);
        }}
      />
      </div>

      {/* Pane 3: Chat Arena */}
      <div className={`${showMobileChat ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 md:flex`}>
      <ChatArena
        onBack={() => setShowMobileChat(false)}
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
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onEditChannelMessage={handleEditChannelMessage}
        onDeleteChannelMessage={handleDeleteChannelMessage}
      />
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={showCreateWorkspaceModal} onOpenChange={setShowCreateWorkspaceModal}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[420px] max-h-[90dvh] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg p-5 overflow-y-auto">
          
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface-2)] flex items-center justify-center text-[var(--text-secondary)] mx-auto mb-3">
            <Users className="w-5.5 h-5.5" />
          </div>

          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-black text-[var(--text-primary)] text-center">Create Group</DialogTitle>
            <DialogDescription className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
              Create a collaborative workspace for your team and student members.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-5 mt-5">
            <div className="space-y-2">
              <Label className="text-xs text-[var(--text-muted)] font-bold tracking-normal uppercase">Group Name</Label>
              <Input
                value={newWorkspaceName}
                onChange={(e: any) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Advanced Java Prep"
                className="h-11 bg-[var(--bg-surface)] border-[var(--border-default)] focus:border-[var(--border-default)] focus:ring-4 focus:ring-blue-500/10 text-[var(--text-primary)] rounded-lg transition-all duration-300 px-4 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-[var(--text-muted)] font-bold tracking-normal uppercase">Description</Label>
              <Input
                value={newWorkspaceDesc}
                onChange={(e: any) => setNewWorkspaceDesc(e.target.value)}
                placeholder="A brief description of this group..."
                className="h-11 bg-[var(--bg-surface)] border-[var(--border-default)] focus:border-[var(--border-default)] focus:ring-4 focus:ring-blue-500/10 text-[var(--text-primary)] rounded-lg transition-all duration-300 px-4 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)] mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateWorkspaceModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg font-bold px-5 h-10.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[var(--bg-surface-2)] text-[var(--text-primary)] rounded-lg transition-all font-bold px-6 h-10.5 cursor-pointer"
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
