import "./globals.css";
import { AuthProvider } from '../../context/AuthContext';
import { TranslationProvider } from '../../i18n';

export const metadata = {
  title: "PlushCryptoAlarm",
  description: "Smart crypto alarm system for your plush devices",
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
