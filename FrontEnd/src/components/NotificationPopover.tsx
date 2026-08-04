import React, { useState, useRef, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, MessageSquare } from "lucide-react";
import { useSocketContext } from "@/context/SocketContext";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button";

const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { notifications, clearNotifications, isMuted, toggleMute } =
    useSocketContext();

  const unreadCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
      >
        {isMuted ? (
          <BellOff className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && !isMuted && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-950 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/50 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-xs text-slate-400 hover:text-white transition-colors"
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              >
                {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif, idx) => (
                  <Link
                    key={idx}
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                        {notif.sender?.fullName || "New Message"}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {notif.content}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-center">
            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              View all messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
