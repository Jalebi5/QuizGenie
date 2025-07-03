"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "high-contrast";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  // On mount, read theme from localStorage and set state.
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme && ["light", "dark", "high-contrast"].includes(storedTheme)) {
        setTheme(storedTheme);
        
        document.documentElement.classList.remove("dark", "high-contrast");
        if (storedTheme !== 'light') {
            document.documentElement.classList.add(storedTheme);
        }
    }
    setMounted(true);
  }, []);
  
  const handleThemeChange = (newTheme: Theme) => {
    // Update class on <html>
    document.documentElement.classList.remove("dark", "high-contrast");
    if (newTheme !== 'light') {
        document.documentElement.classList.add(newTheme);
    }
    // Update localStorage
    localStorage.setItem("theme", newTheme);
    // Update state
    setTheme(newTheme);
  }

  // Render a placeholder on the server to avoid hydration mismatch
  if (!mounted) {
    return (
        <Button variant="ghost" size="icon" disabled>
            <Sun className="h-[1.2rem] w-[1.2rem]" />
        </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "high-contrast" && <Eye className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("high-contrast")}>
          <Eye className="mr-2 h-4 w-4" />
          <span>High Contrast</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
