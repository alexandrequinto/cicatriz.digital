import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: 'Astro iCal — Your Personal Astrology Calendar',
  description: 'Generate a personalized Google Calendar subscription with your astrological transits, lunar phases, and planetary ingresses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(99,57,189,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%), #0a0a1a",
        }}
      >
        {children}
      </body>
    </html>
  );
}
