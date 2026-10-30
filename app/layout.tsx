import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Himesh Expense Tracker | Daily Expense & Financial Manager',
  description:
    'Track daily expenses, bank accounts, and weekly, monthly, and yearly budgets offline with 0ms latency.',
  applicationName: 'Himesh Expense Tracker',
  authors: [{ name: 'Himesh' }],
  keywords: [
    'expense tracker',
    'daily expense',
    'bank account tracker',
    'offline expense tracker',
    'yearly expense tracking',
    'indexeddb',
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
  themeColor: '#000000',
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
      <body className="bg-black text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300 min-h-screen">
        {children}
      </body>
    </html>
  );
}
