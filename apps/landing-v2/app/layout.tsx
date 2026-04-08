import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { themeColor: "#080808" };

export const metadata: Metadata = {
  title: "X-Track — NFC Race Management Platform",
  description:
    "X-Track powers obstacle course races with NFC BIB scanning, real-time athlete tracking, and complete volunteer coordination.",
  keywords: ["OCR", "obstacle course race", "BIB tracking", "NFC", "x-track", "race management"],
  openGraph: {
    title: "X-Track — NFC Race Management Platform",
    description: "NFC BIB scanning + real-time athlete tracking for OCR events.",
    type: "website",
    siteName: "X-Track",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-Track — Race Management Platform",
    description: "NFC BIB scanning + real-time athlete tracking for OCR events.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
