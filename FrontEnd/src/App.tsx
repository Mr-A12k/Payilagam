/**
 * @file App.jsx
 * @description Root application component. Sets up React Router and renders the global
 * Toaster for notifications alongside the main route tree.
 * On mount, it dispatches fetchProfile to rehydrate the auth state from the server.
 * The Provider and ThemeProvider are set up in main.jsx above this component.
 */
import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { fetchProfile } from "@/store/authSlice";
import { Toaster } from "react-hot-toast";
import AppRoutes from "@/routes/AppRoutes";
import { useTheme } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isLight } = useTheme();

  // Fetch user profile on initial load if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchProfile() as any);
    }
  }, [dispatch]);

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: isLight ? "#ffffff" : "#1e293b",
            color: isLight ? "#0f172a" : "#f1f5f9",
            border: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
            borderRadius: "8px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: isLight ? "#ffffff" : "#1e293b",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: isLight ? "#ffffff" : "#1e293b",
            },
          },
        }}
      />
      <AppRoutes />
    </div>
  );
};

function App() {
  return (
    <Router>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </Router>
  );
}

export default App;
