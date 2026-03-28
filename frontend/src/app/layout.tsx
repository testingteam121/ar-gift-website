import type { Metadata } from 'next';
import { Poppins, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'AR Gifts — Give Gifts That Come Alive',
    template: '%s | AR Gifts',
  },
  description:
    'Create magical AR-enabled gifts that play personalized video messages when scanned. Greeting cards, photo frames, mugs, keychains, and LED frames with augmented reality.',
  keywords: ['AR gifts', 'augmented reality gifts', 'personalized gifts', 'video gifts', 'AR greeting cards', 'custom gifts India'],
  authors: [{ name: 'AR Gifts' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://argifts.com',
    title: 'AR Gifts — Give Gifts That Come Alive',
    description: 'Create magical AR-enabled gifts that play personalized video messages when scanned.',
    siteName: 'AR Gifts',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AR Gifts — Give Gifts That Come Alive',
    description: 'Create magical AR-enabled gifts that play personalized video messages when scanned.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1d1c1c',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '14px 18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px #e6e6e6',
              border: '1px solid #e6e6e6',
            },
            success: {
              iconTheme: { primary: '#F5A900', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
