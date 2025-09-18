import "./globals.css";
import { PlaygroundStateProvider } from "@/hooks/use-playground-state";
import { ConnectionProvider } from "@/hooks/use-connection";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { PHProvider } from "@/hooks/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { RecipeProvider } from "@/hooks/use-recipe";
import { AuthProvider } from "@/contexts/auth-context";
import { Roboto } from "next/font/google";
import dynamic from "next/dynamic";
import { ScrollToTop } from "@/components/scroll-to-top";

const PostHogPageView = dynamic(
  () => import("../components/posthog-pageview"),
  {
    ssr: false,
  }
);

// Configure the Public Sans font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

import "@livekit/components-styles";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <PHProvider>
          <ThemeProvider defaultTheme="dark" storageKey="all-you-can-cook-theme">
            <AuthProvider>
              <RecipeProvider>
                <PlaygroundStateProvider>
                  <ConnectionProvider>
                    <TooltipProvider>
                      <PostHogPageView />
                      <ScrollToTop />
                      {children}
                      <Toaster />
                    </TooltipProvider>
                  </ConnectionProvider>
                </PlaygroundStateProvider>
              </RecipeProvider>
            </AuthProvider>
          </ThemeProvider>
        </PHProvider>
      </body>
    </html>
  );
}
