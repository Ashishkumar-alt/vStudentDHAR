import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vstudent.in"),
  title: {
    default: "vStudent",
    template: "%s · vStudent",
  },
  description: "Hyperlocal student marketplace for rooms and used items.",
  applicationName: "vStudent",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
          (function () {
            try {
              var t = window.localStorage.getItem("vstudent.theme");
              if (t === "dark" || t === "light") {
                document.documentElement.dataset.theme = t;
              }
            } catch (e) {}
          })();
          `}
        </Script>
      </head>

      <body className={`${inter.variable} h-full antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}