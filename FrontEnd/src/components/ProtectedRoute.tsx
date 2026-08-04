/**
 * @file ProtectedRoute.jsx
 * @description Route guard component that restricts access based on authentication
 * and optional page-access codes (e.g. PG_ADM, PG_MNT). Redirects unauthenticated
 * users to login and unauthorized users to their role-appropriate dashboard.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./ui/Loader";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: any[] }) => {
  const { user, loading } = useSelector((state: any) => state.auth);
  const location = useLocation();

  // Show a full-screen spinner while the auth state is still being resolved
  if (loading) {
    return <Loader fullScreen text="Authenticating..." className="" />;
  }

  if (!user) {
    // Redirect to login while saving the attempted url so we can return after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    allowedRoles &&
    // Map authorization check using roleId (e.g., 1 = Admin, 2 = Mentor, 3 = Student)
    !allowedRoles.includes(user.roleId)
  ) {
    // Role not authorized — cascade through access levels to find the best fallback based on roleId
    if (user.roleId === 1) // Fallback for Admins
      return <Navigate to="/admin" replace />;
    if (user.roleId === 2) // Fallback for Mentors
      return <Navigate to="/mentor" replace />;
    // Default fallback for Students (roleId 3)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
