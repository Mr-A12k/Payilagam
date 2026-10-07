import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { executeHttpGetRequest, executeHttpPutRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, Bell, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

const getCourseId = (metadata: unknown): string | null => {
  try {
    const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    if (!parsed || typeof parsed !== "object") return null;
    const id = parsed.courseId ?? parsed.uniqueId;
    return typeof id === "string" || typeof id === "number" ? String(id) : null;
  } catch {
    return null;
  }
};

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminNotifications", page],
    queryFn: () => executeHttpGetRequest(API_PATHS.NOTIFICATIONS.BASE, { page, limit: 20 }),
  });
  const notifications = Array.isArray(data?.data?.data) ? data.data.data : [];
  const updateNotification = async (id: string, remove: boolean) => {
    if (processingId !== null) return;
    setProcessingId(id);
    try {
      if (remove) await executeHttpDeleteRequest(`${API_PATHS.NOTIFICATIONS.BASE}/${id}`);
      else await executeHttpPutRequest(API_PATHS.NOTIFICATIONS.READ(id));
      if (remove && notifications.length === 1 && page > 1) setPage((value) => value - 1);
      await queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (remove) toast.success("Notification removed");
    } catch {
      toast.error(remove ? "Failed to delete notification" : "Failed to mark as read");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5 p-4 text-[var(--text-primary)] sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold text-[var(--text-heading)]">Notifications</h1>{data && <span className="text-sm text-[var(--text-muted)]">{data.data.unreadCount ?? 0} unread</span>}</header>
      <section className="border-t border-[var(--border-default)]" aria-label="Notifications">
        {isLoading ? <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...</p> : isError ? <div role="alert" className="flex flex-wrap items-center gap-3 py-8 text-sm"><p>Could not load notifications.</p><Button variant="outline" onClick={() => refetch()}>Retry</Button></div> : !notifications.length ? <div className="py-12 text-center text-[var(--text-muted)]"><Bell className="mx-auto mb-3 h-7 w-7" /><p className="text-sm">No notifications.</p></div> : (
          <ul className="divide-y divide-[var(--border-default)]">
            {notifications.map((notification: any) => {
              const courseId = getCourseId(notification.metadata);
              return <li key={notification.notificationId} className={`flex items-start gap-3 py-4 ${notification.isRead ? "" : "border-l-2 border-[var(--accent-primary)] pl-3"}`}>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><h2 className="break-words text-sm font-semibold">{notification.title}</h2><time className="text-xs text-[var(--text-muted)]">{new Date(notification.createdAt).toLocaleDateString()}</time></div>
                  <p className="break-words text-sm text-[var(--text-secondary)]">{notification.message}</p>
                  {courseId && <Link to={`/courses/${encodeURIComponent(courseId)}`} className="mt-2 inline-flex text-xs text-[var(--accent-primary)] hover:underline">Review course</Link>}
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  {!notification.isRead && <Button variant="ghost" size="icon-sm" title="Mark as read" aria-label="Mark as read" disabled={processingId !== null} onClick={() => updateNotification(String(notification.notificationId), false)}><CheckCircle className="h-4 w-4" /></Button>}
                  <Button variant="ghost" size="icon-sm" title="Delete notification" aria-label="Delete notification" disabled={processingId !== null} onClick={() => updateNotification(String(notification.notificationId), true)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>;
            })}
          </ul>
        )}
      </section>
      <div className="flex flex-wrap items-center justify-end gap-3"><span className="text-xs text-[var(--text-muted)]">Page {page}</span><Button variant="outline" size="icon" title="Previous page" aria-label="Previous page" disabled={page === 1 || isLoading || processingId !== null} onClick={() => setPage((value) => value - 1)}><ArrowLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" title="Next page" aria-label="Next page" disabled={!data?.data?.pagination?.hasNext || isLoading || processingId !== null} onClick={() => setPage((value) => value + 1)}><ArrowRight className="h-4 w-4" /></Button></div>
    </div>
  );
};

export default AdminNotifications;
