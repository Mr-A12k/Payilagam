import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
import { executeHttpDeleteRequest, executeHttpGetRequest } from "@/api/commonServices";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5005";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: number[];
  emitEvent: (event: string, data?: any, callback?: Function) => void;
  notifications: any[];
  clearNotifications: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  emitEvent: () => {},
  notifications: [],
  clearNotifications: () => {},
  isMuted: false,
  toggleMute: () => {},
});

export const useSocketContext = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(
    localStorage.getItem("notificationsMuted") === "true"
  );
  
  const token = useSelector((state: RootState) => state.auth.token);
  const receivedMessageIds = useRef(new Set<string>());

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("notificationsMuted", String(next));
      if (next) {
         toast("Notifications muted", { icon: "🔕" });
      } else {
         toast.success("Notifications enabled", { icon: "🔔" });
      }
      return next;
    });
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    try {
      await executeHttpDeleteRequest("/notifications/clear-all");
    } catch (error) {
      console.error("Failed to clear notifications in DB", error);
    }
  }, []);

  useEffect(() => {
    // We only want to request permission once the component mounts
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchDBNotifications = async () => {
      try {
        const res = await executeHttpGetRequest("/notifications");
        if (res.data.success && res.data.data) {
          const unreads = res.data.data.filter((n: any) => !n.isRead);
          const mapped = unreads.map((n: any) => ({
            title: n.title,
            content: n.message,
            link: n.link,
            createdAt: n.createdAt,
            // Fallback parameters if needed
          }));
          setNotifications(mapped);
        }
      } catch (error) {
        console.error("Failed to load notifications from DB on mount", error);
      }
    };
    fetchDBNotifications();

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("Global Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Global Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error: unknown) => {
      console.error(
        "Global Socket connection error:",
        (error as import("axios").AxiosError<{ message?: string }>)?.message,
      );
      setIsConnected(false);
    });

    // Handle global notifications
    const handleNotification = (messageData: any) => {
      const msgId = messageData.messageId;
      if (msgId) {
        if (receivedMessageIds.current.has(msgId)) {
          return; // Skip duplicate notification
        }
        receivedMessageIds.current.add(msgId);
      }

      const isChatPage = window.location.pathname.startsWith("/chat");
      const isFocused = document.hasFocus();

      // Always add to the bell popover list
      setNotifications((prev) => [messageData, ...prev]);

      // If user is focused on the chat page, don't show toast or desktop push
      if (isChatPage && isFocused) {
        return;
      }

      const title = messageData.sender?.fullName
          ? `New message from ${messageData.sender.fullName}`
          : "New Message";

      // If not muted, show a toast notification in the UI
      if (!isMuted) {
         toast(
           (t) => (
             <div className="flex flex-col cursor-pointer" onClick={() => {
                toast.dismiss(t.id);
                const targetPath = messageData.channelId
                  ? `/chat?channelId=${messageData.channelId}`
                  : `/chat?conversationId=${messageData.conversationId}`;
                window.location.href = targetPath;
             }}>
                <span className="font-bold">{title}</span>
                <span className="text-sm truncate max-w-[200px]">{messageData.content}</span>
             </div>
           ),
           { icon: '💬', duration: 4000 }
         );
      }

      // Send a desktop notification if permitted and not muted
      if (Notification.permission === "granted" && !isMuted) {
        const notif = new Notification(title, {
          body: messageData.content,
          icon: messageData.sender?.profileUrl || "/logo.png", // Optional icon
        });

        notif.onclick = () => {
          window.focus();
          const targetPath = messageData.channelId
            ? `/chat?channelId=${messageData.channelId}`
            : `/chat?conversationId=${messageData.conversationId}`;
          window.location.href = targetPath;
        };
      }
    };

    const handleOnlineUsers = (userArray: any[]) => {
      const ids = (userArray || []).map((id) => Number(id));
      setOnlineUsers(ids);
    };

    newSocket.on("new_message", handleNotification);
    newSocket.on("new_channel_message", handleNotification);
    newSocket.on("online_users", handleOnlineUsers);

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.off("new_message", handleNotification);
      newSocket.off("new_channel_message", handleNotification);
      newSocket.off("online_users", handleOnlineUsers);
      newSocket.disconnect();
    };
  }, [token, isMuted]); // Re-bind when isMuted changes

  // Wrapper around emit to ensure socket exists
  const emitEvent = useCallback(
    (event: string, data?: any, callback?: Function) => {
      if (socket && isConnected) {
        if (callback) {
          socket.emit(event, data, callback);
        } else {
          socket.emit(event, data);
        }
      } else {
        console.warn(`Cannot emit ${event}: Socket not connected`);
      }
    },
    [socket, isConnected],
  );

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, emitEvent, notifications, clearNotifications, isMuted, toggleMute }}>
      {children}
    </SocketContext.Provider>
  );
};

