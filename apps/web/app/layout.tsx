import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'X-TRACK Admin',
  description: 'X-TRACK BIB Management Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
