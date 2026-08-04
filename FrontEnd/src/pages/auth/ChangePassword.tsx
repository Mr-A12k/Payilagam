/**
 * @fileoverview Forced password-change page for Payilagam .
 * Shown to users whose accounts were created by an administrator.
 * Expects the temporary token and user object via router location state.
 * After a successful password update the user is fully logged in and
 * redirected to their role-appropriate dashboard.
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { forceLogin } from "@/store/authSlice";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // We expect the token and user to be passed in location.state
  // If not, this page should not be accessed directly
  const stateToken = location.state?.token;
  const stateUser = location.state?.user;

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (event: React.SyntheticEvent<any>) => {
    setPasswords({
      ...passwords,
      [(event.target as HTMLInputElement).name]: (
        event.target as HTMLInputElement
      ).value,
    });
  };

  const handleSubmit = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (!stateToken || !stateUser) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      // Temporary override the token for this specific request
      const response = await api.put("/auth/change-password", passwords, {
        headers: {
          Authorization: `Bearer ${stateToken}`,
        },
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        // Now fully log them in
        dispatch(forceLogin({ user: stateUser, token: stateToken } as any));

        // Navigate based on pageAccess codes
        const pageAccess = stateUser?.pageAccess || [];
        if (pageAccess.includes("PG_ADM"))
          navigate("/admin", { replace: true });
        else if (pageAccess.includes("PG_MNT"))
          navigate("/mentor", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to change password",
      );
    } finally {
      setIsLoading(true);
    }
  };

  if (!stateToken || !stateUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-400 mb-6">
            You must log in to access this page.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        <div className="p-8">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            Secure Your Account
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Your account was created by an administrator. For security reasons,
            you must change your password before proceeding.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
                className="peer w-full pt-6 pb-2 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-slate-100 placeholder-transparent pr-10"
                placeholder="Current Password"
              />
              <label
                htmlFor="currentPassword"
                className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
              >
                Current Password
              </label>
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-4 text-slate-500 hover:text-blue-400 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative group">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                className="peer w-full pt-6 pb-2 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-slate-100 placeholder-transparent pr-10"
                placeholder="New Password"
              />
              <label
                htmlFor="newPassword"
                className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-4 text-slate-500 hover:text-blue-400 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative group">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                className="peer w-full pt-6 pb-2 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-slate-100 placeholder-transparent pr-10"
                placeholder="Confirm New Password"
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
              >
                Confirm New Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-4 text-slate-500 hover:text-blue-400 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? "Updating..." : "Update Password"}{" "}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
