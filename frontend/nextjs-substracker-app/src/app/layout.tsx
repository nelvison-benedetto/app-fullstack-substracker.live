import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://substracker.live";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
//Inter (UI font): modern ui font, used for general text, optimized loading

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
//JetBrains Mono (code font): monospace font, used for numbers/code/dashboard, great for financial data

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SubSnap – Manage Your Subscriptions",
    template: "%s – SubSnap",
  },
  description:
    "Track and manage all your subscriptions in one place. Never miss a renewal date again.",
  keywords: ["subscription tracker", "manage subscriptions", "SubSnap", "recurring payments"],
  authors: [{ name: "SubSnap" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "SubSnap",
    title: "SubSnap – Manage Your Subscriptions",
    description:
      "Track and manage all your subscriptions in one place. Never miss a renewal date again.",
  },
  twitter: {
    card: "summary",
    title: "SubSnap – Manage Your Subscriptions",
    description:
      "Track and manage all your subscriptions in one place. Never miss a renewal date again.",
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      en: BASE_URL,
      it: `${BASE_URL}/it`,
    },
  },
};

// Root layout: non imposta lang/theme (lo fa [locale]/layout.tsx)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>    {/* 'variable' creates css variable e.g.--font-inter or --font-jetbrains-mono */}
        {children}
      </body>
    </html>
  );
}
