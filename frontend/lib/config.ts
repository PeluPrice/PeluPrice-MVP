export const isDemoMode = process.env.NEXT_PUBLIC_MODE === 'demo';

export const config = {
  isDemoMode,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  // Demo aktivasyon kodları
  demoCodes: ['DEMO1', 'DEMO2', 'DEMO3', 'DEMO123', 'DEMO456', 'DEMO789', 'TEST1', 'TEST2', 'TEST3'],
  supportedLanguages: ['tr', 'en', 'de', 'fr'] as const,
  defaultLanguage: 'tr' as const,
  supportedCoins: [
    // Top 200 Cryptocurrencies (Market Cap Order)
    'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC', 'XRP', 'DOGE', 'TON', 'ADA',
    'AVAX', 'SHIB', 'DOT', 'LINK', 'TRX', 'MATIC', 'ICP', 'BCH', 'UNI', 'LTC',
    'ETC', 'NEAR', 'APT', 'STX', 'XLM', 'CRO', 'ATOM', 'OKB', 'IMX', 'MNT',
    'HBAR', 'VET', 'FIL', 'OP', 'ARB', 'ALGO', 'SAND', 'MANA', 'LDO', 'GRT',
    'AAVE', 'SNX', 'MKR', 'COMP', 'CRV', 'SUSHI', 'YFI', 'INJ', 'BAL', 'ZRX',
    'REN', 'UMA', 'BAND', 'STORJ', 'KNC', 'ANT', 'MLN', 'NMR', 'LRC', 'BNT',
    'IOTX', 'FTM', 'ANKR', 'CTSI', 'CELR', 'SKL', 'AUDIO', 'BADGER', 'FARM', 'ALPHA',
    'DYDX', 'ENJ', 'CHZ', 'HOT', 'WRX', 'SXP', 'ONE', 'ZIL', 'ICX', 'QTUM',
    'BTT', 'DENT', 'WIN', 'DGB', 'RVN', 'SUN', 'REEF', 'SC', 'ZEN', 'THETA',
    'TFUEL', 'KAVA', 'IOST', 'ONT', 'WAVES', 'LSK', 'NAS', 'IOTA', 'NANO', 'XTZ',
    'DCR', 'DASH', 'ZEC', 'XMR', 'NEO', 'GAS', 'OMG', 'BAT', 'KMD', 'ARDR',
    'BTS', 'STEEM', 'XEM', 'MONA', 'FCT', 'PPC', 'NXT', 'BURST', 'DGD', 'GNT',
    'MAID', 'XCP', 'SYS', 'VTC', 'PIVX', 'DCT', 'XZC', 'IOC', 'GAME', 'LBC',
    'GRC', 'FLO', 'CURE', 'CLOAK', 'START', 'KORE', 'XST', 'TRUST', 'NAV', 'XDN',
    'PINK', 'POT', 'NOTE', 'BLOCK', 'VRC', 'RDD', 'VIA', 'CRW', 'FAIR', 'RBY',
    'BITB', 'BAY', 'LXC', 'OMNI', 'MINT', 'FRST', 'HYP', 'ION', 'ERC', 'VEG',
    'SLG', 'UNO', 'ROS', 'DTC', 'GB', 'BRK', 'CPC', 'AEON', 'CLV', 'PERP',
    'RAY', 'FTT', 'SRM', 'STEP', 'COPE', 'FIDA', 'KIN', 'MAPS', 'OXY', 'ROPE',
    'SLIM', 'MEDIA', 'TULIP', 'LIKE', 'DFL', 'GMT', 'APE', 'JST', 'WOO', 'GAL',
    'LUNC', 'USTC', 'JASMY', 'CVX', 'ROSE', 'RUNE', 'KLAY', 'FLOW', 'EGLD', 'XEC'
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
