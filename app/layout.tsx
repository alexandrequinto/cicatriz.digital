import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://cicatriz.digital'),
  title: {
    default: 'Cicatriz — Marked by the cosmos',
    template: '%s · Cicatriz',
  },
  description: 'Your natal chart, delivered to your calendar. Personalized planetary transits, lunar phases, sign ingresses, and retrograde stations — updated automatically. No account needed.',
  keywords: ['astrology', 'natal chart', 'transits', 'google calendar', 'ical', 'planetary transits', 'cicatriz'],
  authors: [{ name: 'Cicatriz' }],
  openGraph: {
    type: 'website',
    siteName: 'Cicatriz',
    title: 'Cicatriz — Marked by the cosmos',
    description: 'Your natal chart, delivered to your calendar. Personalized planetary transits and lunar phases — no account needed.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Cicatriz — Marked by the cosmos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cicatriz — Marked by the cosmos',
    description: 'Your natal chart, delivered to your calendar. Personalized planetary transits and lunar phases — no account needed.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
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
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
