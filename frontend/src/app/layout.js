import "./globals.css";
import { AuthProvider } from '../../context/AuthContext';
import { TranslationProvider } from '../../i18n';

export const metadata = {
  title: "PeluPrice - Kripto Dünyasının En Akıllı Peluş Oyuncakları",
  description: "Patentli LED teknolojisi ile donatılmış peluş oyuncaklar, kripto portföyünüzü 24/7 takip eder. Yeşil gözler kar, kırmızı gözler zarar! ₺2,999'dan başlayan fiyatlar, ücretsiz kargo.",
  keywords: "kripto, bitcoin, ethereum, peluş oyuncak, akıllı oyuncak, kripto alarm, fiyat takibi, LED teknoloji",
  metadataBase: new URL('https://peluprice.com'),
  openGraph: {
    title: "PeluPrice - Kripto Dünyasının En Akıllı Peluş Oyuncakları",
    description: "Sevimli peluş oyuncaklarınızla kripto piyasasını takip edin. 50,000+ mutlu müşteri!",
    url: 'https://peluprice.com',
    siteName: 'PeluPrice',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PeluPrice Akıllı Peluş Oyuncaklar',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PeluPrice - Kripto Dünyasının En Akıllı Peluş Oyuncakları",
    description: "Sevimli peluş oyuncaklarınızla kripto piyasasını takip edin!",
    images: ['/twitter-image.jpg'],
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
    <html lang="tr">
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
