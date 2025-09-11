import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "All You Can Cook - Your AI Cooking Assistant",
  description: "Experience interactive cooking with your personal AI chef assistant. Get step-by-step guidance, answer questions, and discover new recipes through natural conversation.",
  keywords: ["AI cooking", "cooking assistant", "recipe guide", "interactive cooking", "voice cooking assistant"],
  icons: {
    icon: '/logo.ico',
    shortcut: '/logo.ico',
    apple: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="fixed inset-0 -z-10">
          <div className="cosmic-gradient absolute inset-0" />
        </div>
        {children}
      </body>
    </html>
  );
}
