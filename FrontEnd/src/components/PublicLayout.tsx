/**
 * @file PublicLayout.jsx
 * @description Layout wrapper for unauthenticated / public pages.
 * Provides a flex container that accounts for the 80px Navbar height and
 * renders child routes via the React Router Outlet.
 */
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const PublicLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuth = ["/login", "/signup", "/change-password"].includes(
    location.pathname,
  );

  return (
    <div
      className="flex flex-col min-h-screen relative w-full bg-slate-950 text-slate-300"
    >
      {!isAuth && <Navbar />}
      <main
        className={`flex-1 flex flex-col relative w-full ${isHome || isAuth ? "" : "pt-0"}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
