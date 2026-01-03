import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pornse.org - Free Porn Videos & HD Sex Movies",
    template: "%s | Pornse.org"
  },
  description: "Watch millions of free porn videos and HD sex movies on Pornse.org. Update daily with the hottest porn video content from around the world.",
  keywords: ["porn video", "free porn videos", "sex movies", "hd porn", "online porn"],
  openGraph: {
    title: "Pornse.org - Free Porn Videos & HD Sex Movies",
    description: "Watch millions of free porn videos and HD sex movies on Pornse.org.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
