export const isDemoMode = process.env.NEXT_PUBLIC_MODE === 'demo';

export const config = {
  isDemoMode,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportedLanguages: ['tr', 'en', 'de', 'fr'] as const,
  defaultLanguage: 'tr' as const,
  supportedCoins: [
    'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI'
  ],
  voiceOptions: [
    { id: 'voice1', name: 'Ayşe (Kadın)', language: 'tr' },
    { id: 'voice2', name: 'Mehmet (Erkek)', language: 'tr' },
    { id: 'voice3', name: 'Sarah (Female)', language: 'en' },
    { id: 'voice4', name: 'John (Male)', language: 'en' },
    { id: 'voice5', name: 'Anna (Weiblich)', language: 'de' },
    { id: 'voice6', name: 'Klaus (Männlich)', language: 'de' },
    { id: 'voice7', name: 'Marie (Femme)', language: 'fr' },
    { id: 'voice8', name: 'Pierre (Homme)', language: 'fr' },
  ]
};

export type SupportedLanguage = typeof config.supportedLanguages[number];
export type SupportedCoin = typeof config.supportedCoins[number];
export type VoiceOption = typeof config.voiceOptions[number];
