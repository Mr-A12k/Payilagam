/**
 * @file ThemeContext.tsx
 * @description Global theme context providing Dark / Light mode management.
 * - Supports strictly Dark and Light themes (all others commented out as requested).
 * - Guaranteed persistence across page reloads via localStorage + pre-hydration script.
 * - Persists to DB via PUT /auth/profile when user is authenticated.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { executeHttpPutRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

export const THEMES = [
  { value: "dark", label: "Midnight Blue", color: "#2563eb", light: false },
  { value: "light", label: "Light", color: "#292d34", light: true },
  /*
  // Other themes kept commented out as requested:
  { value: "cyber", label: "Cyber Indigo", color: "#6366f1", light: false },
  { value: "ocean", label: "Ocean", color: "#1765a3", light: true },
  { value: "rose", label: "Rose", color: "#a33658", light: true },
  { value: "graphite", label: "Graphite", color: "#e7bf75", light: false },
  { value: "forest", label: "Forest", color: "#8ad6a8", light: false },
  { value: "ember", label: "Ember", color: "#ffad96", light: false },
  */
];

const normalizeTheme = (val: unknown): "dark" | "light" => {
  if (val === "light") return "light";
  return "dark"; // Default to dark for any other value (prevents resetting on refresh)
};

interface ThemeContextType {
  theme: "dark" | "light";
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

  // Determine initial theme: localStorage takes highest priority on client refresh
  const getInitialTheme = (): "dark" | "light" => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      if (user?.theme === "light" || user?.theme === "dark") return user.theme;
    } catch {
      // ignore storage access errors
    }
    return "dark";
  };

  const [theme, setThemeState] = useState<"dark" | "light">(getInitialTheme);

  // Apply theme attributes to <html> element and sync localStorage
  const applyTheme = useCallback((t: "dark" | "light") => {
    const selected = normalizeTheme(t);
    document.documentElement.setAttribute("data-theme", selected);
    document.documentElement.setAttribute("data-palette", selected);
    try {
      localStorage.setItem("theme", selected);
    } catch {
      // ignore
    }
  }, []);

  // When user profile loads from server, only sync if user explicitly has a valid theme saved in DB
  useEffect(() => {
    if (user?.theme && (user.theme === "light" || user.theme === "dark")) {
      const stored = localStorage.getItem("theme");
      // If local storage is missing or matches DB, apply
      if (!stored && user.theme !== theme) {
        setThemeState(user.theme);
        applyTheme(user.theme);
      }
    }
  }, [user?.theme, theme, applyTheme]);

  // Keep DOM in sync on mount and whenever theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    async (newTheme: string) => {
      const target = normalizeTheme(newTheme);

      // Apply immediately for instant feedback and lock into localStorage
      setThemeState(target);
      applyTheme(target);

      // Persist to DB if authenticated
      if (user) {
        try {
          await executeHttpPutRequest(API_PATHS.AUTH.PROFILE, {
            theme: target,
          });
        } catch (error) {
          // Non-blocking failure - localStorage is already locked
          console.warn("Failed to persist theme to server:", error);
        }
      }
    },
    [user, applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isLight: theme === "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
