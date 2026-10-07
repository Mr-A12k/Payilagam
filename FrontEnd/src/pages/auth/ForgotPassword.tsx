import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthField, AuthForm, AuthSubmit } from "./AuthForm";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || "http://localhost:5005/api").replace(/\/$/, "")}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        toast.success("OTP sent to your email!");
        setStep("reset");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Unable to send a code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!otp || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || "http://localhost:5005/api").replace(/\/$/, "")}/auth/verify-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });
      if (response.ok) {
        toast.success("Password reset successfully! You can now log in.");
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to reset password");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm title={step === "email" ? "Reset your password" : "Create a new password"} backTo="/login" backLabel="Back to sign in"
      description={step === "email" ? "Enter the email address associated with your account." : <>Verification code sent to <span className="font-medium [overflow-wrap:anywhere]">{email}</span>.</>}>
      {step === "email" ? (
        <form onSubmit={handleRequestOtp} className="space-y-4" aria-busy={isSubmitting}>
          <AuthField id="email" name="email" label="Email address" type="email" autoComplete="email"
            required value={email} onChange={(event) => setEmail(event.target.value)} />
          <AuthSubmit busy={isSubmitting}>{isSubmitting ? "Sending code..." : "Send reset code"}</AuthSubmit>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4" aria-busy={isSubmitting}>
          <AuthField id="otp" name="otp" label="Verification code" type="text" inputMode="numeric" autoComplete="one-time-code"
            required minLength={4} maxLength={4} pattern="[0-9]{4}" autoFocus value={otp} onChange={(event) => setOtp(event.target.value)} />
          <AuthField id="newPassword" name="newPassword" label="New password" autoComplete="new-password"
            required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} visible={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)} />
          <AuthSubmit busy={isSubmitting}>{isSubmitting ? "Resetting password..." : "Reset password"}</AuthSubmit>
          <button type="button" disabled={isSubmitting} onClick={() => { setStep("email"); setOtp(""); setNewPassword(""); }}
            className="min-h-11 rounded text-sm text-[var(--accent-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] disabled:opacity-60">
            Use a different email
          </button>
        </form>
      )}
    </AuthForm>
  );
}
