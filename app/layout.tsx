import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { BrandProvider } from '@/context/BrandContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ToasterProvider } from '@/components/ToasterProvider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const viewport: Viewport = {
  themeColor: '#ea580c',
};

export const metadata: Metadata = {
  title: 'Flavoria & Foodzie — Campus Food Dining & Delivery',
  description: 'Order hot food and pre-schedule meals from your university canteens in seconds.',
  manifest: '/manifest.json',
  keywords: ['campus food', 'university canteen', 'food delivery', 'foodzie', 'flavoria'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Unregister any stale service workers and purge caches immediately
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister();
                  }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) {
                      caches.delete(name);
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <BrandProvider>
            <CurrencyProvider>
              {children}
              <ToasterProvider />
            </CurrencyProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
