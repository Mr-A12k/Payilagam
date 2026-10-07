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
import AppToaster from "@/components/ui/AppToaster";
import AppRoutes from "@/routes/AppRoutes";
import { SocketProvider } from "@/context/SocketContext";

const AppContent = () => {
  const dispatch = useAppDispatch();

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
      <AppToaster />
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
