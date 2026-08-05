import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5005";

export const useSocket = (token: any) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

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
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error: unknown) => {
      console.error(
        "Socket connection error:",
        (error as import("axios").AxiosError<{ message?: string }>)?.message,
      );
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Wrapper around emit to ensure socket exists
  const emitEvent = useCallback(
    (event: React.SyntheticEvent<any>, data: any, callback: any) => {
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

  return { socket, isConnected, emitEvent };
};
