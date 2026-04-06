import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "SubSnap – Manage Your Subscriptions",
  description: "Track and manage all your subscriptions in one place.",
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
