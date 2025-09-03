"use client";

import { ChefHat, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side - App name */}
      <div className="flex items-center gap-2">
        <ChefHat className="h-5 w-5 text-orange-500" />
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          All You Can Cook
        </h1>
      </div>

      {/* Right side - Theme toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-7 w-7 hover:bg-accent relative"
      >
        <Sun className="absolute h-4 w-4 text-orange-600 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 text-slate-200 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}
