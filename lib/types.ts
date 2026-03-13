export interface Market {
  id: string;
  symbol: string;
  name: string;
  mint: string;
  price: number;
  change24h: number;
  volume24h: number;
  openInterest: number;
  maxLeverage: number;
  traders: number;
  fundingRate: number;
  nextFunding: number; // seconds until next funding
  iconUrl?: string;
  image?: string;
  creator?: string;
  createdAt: string;
}

export interface Position {
  id: string;
  marketId: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  liquidationPrice: number;
}

export interface Order {
  id: string;
  marketId: string;
  symbol: string;
  side: 'long' | 'short';
  type: 'market' | 'limit';
  size: number;
  price: number;
  leverage: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
}

export interface Trade {
  id: string;
  marketId: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  price: number;
  fee: number;
  pnl?: number;
  timestamp: string;
}

export interface OrderbookEntry {
  price: number;
  size: number;
  total: number;
}

export interface Orderbook {
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
}

export type SortField = 'volume24h' | 'openInterest' | 'createdAt' | 'change24h';
export type SortDirection = 'asc' | 'desc';
