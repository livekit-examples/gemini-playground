import "./globals.css";
import { PlaygroundStateProvider } from "@/hooks/use-playground-state";
import { ConnectionProvider } from "@/hooks/use-connection";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { PHProvider } from "@/hooks/posthog-provider";
import { Roboto } from "next/font/google";
import PostHogPageView from "@/components/posthog-pageview";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { NavLogo } from "@/components/custom/nav-logo";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { RoomWrapper } from "@/components/room-wrapper";
import { ConfigurationForm } from "@/components/configuration-form";

// Configure the Roboto font
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PHProvider>
            <PlaygroundStateProvider>
              <ConnectionProvider>
                <TooltipProvider>
                  <RoomWrapper>
                    <SidebarProvider defaultOpen={true}>
                      <Sidebar className="bg-bg1">
                        <SidebarHeader>
                          <NavLogo />
                        </SidebarHeader>
                        <SidebarContent className="px-4">
                          <ConfigurationForm />
                        </SidebarContent>
                        <SidebarFooter className="p-4">
                          <ThemeToggle />
                        </SidebarFooter>
                      </Sidebar>
                      <SidebarInset>
                        <PostHogPageView />
                        {children}
                        <Toaster />
                      </SidebarInset>
                    </SidebarProvider>
                  </RoomWrapper>
                </TooltipProvider>
              </ConnectionProvider>
            </PlaygroundStateProvider>
          </PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
