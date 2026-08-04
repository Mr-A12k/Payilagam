import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitEvent: (event: string, data?: any, callback?: Function) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emitEvent: () => {},
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
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // We only want to request permission once the component mounts
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!token) return;

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
      const isChatPage = window.location.pathname.startsWith("/chat");
      const isFocused = document.hasFocus();

      // If user is focused on the chat page, don't send desktop push
      if (isChatPage && isFocused) {
        return;
      }

      // Otherwise send a desktop notification if permitted
      if (Notification.permission === "granted") {
        const title = messageData.sender?.fullName
          ? `New message from ${messageData.sender.fullName}`
          : "New Message";

        const notif = new Notification(title, {
          body: messageData.content,
          icon: messageData.sender?.profileUrl || "/logo.png", // Optional icon
        });

        notif.onclick = () => {
          window.focus();
          // Could also redirect to chat:
          // window.location.href = '/chat';
        };
      }
    };

    newSocket.on("new_message", handleNotification);
    newSocket.on("new_channel_message", handleNotification);

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.off("new_message", handleNotification);
      newSocket.off("new_channel_message", handleNotification);
      newSocket.disconnect();
    };
  }, [token]);

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
    <SocketContext.Provider value={{ socket, isConnected, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
};
