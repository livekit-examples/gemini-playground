"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { handlePostLoginRedirect } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChefHat, Sparkles, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface LoginPageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
  onLoginSuccess?: () => void;
}

export function LoginPage({ open, onOpenChange, redirectTo, onLoginSuccess }: LoginPageProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onLoginSuccess?.();
      onOpenChange(false);
      
      // Handle redirect - first check for stored redirect, then explicit redirectTo prop
      const hasRedirected = handlePostLoginRedirect();
      if (!hasRedirected && redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 border-0 rounded-lg overflow-hidden max-h-[90vh] flex flex-col bg-white dark:bg-gray-900"
        isModal={true}
      >
        <div className="overflow-y-auto">
          <div className="px-6 pb-6 pt-4">
            <DialogHeader className="gap-4 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <ChefHat className="h-12 w-12 text-orange-500" />
                  <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                </div>
              </div>
              <DialogTitle className="text-2xl text-black dark:text-white">
                Sign in to All You Can Cook
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-gray-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-orange-500" />
                Why sign in?
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• AI cooking sessions</li>
                <li>• Save your favorite recipes</li>
                <li>• Track your cooking sessions</li>
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FcGoogle className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>
              
              <div className="text-center">
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-sm text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-white underline"
                >
                  Skip signing in for now
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-black dark:text-gray-400">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
