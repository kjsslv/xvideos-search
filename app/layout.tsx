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
    default: "PhimSex.boo - Free Porn Videos & HD Sex Movies",
    template: "%s | PhimSex.boo"
  },
  description: "Watch millions of free porn videos and HD sex movies on PhimSex.boo. Update daily with the hottest porn video content from around the world.",
  keywords: ["porn video", "free porn videos", "sex movies", "hd porn", "online porn"],
  openGraph: {
    title: "PhimSex.boo - Free Porn Videos & HD Sex Movies",
    description: "Watch millions of free porn videos and HD sex movies on PhimSex.boo.",
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
