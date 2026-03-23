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
    default: 'cicatriz.digital — Your natal chart in your calendar',
    template: '%s · cicatriz.digital',
  },
  description: 'Personalized astrological transits, lunar phases, and planetary ingresses delivered directly to Google Calendar. Based on your natal chart. No account needed.',
  keywords: ['astrology', 'natal chart', 'transits', 'google calendar', 'ical', 'horoscope', 'planetary transits'],
  authors: [{ name: 'cicatriz.digital' }],
  openGraph: {
    type: 'website',
    siteName: 'cicatriz.digital',
    title: 'cicatriz.digital — Your natal chart in your calendar',
    description: 'Personalized astrological transits delivered to Google Calendar. Based on your natal chart. No account needed.',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'cicatriz.digital' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cicatriz.digital — Your natal chart in your calendar',
    description: 'Personalized astrological transits delivered to Google Calendar. Based on your natal chart. No account needed.',
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
