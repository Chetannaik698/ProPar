import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = "https://propar.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProPar — Think Before You Send.",
    template: "%s — ProPar",
  },
  description:
    "ProPar reviews your prompts, emails, LinkedIn posts, and professional writing before you hit send — helping you communicate with greater clarity, confidence, and impact.",
  keywords: [
    "ProPar",
    "prompt review",
    "writing assistant",
    "AI communication",
    "email review",
    "LinkedIn writing",
    "prompt enhancement",
  ],
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "ProPar — Think Before You Send.",
    description:
      "ProPar reviews your writing before you hit send — surfacing missing context, hidden assumptions, and blind spots.",
    siteName: "ProPar",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ProPar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProPar — Think Before You Send.",
    description:
      "ProPar reviews your writing before you hit send — surfacing missing context, hidden assumptions, and blind spots.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
          >
            Skip to content
          </a>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
