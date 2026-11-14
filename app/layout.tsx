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
  title: 'Foodzie — Campus Food Dining & Delivery for Colleges Worldwide',
  description: 'Smart campus food ordering and delivery platform for colleges and universities worldwide.',
  manifest: '/manifest.json',
  keywords: ['campus food', 'university canteen', 'food delivery', 'foodzie', 'colleges worldwide'],
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
    <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
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
              // Enforce 100% Light Theme permanently and wipe any stale dark theme preference
              try {
                localStorage.removeItem('theme');
                localStorage.setItem('theme', 'light');
                if (document.documentElement.classList.contains('dark')) {
                  document.documentElement.classList.remove('dark');
                }
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
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
