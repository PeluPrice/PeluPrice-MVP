'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import LanguageSelector from '../../components/LanguageSelector';
import { Navbar } from '../../components/Navbar';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { t, locale, isLoading: translationsLoading } = useTranslation();
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [activationCode, setActivationCode] = useState('');
  const [wishlistData, setWishlistData] = useState({
    name: '',
    email: '',
    selectedPlan: t('homepage.packages.pro.name')
  });

  const stats = [
    { number: "16+", label: t('homepage.heroStats.battery') },
    { number: "5>", label: t('homepage.heroStats.response') },
    { number: "200+", label: t('homepage.heroStats.coins') },
    { number: "24/7", label: t('homepage.heroStats.support') }
  ];

  const features = [
    {
      title: t('homepage.features.list.led.title'),
      description: t('homepage.features.list.led.description'),
      icon: "👁️",
      details: t('homepage.features.list.led.details')
    },
    {
      title: t('homepage.features.list.crypto.title'), 
      description: t('homepage.features.list.crypto.description'),
      icon: "₿",
      details: t('homepage.features.list.crypto.details')
    },
    {
      title: t('homepage.features.list.voice.title'),
      description: t('homepage.features.list.voice.description'),
      icon: "🔊",
      details: t('homepage.features.list.voice.details')
    },
    {
      title: t('homepage.features.list.mobile.title'),
      description: t('homepage.features.list.mobile.description'),
      icon: "📱",
      details: t('homepage.features.list.mobile.details')
    },
    {
      title: t('homepage.features.list.analytics.title'),
      description: t('homepage.features.list.analytics.description'),
      icon: "📊",
      details: t('homepage.features.list.analytics.details')
    },
    {
      title: t('homepage.features.list.security.title'),
      description: t('homepage.features.list.security.description'),
      icon: "🔐",
      details: t('homepage.features.list.security.details')
    }
  ];

  const getPackageFeatures = (packageType) => {
    if (locale === 'tr') {
      switch (packageType) {
        case 'starter':
          return [
            "1 Adet Akıllı Peluş Oyuncak",
            "5 Kripto Para Takibi",
            "Temel LED Göz Teknolojisi",
            "Mobil Uygulama Desteği",
            "Email Bildirimleri",
            "6 Ay Garanti"
          ];
        case 'pro':
          return [
            "1 Adet Premium Akıllı Peluş",
            "Sınırsız Kripto Para Takibi",
            "Gelişmiş RGB LED Teknolojisi",
            "Sesli Uyarı Sistemi",
            "AI Destekli Analiz",
            "Push Bildirimleri",
            "Özel Müzik Efektleri",
            "1 Yıl Garanti + Ücretsiz Servis"
          ];
        case 'enterprise':
          return [
            "3 Adet Farklı Akıllı Peluş",
            "Profesyonel Dashboard",
            "Gelişmiş API Erişimi",
            "Portfolio Yönetimi",
            "7/24 Teknik Destek",
            "Özel Eğitim Programı",
            "VIP Müşteri Hizmeti",
            "2 Yıl Premium Garanti"
          ];
      }
    } else if (locale === 'de') {
      switch (packageType) {
        case 'starter':
          return [
            "1 Intelligentes Plüschtier",
            "5 Kryptowährungs-Tracking",
            "Grundlegende LED-Augen-Technologie",
            "Mobile App Unterstützung",
            "E-Mail Benachrichtigungen",
            "6 Monate Garantie"
          ];
        case 'pro':
          return [
            "1 Premium Intelligentes Plüschtier",
            "Unbegrenztes Krypto-Tracking",
            "Erweiterte RGB LED Technologie",
            "Sprachalarmsystem",
            "KI-gestützte Analyse",
            "Push-Benachrichtigungen",
            "Benutzerdefinierte Musikeffekte",
            "1 Jahr Garantie + Kostenloser Service"
          ];
        case 'enterprise':
          return [
            "3 Verschiedene Intelligente Plüschtiere",
            "Professionelles Dashboard",
            "Erweiterte API-Zugang",
            "Portfolio-Management",
            "24/7 Technischer Support",
            "Spezielles Trainingsprogramm",
            "VIP Kundenservice",
            "2 Jahre Premium Garantie"
          ];
      }
    } else if (locale === 'fr') {
      switch (packageType) {
        case 'starter':
          return [
            "1 Peluche intelligente",
            "Suivi de 5 cryptomonnaies",
            "Technologie LED de base pour les yeux",
            "Support d'application mobile",
            "Notifications par e-mail",
            "Garantie de 6 mois"
          ];
        case 'pro':
          return [
            "1 Peluche intelligente premium",
            "Suivi crypto illimité",
            "Technologie LED RVB avancée",
            "Système d'alerte vocale",
            "Analyse assistée par IA",
            "Notifications push",
            "Effets musicaux personnalisés",
            "Garantie d'1 an + service gratuit"
          ];
        case 'enterprise':
          return [
            "3 Peluches intelligentes différentes",
            "Tableau de bord professionnel",
            "Accès API avancé",
            "Gestion de portefeuille",
            "Support technique 24/7",
            "Programme de formation spécial",
            "Service client VIP",
            "Garantie premium de 2 ans"
          ];
      }
    } else {
      // Default English features
      switch (packageType) {
        case 'starter':
          return [
            "1 Smart Plush Toy",
            "5 Cryptocurrency Tracking",
            "Basic LED Eye Technology",
            "Mobile App Support",
            "Email Notifications",
            "6 Month Warranty"
          ];
        case 'pro':
          return [
            "1 Premium Smart Plush",
            "Unlimited Crypto Tracking",
            "Advanced RGB LED Technology",
            "Voice Alert System",
            "AI-Powered Analysis",
            "Push Notifications",
            "Custom Music Effects",
            "1 Year Warranty + Free Service"
          ];
        case 'enterprise':
          return [
            "3 Different Smart Plushies",
            "Professional Dashboard",
            "Advanced API Access",
            "Portfolio Management",
            "24/7 Technical Support",
            "Special Training Program",
            "VIP Customer Service",
            "2 Year Premium Warranty"
          ];
      }
    }
  };

  const plushOptions = [
    {
      name: t('homepage.packages.starter.name'),
      features: getPackageFeatures('starter'),
      plushType: t('homepage.packages.starter.type'),
      color: t('homepage.packages.starter.color')
    },
    {
      name: t('homepage.packages.pro.name'),
      popular: true,
      features: getPackageFeatures('pro'),
      plushType: t('homepage.packages.pro.type'),
      color: t('homepage.packages.pro.color')
    },
    {
      name: t('homepage.packages.enterprise.name'),
      features: getPackageFeatures('enterprise'),
      plushType: t('homepage.packages.enterprise.type'),
      color: t('homepage.packages.enterprise.color')
    }
  ];

  // Auto-redirect to dashboard removed - users can stay on homepage even when authenticated

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleActivationSubmit = (e) => {
    e.preventDefault();
    if (activationCode.trim()) {
      router.push(`/auth/login?activation=${activationCode}`);
    }
  };

  const handleWishlistSubmit = (e) => {
    e.preventDefault();
    if (wishlistData.name.trim() && wishlistData.email.trim()) {
      console.log('Wishlist data:', wishlistData);
      alert(t('homepage.wishlistSection.form.disclaimer'));
      setWishlistData({ name: '', email: '', selectedPlan: t('homepage.packages.pro.name') });
    }
  };

  if (loading || translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce">🧸</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            PeluPrice
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Global Navbar */}
      <Navbar />
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 sm:py-3 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 px-4">
          <span className="font-bold text-sm sm:text-base">{t('homepage.bannerPrefix')} </span>
          <span className="text-sm sm:text-base">{t('homepage.topBanner')}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 sm:py-16 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-cyan-300 dark:bg-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-6 shadow-lg text-sm sm:text-base">
                  <span className="font-bold">{t('homepage.badges.number1')}</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                {t('homepage.heroTitle')}
                <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {t('homepage.heroSubtitle')}
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                {t('homepage.heroDescription')}
                <span className="font-bold text-green-600"> {t('homepage.cta.wishlist').split(' - ')[1]}</span>
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => document.getElementById('wishlist').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl text-base sm:text-lg flex items-center justify-center"
                >
                  <span className="mr-2">📝</span>
                  {t('homepage.cta.wishlist')}
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-sm text-base sm:text-lg flex items-center justify-center"
                >
                  <span className="mr-2">📱</span>
                  {t('homepage.cta.demo')}
                </button>
              </div>

              {/* Activation Code Input */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {t('homepage.activation.title')}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4">
                  {t('homepage.activation.description')}
                </p>
                <form onSubmit={handleActivationSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder={t('homepage.activation.placeholder')}
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm sm:text-base"
                  >
                    {t('homepage.activation.button')}
                  </button>
                </form>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-slate-700/20 shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                  <div className="relative z-10 w-full h-full">
                    <img 
                      src="/hero.jpeg" 
                      alt="PeluPrice Smart Teddy Bear"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </div>
                
                {/* Product badges */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg text-xs sm:text-sm">
                    {t('homepage.badges.new')}
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    {t('homepage.badges.popular')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {t('homepage.features.title').split(' ')[0]} <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{t('homepage.features.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              {t('homepage.features.subtitle')}
            </p>
            <div className="flex justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
              <span>{t('homepage.features.certifications.ce')}</span>
              <span>{t('homepage.features.certifications.rd')}</span>
              <span>{t('homepage.features.certifications.made')}</span>
              <span>{t('homepage.features.certifications.shipping')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                  currentFeature === index 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-2xl' 
                    : 'bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className={`text-xl font-bold mb-3 text-center ${
                  currentFeature === index ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-center leading-relaxed mb-4 ${
                  currentFeature === index ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {feature.description}
                </p>
                <div className={`text-center text-sm font-semibold ${
                  currentFeature === index ? 'text-white/80' : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {feature.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wishlist Section */}
      <section id="wishlist" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {t('homepage.wishlistSection.title').split(' ')[0]} <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{t('homepage.wishlistSection.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              {t('homepage.wishlistSection.subtitle')}
            </p>
            <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-6 py-3 rounded-full">
              <span className="mr-2">💎</span>
              <span className="font-bold">{t('homepage.wishlistSection.banner')}</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl">
              <form onSubmit={handleWishlistSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('homepage.wishlistSection.form.name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={wishlistData.name}
                      onChange={(e) => setWishlistData({...wishlistData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('homepage.wishlistSection.form.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('homepage.wishlistSection.form.email')}
                    </label>
                    <input
                      type="email"
                      required
                      value={wishlistData.email}
                      onChange={(e) => setWishlistData({...wishlistData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('homepage.wishlistSection.form.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('homepage.wishlistSection.form.package')}
                  </label>
                  <select
                    value={wishlistData.selectedPlan}
                    onChange={(e) => setWishlistData({...wishlistData, selectedPlan: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {plushOptions.map((option, index) => (
                      <option key={index} value={option.name}>
                        {option.name} - {option.plushType} ({option.color})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl"
                  >
                    {t('homepage.wishlistSection.form.submit')}
                  </button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    {t('homepage.wishlistSection.form.disclaimer')}
                  </p>
                </div>
              </form>
            </div>

            {/* Plush Options Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
              {plushOptions.map((option, index) => (
                <div 
                  key={index}
                  className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                    option.popular 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl transform scale-105' 
                      : 'bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm">
                        {t('homepage.packages.pro.popular')}
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold mb-2 ${
                      option.popular ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {option.name}
                    </h3>
                    <div className={`text-sm mb-4 ${
                      option.popular ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      <div>🧸 {option.plushType}</div>
                      <div>🎨 {option.color}</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={`flex items-start text-sm ${
                        option.popular ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        <span className="mr-2 text-green-500">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`text-center text-sm ${
                    option.popular ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {t('homepage.packages.payment')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-4xl">🧸</div>
                <div>
                  <span className="text-3xl font-bold">PeluPrice</span>
                  <div className="text-slate-400 text-sm">{t('homepage.companyTagline')}</div>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
                {t('homepage.footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">{t('homepage.footer.quickLinks')}</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-300 hover:text-white transition-colors">{t('homepage.navigation.features')}</a></li>
                <li><a href="#wishlist" className="text-slate-300 hover:text-white transition-colors">{t('homepage.navigation.wishlist')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">{t('homepage.footer.contact')}</h3>
              <ul className="space-y-3">
                <li className="text-slate-300">{t('homepage.footer.email')}</li>
                <li className="text-slate-300">{t('homepage.footer.location')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 mb-4 md:mb-0">
                {t('homepage.footer.copyright')}
              </div>
              <div className="flex items-center space-x-6 text-slate-400 text-sm">
                <span>{t('homepage.footer.badges.made')}</span>
                <span>{t('homepage.footer.badges.sei')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
