/**
 * @fileoverview Forced password-change page for Payilagam .
 * Shown to users whose accounts were created by an administrator.
 * Expects the temporary token and user object via router location state.
 * After a successful password update the user is fully logged in and
 * redirected to their role-appropriate dashboard.
 */
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { forceLogin } from "@/store/authSlice";
import api from "@/api/axiosConfig";
import toast from "react-hot-toast";
import { AuthField, AuthForm, AuthLink, AuthSubmit } from "./AuthForm";

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

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [(event.target as HTMLInputElement).name]: (
        event.target as HTMLInputElement
      ).value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
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
      setIsLoading(false);
    }
  };

  if (!stateToken || !stateUser) {
    return (
      <AuthForm title="Sign in required" description="Sign in before changing your password." backTo="/login" backLabel="Back to sign in">
        <AuthLink to="/login">Go to sign in</AuthLink>
      </AuthForm>
    );
  }

  return (
    <AuthForm title="Change your password" description="Replace your temporary password to finish setting up your account." backTo="/login" backLabel="Back to sign in">
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
        <AuthField id="currentPassword" name="currentPassword" label="Current password" autoComplete="current-password"
          required value={passwords.currentPassword} onChange={handleChange} visible={showCurrentPassword}
          onToggleVisibility={() => setShowCurrentPassword(!showCurrentPassword)} />
        <AuthField id="newPassword" name="newPassword" label="New password" autoComplete="new-password" minLength={6} aria-describedby="password-requirements"
          required value={passwords.newPassword} onChange={handleChange} visible={showNewPassword}
          onToggleVisibility={() => setShowNewPassword(!showNewPassword)} />
        <p id="password-requirements" className="text-xs text-[var(--text-muted)]">At least 6 characters.</p>
        <AuthField id="confirmPassword" name="confirmPassword" label="Confirm new password" autoComplete="new-password" minLength={6}
          required value={passwords.confirmPassword} onChange={handleChange} visible={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)} />
        <AuthSubmit busy={isLoading}>{isLoading ? "Updating password..." : "Update password"}</AuthSubmit>
      </form>
    </AuthForm>
  );
};

export default ChangePassword;
