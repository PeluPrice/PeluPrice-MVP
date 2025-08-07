import "./globals.css";
import { AuthProvider } from '../../context/AuthContext';
import { TranslationProvider } from '../../i18n';

export const metadata = {
  title: "PeluPrice - Smart Device Monitoring",
  description: "Advanced IoT device monitoring and management platform",
  metadataBase: new URL('https://peluprice.com'),
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
