import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI TaskMate - Intelligent Task Management',
  description: 'Production-ready task management with AI-powered insights, offline support, and cloud sync.',
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI TaskMate',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'AI TaskMate',
    title: 'AI TaskMate - Intelligent Task Management',
    description: 'Production-ready task management with AI-powered insights',
  },
  twitter: {
    card: 'summary',
    title: 'AI TaskMate - Intelligent Task Management',
    description: 'Production-ready task management with AI-powered insights',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-32x32.png" sizes="32x32" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI TaskMate" />
        <meta name="application-name" content="AI TaskMate" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}