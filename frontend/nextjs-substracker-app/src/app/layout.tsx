import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getServerTheme, type Theme } from "@/shared/utils/getServerTheme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/*w plugin js-cookie non mi serve wrappare dentro un provider, quello serviva perche usavo plugin react-cookie (bad)*/}
            {children}
      </body>
    </html>
  );
}
