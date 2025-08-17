import "./globals.css";
import { AuthProvider } from '../../context/AuthContext';
import { TranslationProvider } from '../../i18n';

export const metadata = {
  title: "PeluPrice - World's Smartest Crypto Plush Toys",
  description: "Plush toys equipped with patented LED technology track your crypto portfolio 24/7. Green hands for profit, red hands for loss! Starting from $99, free shipping worldwide.",
  keywords: "crypto, bitcoin, ethereum, plush toy, smart toy, crypto alarm, price tracking, LED technology",
  metadataBase: new URL('https://peluprice.com'),
  openGraph: {
    title: "PeluPrice - World's Smartest Crypto Plush Toys",
    description: "Track the crypto market with adorable plush toys. 50,000+ happy customers!",
    url: 'https://peluprice.com',
    siteName: 'PeluPrice',
    images: [
      {
        url: '/peluprice-bear.png',
        width: 1200,
        height: 630,
        alt: 'PeluPrice Smart Plush Bear - Crypto Tracking Toy',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PeluPrice - World's Smartest Crypto Plush Toys",
    description: "Track the crypto market with adorable plush toys!",
    images: ['/peluprice-bear.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TranslationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
