'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [activationCode, setActivationCode] = useState('');
  const [wishlistData, setWishlistData] = useState({
    name: '',
    email: '',
    selectedPlan: 'Pro Pelus'
  });

  const stats = [
    { number: "50,000+", label: "Ilgilenen Kullanici" },
    { number: "2.4M+", label: "Hedeflenen Deger" },
    { number: "99.9%", label: "Sistem Guvenilirligi" },
    { number: "24/7", label: "Planlanan Destek" }
  ];

  const features = [
    {
      title: "Akilli LED Goz Teknolojisi",
      description: "Patentli LED teknolojisi ile pelus oyuncaklarin gozleri gercek zamanli fiyat degisimlerini yansitir",
      icon: "👁️",
      details: "RGB LED + Wi-Fi modulu"
    },
    {
      title: "Coklu Kripto Destegi", 
      description: "Bitcoin, Ethereum, BNB, Cardano ve 500+ kripto para birimini takip edin",
      icon: "₿",
      details: "500+ Coin destegi"
    },
    {
      title: "Sesli Uyari Sistemi",
      description: "Ozel ses efektleri ve konusma ozelligi ile kritik anlarda sizi bilgilendirir",
      icon: "🔊",
      details: "AI destekli ses teknolojisi"
    },
    {
      title: "Mobil Uygulama",
      description: "Mobil destekli web platformunda pelusunuzu yonetin",
      icon: "📱",
      details: "Cross-platform uygulamalar"
    },
    {
      title: "Gelismis Analitik",
      description: "Portfoyunuzu her sabah kar zarar miktari degeri en cok artan en cok dusen coinleri soyleyen alarm",
      icon: "📊",
      details: "Machine Learning analizi"
    },
    {
      title: "Guvenli Baglanti",
      description: "Bankacilik seviyesi sifreleme ile guvenli veri iletisimi",
      icon: "🔐",
      details: "256-bit sifreleme"
    }
  ];

  const plushOptions = [
    {
      name: "Starter Pelus",
      features: [
        "1 Adet Akilli Pelus Oyuncak",
        "5 Kripto Para Takibi",
        "Temel LED Goz Teknolojisi",
        "Mobil Uygulama Destegi",
        "Email Bildirimleri",
        "6 Ay Garanti"
      ],
      plushType: "Ayi",
      color: "Kahverengi"
    },
    {
      name: "Pro Pelus",
      popular: true,
      features: [
        "1 Adet Premium Akilli Pelus",
        "Sinirsiz Kripto Para Takibi",
        "Gelismis RGB LED Teknolojisi",
        "Sesli Uyari Sistemi",
        "AI Destekli Analiz",
        "Push Bildirimleri",
        "Ozel Muzik Efektleri",
        "1 Yil Garanti + Ucretsiz Servis"
      ],
      plushType: "Unicorn",
      color: "Pembe & Mor"
    },
    {
      name: "Enterprise Set",
      features: [
        "3 Adet Farkli Akilli Pelus",
        "Profesyonel Dashboard",
        "Gelismis API Erisimi",
        "Portfolio Yonetimi",
        "7/24 Teknik Destek",
        "Ozel Egitim Programi",
        "VIP Musteri Hizmeti",
        "2 Yil Premium Garanti"
      ],
      plushType: "Set (Ayi + Unicorn + Dragon)",
      color: "Coklu Renk"
    }
  ];

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

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
      alert('Istek listenize eklendi! SEI Coin odeme hazir oldugunda size haber verecegiz.');
      setWishlistData({ name: '', email: '', selectedPlan: 'Pro Pelus' });
    }
  };

  if (loading) {
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
          <p className="text-slate-600 dark:text-slate-400">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <span className="font-bold">🚀 YAKINDA: </span>
          <span>SEI Coin ile odeme kabul edilecek! Istek listesine ekleyin!</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🧸</div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PeluPrice
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Kripto Teknoloji Lideri
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                Ozellikler
              </a>
              <a href="#wishlist" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                Istek Listesi
              </a>
              <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                Iletisim
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
              >
                Giris Yap
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Kayit Ol
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-300 dark:bg-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-6 shadow-lg">
                  <span className="font-bold">⭐ #1 Kripto Pelus Teknolojisi</span>
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
                Kripto Dunyasinin
                <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  En Akilli Peluslari
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Patentli LED teknolojisi ile donatilmis pelus oyuncaklar, kripto portfoyunuzu 
                24/7 takip eder ve gercek zamanli gorsel uyarilar verir. 
                <span className="font-bold text-green-600">Hicbir firsati kacirmayin!</span>
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('wishlist').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center"
                >
                  <span className="mr-2">📝</span>
                  Istek Listesine Ekle - Yakinda Satista!
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-sm text-lg flex items-center justify-center"
                >
                  <span className="mr-2">📱</span>
                  Ucretsiz Demo
                </button>
              </div>

              {/* Activation Code Input */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  🎯 Zaten Pelusunuz Var mi?
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Aktivasyon kodunuzu girin ve hemen yonetmeye baslayin!
                </p>
                <form onSubmit={handleActivationSubmit} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Aktivasyon kodunuzu giriniz (orn: PLU-2024-XXXX)"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Aktive Et
                  </button>
                </form>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-slate-700/20 shadow-2xl">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                  <div className="text-center relative z-10">
                    <div className="text-9xl mb-4">🧸</div>
                    <div className="flex justify-center space-x-4 mb-4">
                      <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                      <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">
                      Hero Product Image
                      <br />
                      <span className="text-sm font-normal">(800x800 px onerilen)</span>
                    </p>
                  </div>
                </div>
                
                {/* Product badges */}
                <div className="absolute -top-4 -right-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    ✨ Yeni
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    🔥 Populer
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
              Neden <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">PeluPrice Teknolojisi?</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Dunya standartlarinda teknoloji ve Istanbul'da uretilen kaliteli iscilik
            </p>
            <div className="flex justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
              <span>🏆 CE Sertifikali</span>
              <span>🔬 R&D Laboratuvari</span>
              <span>🇹🇷 Turkiye'de Uretim</span>
              <span>🌍 Dunya Capinda Kargo</span>
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
              Istek <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Listesine Ekle</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              SEI Coin odeme sistemi hazir oldugunda size haber verelim!
            </p>
            <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-6 py-3 rounded-full">
              <span className="mr-2">💎</span>
              <span className="font-bold">SEI Coin ile odeme yakinda!</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl">
              <form onSubmit={handleWishlistSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Adiniz Soyadiniz
                    </label>
                    <input
                      type="text"
                      required
                      value={wishlistData.name}
                      onChange={(e) => setWishlistData({...wishlistData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Adinizi ve soyadinizi giriniz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      required
                      value={wishlistData.email}
                      onChange={(e) => setWishlistData({...wishlistData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ilgilendiginiz Paket
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
                    📝 Istek Listesine Ekle
                  </button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                    SEI Coin odeme hazir oldugunda size e-posta ile bildirim gondereceğiz.
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
                        🔥POPULER
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
                    💎 SEI Coin ile odeme yakinda
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
                  <div className="text-slate-400 text-sm">Kripto Teknoloji Lideri</div>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
                Kripto dunyasinin en akilli pelus oyuncaklari ile gelecegi yasayin. 
                SEI Coin odeme sistemi yakinda!
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Hizli Linkler</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-300 hover:text-white transition-colors">Ozellikler</a></li>
                <li><a href="#wishlist" className="text-slate-300 hover:text-white transition-colors">Istek Listesi</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">Iletisim</h3>
              <ul className="space-y-3">
                <li className="text-slate-300">📧 info@peluprice.com</li>
                <li className="text-slate-300">📍 Istanbul, Turkiye</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 mb-4 md:mb-0">
                © 2025 PeluPrice Technology Inc. Tum haklari saklidir.
              </div>
              <div className="flex items-center space-x-6 text-slate-400 text-sm">
                <span>🇹🇷 Turkiye'de Uretim</span>
                <span>💎 SEI Coin Destekli</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
