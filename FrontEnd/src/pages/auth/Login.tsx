/**
 * @fileoverview Login page for Payilagam .
 * Provides email/password authentication with social login options.
 * On successful login, redirects to the role-appropriate dashboard
 * (admin, mentor, or student). Forces password change when required.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { loginUser } from "@/store/authSlice";
import { ArrowRight, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import PayilagamLogo from "@/components/ui/PayilagamLogo";
import { Button } from "@/components/ui/Button";

const Login = () => {
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRememberMe, setShouldRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (event: React.SyntheticEvent<any>) => {
    setLoginCredentials({
      ...loginCredentials,
      [(event.target as HTMLInputElement).name]: (
        event.target as HTMLInputElement
      ).value,
    });
  };

  const handleSubmit = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(loginUser(loginCredentials));

      if (loginUser.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;

        if (payload.requiresPasswordChange) {
          toast.error("You must change your password before continuing.");
          navigate("/change-password", {
            state: { user: payload.user, token: payload.token },
            replace: true,
          });
          return;
        }

        toast.success("Logged in successfully!");

        // Navigate based on pageAccess codes
        const pageAccess = payload.user?.pageAccess || [];
        if (pageAccess.includes("PG_ADM"))
          navigate("/admin", { replace: true });
        else if (pageAccess.includes("PG_MNT"))
          navigate("/mentor", { replace: true });
        else navigate("/dashboard", { replace: true });
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#030712] selection:bg-blue-500/30">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-[20%] left-[40%] w-[40%] h-[40%] bg-sky-400/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "7s", animationDelay: "2s" }}
        ></div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none"></div>

      {/* Floating Glass Card */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-900/50 p-2 px-4 rounded-full border border-slate-700/50 backdrop-blur-md"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        <div className="relative rounded-3xl overflow-hidden backdrop-blur-2xl bg-slate-900/50 border border-slate-700/50 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] p-6 sm:p-8 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
          <div className="relative z-20 flex flex-col items-center">
            {/* Premium Logo Wrapper */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-500 p-[1px] mb-6 shadow-xl shadow-blue-900/30">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <PayilagamLogo className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Custom Animated Input: Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={loginCredentials.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium text-white placeholder:text-slate-500 transition-all hover:bg-slate-900/80"
                  placeholder="Email Address"
                />
              </div>

              {/* Custom Animated Input: Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  value={loginCredentials.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium text-white placeholder:text-slate-500 transition-all hover:bg-slate-900/80"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-blue-400 transition-colors"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <input
                      type="checkbox"
                      checked={shouldRememberMe}
                      onChange={(event: React.SyntheticEvent<any>) =>
                        setShouldRememberMe(
                          (event.target as HTMLInputElement).checked,
                        )
                      }
                      className="peer appearance-none w-4 h-4 border border-slate-600 rounded bg-slate-950 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                    />
                    <svg
                      className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors hover:underline decoration-blue-500/30 underline-offset-4"
                >
                  Forgot password?
                </a>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group py-6 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-500 transition-all duration-300 mt-2 border-0"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="w-full flex items-center gap-4 my-6">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Or continue with
              </span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-sm font-semibold text-white transition-all hover:border-slate-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-sm font-semibold text-white transition-all hover:border-slate-600">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 font-medium hover:text-sky-300 transition-colors hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 lg:hidden">
            © 2024 Payilagam . Empowering learners worldwide.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
