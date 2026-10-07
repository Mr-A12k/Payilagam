/**
 * @file PublicLayout.tsx
 * @description Layout wrapper for unauthenticated / public pages.
 * Renders public routes with navigation outside the dedicated auth flows.
 */
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const PublicLayout = () => {
  const location = useLocation();
  const isAuth = [
    "/login",
    "/signup",
    "/forgot-password",
    "/change-password",
  ].includes(location.pathname.replace(/\/+$/, ""));

  return (
    <div className="relative flex min-h-svh w-full min-w-0 flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      {!isAuth && <Navbar />}
      <main className="relative flex w-full min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
