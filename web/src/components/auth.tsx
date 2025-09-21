"use client";

import { useAuth } from "@/contexts/auth-context";

export function Auth() {
  const { user, loading } = useAuth();

  // This component is now mainly for backward compatibility
  // The actual authentication UI is handled by the LoginPage component
  // and the header authentication controls
  
  if (loading) {
    return null; // Don't show anything while loading
  }

  return null; // The auth state is now managed globally by AuthProvider
}
