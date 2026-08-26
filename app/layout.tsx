import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Himesh Expense Tracker | Enterprise Financial Suite',
  description:
    'High-density, production-grade, offline-first personal finance tracker with 0ms latency IndexedDB persistence, executive summaries, and analytics.',
  applicationName: 'Himesh Expense Tracker',
  authors: [{ name: 'Himesh' }],
  keywords: [
    'expense tracker',
    'fintech dashboard',
    'pwa',
    'indexeddb',
    'offline expense tracker',
    'upi tracker',
  ],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Himesh Expenses',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0F17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#0B0F17] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
