import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { loginUser } from "@/store/authSlice";
import toast from "react-hot-toast";
import { AuthField, AuthForm, AuthLink, AuthSubmit } from "./AuthForm";

const Login = () => {
  const [loginCredentials, setLoginCredentials] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLoginCredentials({ ...loginCredentials, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(loginUser(loginCredentials));
      if (loginUser.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload.requiresPasswordChange) {
          toast.error("You must change your password before continuing.");
          navigate("/change-password", {
            state: { user: payload.user, token: payload.token }, replace: true,
          });
          return;
        }
        toast.success("Logged in successfully!");
        const pageAccess = payload.user?.pageAccess || [];
        if (pageAccess.includes("PG_ADM")) navigate("/admin", { replace: true });
        else if (pageAccess.includes("PG_MNT")) navigate("/mentor", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm title="Sign in" description="Welcome back to Payilagam.">
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
        <AuthField id="email" name="email" label="Email address" type="email" autoComplete="username"
          required value={loginCredentials.email} onChange={handleChange} />
        <AuthField id="password" name="password" label="Password" autoComplete="current-password"
          required value={loginCredentials.password} onChange={handleChange} visible={isPasswordVisible}
          onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)} />
        <div className="flex min-h-11 items-center justify-end">
          <AuthLink to="/forgot-password">Forgot password?</AuthLink>
        </div>
        <AuthSubmit busy={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</AuthSubmit>
      </form>
      <p className="mt-6 text-sm leading-6 text-[var(--text-muted)]">
        New to Payilagam? <AuthLink to="/signup">Create an account</AuthLink>
      </p>
    </AuthForm>
  );
};

export default Login;
