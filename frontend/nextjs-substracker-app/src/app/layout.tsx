import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerTheme, type Theme } from "@/shared/utils/getServerTheme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubsTracker – Manage Your Subscriptions",
  description: "Track and manage all your subscriptions in one place.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const theme:Theme = await getServerTheme();

  return (
    <html lang="en" className={theme}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*w plugin js-cookie non mi serve wrappare dentro un provider, quellos serviva perche usavo plugin react-cookie (bad)*/}
            {children}
      </body>
    </html>
  );
}
