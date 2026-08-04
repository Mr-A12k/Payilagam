import React, { useState, useEffect } from "react";
import {
  executeHttpGetRequest,
  executeHttpPutRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";
import {
  Bell,
  CheckCircle,
  Trash2,
  Loader2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const response = await executeHttpGetRequest(
        `${(API_PATHS as any).NOTIFICATIONS.BASE}/notifications`,
      );
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await executeHttpPutRequest(
        `${(API_PATHS as any).NOTIFICATIONS.BASE}/${id}/read`,
      );
      setNotifications(
        notifications.map((n: any) =>
          n.notificationId === id ? { ...n, isRead: true } : n,
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await executeHttpDeleteRequest(
        `${(API_PATHS as any).NOTIFICATIONS.BASE}/${id}`,
      );
      setNotifications(
        notifications.filter((n: any) => n.notificationId !== id),
      );
      toast.success("Notification removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type: any) => {
    switch (type) {
      case "request":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-500" />
          Admin Notifications
        </h1>
      </div>

      <Card className="!p-0 border-slate-800 bg-slate-900 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">
              No notifications
            </h3>
            <p className="text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {notifications.map((notif: any) => (
              <div
                key={notif.notificationId}
                className={`p-4 flex gap-4 transition-colors ${notif.isRead ? "bg-slate-900/50" : "bg-slate-800/50 hover:bg-slate-800"}`}
              >
                <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex-between gap-4 mb-1">
                    <h4
                      className={`text-sm font-semibold truncate ${notif.isRead ? "text-slate-300" : "text-white"}`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${notif.isRead ? "text-slate-400" : "text-slate-300"}`}
                  >
                    {notif.message}
                  </p>

                  {/* If metadata has a uniqueId, maybe show a link */}
                  {notif.metadata && JSON.parse(notif.metadata).uniqueId && (
                    <div className="mt-3">
                      <a
                        href={`/courses/${JSON.parse(notif.metadata).uniqueId}`}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors border border-blue-500/20 inline-block"
                      >
                        Review Course
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif.notificationId)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.notificationId)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminNotifications;
