import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";

export default function ThemePicker() {
  const { isLight, toggleTheme } = useTheme();
  const label = `Switch to ${isLight ? "dark" : "light"} theme`;
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} title={label}>
      {isLight ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </Button>
  );
}
