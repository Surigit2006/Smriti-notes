import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";

import { SmritiThemeProvider } from "@/themes/ThemeProvider";
import { SerwistProvider } from "./SerwistProvider";
import ThemeScript from "@/themes/ThemeScript";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Smriti Notes",
  title: {
    default: "Smriti Notes",
    template: "%s | Smriti Notes",
  },
  description: "Your notebook, reimagined.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Smriti",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/smriti-exp.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#f5f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SerwistProvider swUrl="/sw.js">
          <SmritiThemeProvider>{children}</SmritiThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
