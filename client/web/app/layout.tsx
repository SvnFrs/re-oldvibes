import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./_contexts/AuthContext";
import Header from "./_components/layout/Header";
import Footer from "./_components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Old Vibes - Discover Amazing Secondhand Treasures",
  description:
    "Connect with vintage enthusiasts and discover unique secondhand items through our mobile app. Share your old vibes and find amazing treasures from the past.",
  keywords: [
    "secondhand",
    "vintage",
    "marketplace",
    "old items",
    "retro",
    "antique",
    "preloved",
  ],
  authors: [{ name: "Old Vibes Team" }],
  creator: "Old Vibes",
  publisher: "Old Vibes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://oldvibes.io.vn"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gruvbox-dark-bg0 text-gruvbox-dark-fg1`}>        
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
