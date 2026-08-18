import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const siteUrl = "https://propaar.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProPaar — Think Before You Send.",
    template: "%s · ProPaar",
  },
  description:
    "ProPaar reviews your prompts, emails, LinkedIn posts, and professional writing before you hit send — surfacing missing context and blind spots so you communicate with more clarity.",
  keywords: [
    "ProPaar",
    "prompt review",
    "AI writing assistant",
    "before you send",
    "communication clarity",
    "chrome extension",
    "prompt enhancement",
  ],
  authors: [{ name: "ProPaar" }],
  creator: "ProPaar",
  applicationName: "ProPaar",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ProPaar",
    title: "ProPaar — Think Before You Send.",
    description:
      "Catch missing context and blind spots before you hit send. ProPaar reviews prompts, emails, and professional writing in real time.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ProPaar — Think Before You Send." }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProPaar — Think Before You Send.",
    description:
      "ProPaar reviews your prompts, emails, and professional writing before you hit send.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ProPaar",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Chrome",
  description:
    "ProPaar reviews prompts, emails, LinkedIn posts, and professional writing before you hit send, surfacing missing context and blind spots.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: siteUrl,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
