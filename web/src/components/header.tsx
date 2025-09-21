"use client";

import { ChefHat, Moon, Sun, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { LoginPage } from "@/components/login-page";
import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-md mx-auto w-full px-4 py-2 flex items-center justify-between">
          {/* Left side - App name */}
          <a 
            href="https://allyoucancook.life/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="h-5 w-5 text-orange-500" />
            <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              All You Can Cook
            </h1>
          </a>

          {/* Right side - Auth and Theme toggle */}
          <div className="flex items-center gap-2">
          {/* Authentication */}
          {loading ? (
            <div className="h-7 w-7" /> // Placeholder to prevent layout shift
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full hover:bg-accent"
                >
                  <User className="h-4 w-4 text-foreground mr-2" />
                  <span className="text-sm text-foreground">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLoginDialog(true)}
              className="h-7 px-3 text-sm hover:bg-accent text-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}

          {/* Theme toggle */}
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
          </div>
        </div>
      </header>

      <LoginPage
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </>
  );
}
