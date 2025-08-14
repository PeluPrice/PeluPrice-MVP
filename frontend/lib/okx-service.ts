export interface OKXInstrument {
  instId: string;
  baseCcy: string;
  quoteCcy: string;
  instType: string;
  state: string;
  listTime: string;
  tickSz: string;
  lotSz: string;
  minSz: string;
  category: string;
}

export interface OKXTickerData {
  instType: string;
  instId: string;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  ts: string;
}

export interface OKXWebSocketMessage {
  arg: {
    channel: string;
    instId: string;
  };
  data: OKXTickerData[];
}

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: number;
}

class OKXService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribedCoins: Set<string> = new Set();
  private listeners: Map<string, Set<(data: CoinData) => void>> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private connectionResolver: (() => void) | null = null;
  private isConnecting = false;

  private readonly WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';
  private readonly API_URL = 'https://www.okx.com/api/v5/public/instruments?instType=SPOT';

  // OKX'den desteklenen coinleri çek
  async getSupportedCoins(): Promise<string[]> {
    try {
      const response = await fetch(this.API_URL);
      const data = await response.json();
      
      if (data.code === '0' && data.data) {
        // Sadece USDT çiftlerini al ve aktif olanları filtrele
        const usdtPairs = data.data
          .filter((instrument: OKXInstrument) => 
            instrument.quoteCcy === 'USDT' && 
            instrument.state === 'live' &&
            instrument.instType === 'SPOT'
          )
          .map((instrument: OKXInstrument) => instrument.baseCcy)
          .sort();

        return [...new Set(usdtPairs)] as string[]; // Duplikatları kaldır
      }
      
      return [];
    } catch (error) {
      console.error('OKX API hatası:', error);
      return [];
    }
  }

  // WebSocket bağlantısını başlat
  private async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionResolver = resolve;

      try {
        this.ws = new WebSocket(this.WS_URL);

        this.ws.onopen = () => {
          console.log('🟢 OKX WebSocket bağlantısı kuruldu');
          this.isConnecting = false;
          if (this.connectionResolver) {
            this.connectionResolver();
            this.connectionResolver = null;
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message: OKXWebSocketMessage = JSON.parse(event.data);
            if (message.data && message.data.length > 0) {
              this.handleTickerData(message.data[0]);
            }
          } catch (error) {
            console.error('❌ WebSocket mesaj parse hatası:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔴 OKX WebSocket bağlantısı kapandı');
          this.isConnecting = false;
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ OKX WebSocket hatası:', error);
          this.isConnecting = false;
          reject(error);
        };

        // Timeout için
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket bağlantı timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Yeniden bağlanma planla
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      if (this.subscribedCoins.size > 0) {
        console.log('OKX WebSocket yeniden bağlanıyor...');
        this.connect().then(() => {
          this.resubscribeAll();
        }).catch(console.error);
      }
    }, 5000);
  }

  // Tüm abonelikleri yeniden yap
  private resubscribeAll(): void {
    const coins = Array.from(this.subscribedCoins);
    this.subscribedCoins.clear();
    
    coins.forEach(coin => {
      this.subscribe(coin);
    });
  }

  // Ticker verisini işle
  private handleTickerData(data: OKXTickerData): void {
    const symbol = data.instId.replace('-USDT', '');
    const price = parseFloat(data.last);
    const open24h = parseFloat(data.open24h);
    const change24h = ((price - open24h) / open24h) * 100;

    const coinData: CoinData = {
      symbol,
      name: symbol,
      price,
      change24h,
      volume24h: parseFloat(data.volCcy24h),
      lastUpdate: parseInt(data.ts)
    };

    console.log(`📈 ${symbol} fiyat güncellendi: $${price.toFixed(6)} (${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%)`);

    // Listenerlara bildir
    const listeners = this.listeners.get(symbol);
    if (listeners) {
      listeners.forEach(listener => listener(coinData));
    }
  }

  // Coin fiyatına abone ol
  async subscribe(coin: string): Promise<void> {
    try {
      await this.connect();

      if (this.subscribedCoins.has(coin)) {
        console.log(`⚡ ${coin} zaten abone`);
        return;
      }

      const instId = `${coin}-USDT`;
      const subscribeMessage = {
        op: 'subscribe',
        args: [{
          channel: 'tickers',
          instId: instId
        }]
      };

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(subscribeMessage));
        this.subscribedCoins.add(coin);
        console.log(`🔔 ${coin} fiyatına abone olundu (${instId})`);
      } else {
        console.error(`❌ WebSocket bağlantısı kapalı, ${coin} abonelik başarısız`);
      }
    } catch (error) {
      console.error(`❌ ${coin} abonelik hatası:`, error);
    }
  }

  // Coin fiyat aboneliğini iptal et
  async unsubscribe(coin: string): Promise<void> {
    if (!this.subscribedCoins.has(coin)) {
      return;
    }

    const instId = `${coin}-USDT`;
    const unsubscribeMessage = {
      op: 'unsubscribe',
      args: [{
        channel: 'tickers',
        instId: instId
      }]
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(unsubscribeMessage));
    }

    this.subscribedCoins.delete(coin);
    console.log(`${coin} abonelik iptal edildi`);
  }

  // Fiyat güncellemelerini dinle
  addPriceListener(coin: string, callback: (data: CoinData) => void): void {
    if (!this.listeners.has(coin)) {
      this.listeners.set(coin, new Set());
    }
    this.listeners.get(coin)!.add(callback);

    // Otomatik abone ol
    this.subscribe(coin);
  }

  // Fiyat dinleyicisini kaldır
  removePriceListener(coin: string, callback: (data: CoinData) => void): void {
    const listeners = this.listeners.get(coin);
    if (listeners) {
      listeners.delete(callback);
      
      // Eğer bu coin için dinleyici kalmadıysa abonelikten çık
      if (listeners.size === 0) {
        this.listeners.delete(coin);
        this.unsubscribe(coin);
      }
    }
  }

  // Tek seferlik fiyat al
  async getCurrentPrice(coin: string): Promise<number | null> {
    try {
      const response = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${coin}-USDT`);
      const data = await response.json();
      
      if (data.code === '0' && data.data && data.data.length > 0) {
        return parseFloat(data.data[0].last);
      }
      
      return null;
    } catch (error) {
      console.error(`${coin} fiyat alma hatası:`, error);
      return null;
    }
  }

  // Bağlantıyı kapat
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribedCoins.clear();
    this.listeners.clear();
    this.connectionPromise = null;
    this.connectionResolver = null;
    this.isConnecting = false;
  }
}

// Singleton instance
export const okxService = new OKXService();
