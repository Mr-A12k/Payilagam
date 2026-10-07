import toast, { Toaster, ToastBar } from "react-hot-toast";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      toastOptions={{
        duration: 4500,
        style: {
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: 8,
          padding: "12px",
          maxWidth: "min(380px, calc(100vw - 32px))",
          fontSize: 13,
          boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
        },
      }}
    >
      {(notification) => {
        const Icon =
          notification.type === "success"
            ? CircleCheck
            : notification.type === "error"
              ? CircleAlert
              : Info;
        const color =
          notification.type === "success"
            ? "var(--status-success)"
            : notification.type === "error"
              ? "var(--status-danger)"
              : "var(--status-info)";
        return (
          <ToastBar
            toast={notification}
            style={{ borderLeft: `3px solid ${color}` }}
          >
            {({ icon, message }) => (
              <div className="app-toast-layout flex min-w-0 items-start gap-2.5">
                {notification.type === "loading" ? (
                  icon
                ) : (
                  <Icon
                    className="mt-0.5 h-[18px] w-[18px] shrink-0"
                    style={{ color }}
                  />
                )}
                <div className="min-w-0 flex-1 text-sm leading-5 [overflow-wrap:anywhere]">
                  {message}
                </div>
                {notification.type !== "loading" && (
                  <button
                    aria-label="Dismiss notification"
                    title="Dismiss"
                    onClick={() => toast.dismiss(notification.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
}
