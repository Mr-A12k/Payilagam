/**
 * @file ThemeContext.jsx
 * @description Global theme context providing dark/light mode management.
 * - Reads initial theme from: Redux user.theme → localStorage → default "dark"
 * - Applies theme by setting data-theme attribute on <html> element
 * - Persists to localStorage immediately on change
 * - Persists to DB via PUT /auth/profile when user is authenticated
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { executeHttpPutRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  isLight: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSelector((state: any) => state.auth);

  // Determine initial theme: user DB preference > localStorage > default dark
  const getInitialTheme = () => {
    if (user?.theme) return user.theme;
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  };

  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply data-theme attribute to <html> so CSS vars cascade everywhere
  const applyTheme = useCallback((t: any) => {
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  // When user logs in (user object arrives), sync their DB theme preference
  // When user logs out (user becomes null), revert to default 'dark' theme
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setThemeState(user.theme);
      applyTheme(user.theme);
      localStorage.setItem("theme", user.theme);
    } else if (user === null) {
      setThemeState("dark");
      applyTheme("dark");
    }
  }, [user?.theme, user === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount (and theme change), keep the DOM in sync
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    async (newTheme: any) => {
      if (newTheme !== "dark" && newTheme !== "light") return;

      // Apply immediately for instant visual feedback
      setThemeState(newTheme);
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);

      // Persist to DB if authenticated
      if (user) {
        try {
          await executeHttpPutRequest(API_PATHS.AUTH.PROFILE, { theme: newTheme });
        } catch (error) {
                    // Silent failure — localStorage is still updated
          console.warn("Failed to persist theme to server:", error);
        }
      }
    },
    [user, applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, isLight: theme === "light" }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
