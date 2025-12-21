import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { TooltipButton } from "./tooltip/tooltip-button";

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipButton
      tooltip="Toggle Light/Dark Theme"
      className="text-muted-foreground"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </TooltipButton>
  );
};
