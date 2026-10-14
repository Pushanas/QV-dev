export interface Candle {
  time: number; // Unix timestamp in seconds (Lightweight Charts uses seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PairInfo {
  id: string;
  name: string;
  displayName: string;
  payout: number;
  isOtc: boolean;
  category: 'forex' | 'crypto' | 'commodities';
  basePrice: number;
  pipDecimals: number;
  change24h: number;
}

export type SignalDirection = 'CALL' | 'PUT';

export interface Signal {
  id: string;
  pair: string;
  direction: SignalDirection;
  confidence: number;
  payout: number;
  entryPrice: number;
  time: number; // timestamp in ms
  expirySeconds: number;
  strategy: string;
  indicators: {
    rsi: number;
    emaTrend: 'bullish' | 'bearish' | 'neutral';
    macd: string;
    bollinger: string;
  };
  status: 'ACTIVE' | 'WIN' | 'LOSS';
  exitPrice?: number;
  profit?: number;
  telegramSent?: boolean;
}

export interface BotSettings {
  isActive: boolean;
  minConfidence: number;
  scanIntervalSeconds: number;
  autoTelegram: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  soundAlerts: boolean;
  enabledPairs: string[];
  martingaleEnabled: boolean;
  defaultBetAmount: number;
  expirySeconds: number;
}

export interface IndicatorSettings {
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  emaFastPeriod: number;
  emaSlowPeriod: number;
  bollingerPeriod: number;
  bollingerStdDev: number;
  showEmaOnChart: boolean;
}

export interface SimulatedTrade {
  id: string;
  pair: string;
  direction: SignalDirection;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: number;
  expiryTime: number;
  payout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  exitPrice?: number;
  profitAmount?: number;
}

export interface MarketState {
  currentPair: string;
  candles: Record<string, Candle[]>;
  payouts: Record<string, number>;
  latestSignals: Signal[];
  activeTrades: SimulatedTrade[];
  demoBalance: number;
  totalWins: number;
  totalLosses: number;
  status: string;
  lastTickTime: number;
}
