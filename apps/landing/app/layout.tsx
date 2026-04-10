import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
};

export const metadata: Metadata = {
  title: "X-Track — Every BIB. Every Obstacle. Every Second.",
  description:
    "X-Track is the intelligent OCR race management platform. NFC BIB scanning, real-time athlete tracking, and complete volunteer coordination — all in one.",
  keywords: [
    "OCR",
    "obstacle course race",
    "BIB tracking",
    "NFC race timing",
    "x-track",
    "race management",
    "athlete tracking",
  ],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "X-Track — Every BIB. Every Obstacle. Every Second.",
    description:
      "NFC-powered BIB scanning, live athlete tracking, and event management for obstacle course races.",
    type: "website",
    siteName: "X-Track",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-Track — Race Intelligence Platform",
    description:
      "NFC BIB scanning + real-time athlete tracking for OCR events.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
