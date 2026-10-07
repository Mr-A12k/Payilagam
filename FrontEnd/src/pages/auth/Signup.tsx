import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { registerUser } from "@/store/authSlice";
import toast from "react-hot-toast";
import { AuthField, AuthForm, AuthLink, AuthSubmit } from "./AuthForm";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userName: "",
    mobile: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [(event.target as HTMLInputElement).name]: (
        event.target as HTMLInputElement
      ).value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!formData.fullName.trim() || !formData.userName.trim() || !formData.mobile.trim()) return toast.error('Please fill in all account details');
    if (!agreed) {
      toast.error("You must agree to the Terms of Service");
      return;
    }
    
    if (step === "details") {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${(import.meta.env.VITE_API_URL || "http://localhost:5005/api").replace(/\/$/, "")}/auth/request-signup-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email })
        });
        if (response.ok) {
          toast.success("OTP sent to your email");
          setStep("otp");
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to send OTP");
        }
      } catch {
        toast.error("Unable to send a code. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === "otp" && !otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsSubmitting(true);

    const userName = formData.userName.trim();

    try {
      const resultAction = await dispatch(
        registerUser({
          ...formData,
          userName,
          fullName: formData.fullName || userName,
          otp
        }),
      );

      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Account created successfully!");
        const pageAccess = resultAction.payload.user?.pageAccess || [];
        if (pageAccess.includes("PG_MNT"))
          navigate("/mentor", { replace: true });
        else navigate("/dashboard", { replace: true });
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm title={step === "details" ? "Create an account" : "Verify your email"}
      description={step === "details" ? "Your Payilagam account details." : <>Verification code sent to <span className="font-medium [overflow-wrap:anywhere]">{formData.email}</span>.</>}>
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
        {step === "details" ? <>
          <AuthField id="fullName" name="fullName" label="Full name" autoComplete="name"
            required value={formData.fullName} onChange={handleChange} />
          <AuthField id="userName" name="userName" label="Username" autoComplete="username"
            required value={formData.userName} onChange={handleChange} />
          <AuthField id="mobile" name="mobile" label="Mobile number" type="tel" autoComplete="tel"
            required value={formData.mobile} onChange={handleChange} />
          <AuthField id="email" name="email" label="Email address" type="email" autoComplete="email"
            required value={formData.email} onChange={handleChange} />
          <AuthField id="password" name="password" label="Password" autoComplete="new-password"
            required value={formData.password} onChange={handleChange} visible={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)} />
          <div className="flex items-start gap-3 text-sm leading-6 text-[var(--text-muted)]">
            <input id="agreed" type="checkbox" required checked={agreed} onChange={(event) => setAgreed(event.target.checked)}
              aria-labelledby="agreement-label"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]" />
            <div id="agreement-label">
              <label htmlFor="agreed" className="cursor-pointer">I agree to the </label>
              <AuthLink to="/terms">Terms of Service</AuthLink> and <AuthLink to="/terms">Privacy Policy</AuthLink>.
            </div>
          </div>
        </> : <>
          <AuthField id="otp" name="otp" label="Verification code" type="text" inputMode="numeric" autoComplete="one-time-code"
            required minLength={6} maxLength={6} pattern="[0-9]{6}" autoFocus value={otp} onChange={(event) => setOtp(event.target.value)} />
          <button type="button" disabled={isSubmitting} onClick={() => { setStep("details"); setOtp(""); }}
            className="min-h-11 rounded text-sm text-[var(--accent-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] disabled:opacity-60">
            Edit account details
          </button>
        </>}
        <AuthSubmit busy={isSubmitting}>
          {isSubmitting ? (step === "details" ? "Sending code..." : "Creating account...") : (step === "details" ? "Create account" : "Verify and create account")}
        </AuthSubmit>
      </form>
      <p className="mt-6 text-sm leading-6 text-[var(--text-muted)]">
        Already have an account? <AuthLink to="/login">Sign in</AuthLink>
      </p>
    </AuthForm>
  );
};

export default Signup;
