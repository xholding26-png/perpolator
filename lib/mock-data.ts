import { Market, Position, Order, Trade, Orderbook, LeaderboardEntry } from './types';

export const MOCK_MARKETS: Market[] = [
  {
    id: 'sol-perp',
    symbol: 'SOL-PERP',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    price: 147.82,
    change24h: 3.42,
    volume24h: 28_450_000,
    openInterest: 12_340_000,
    maxLeverage: 50,
    traders: 1847,
    fundingRate: 0.0034,
    nextFunding: 2847,
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'bonk-perp',
    symbol: 'BONK-PERP',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    price: 0.00002341,
    change24h: -5.12,
    volume24h: 4_230_000,
    openInterest: 1_890_000,
    maxLeverage: 20,
    traders: 923,
    fundingRate: -0.0012,
    nextFunding: 2847,
    createdAt: '2025-12-15T00:00:00Z',
  },
  {
    id: 'jto-perp',
    symbol: 'JTO-PERP',
    name: 'Jito',
    mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    price: 3.847,
    change24h: 1.23,
    volume24h: 8_920_000,
    openInterest: 3_450_000,
    maxLeverage: 30,
    traders: 634,
    fundingRate: 0.0018,
    nextFunding: 2847,
    createdAt: '2025-12-20T00:00:00Z',
  },
  {
    id: 'wif-perp',
    symbol: 'WIF-PERP',
    name: 'dogwifhat',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    price: 1.892,
    change24h: -2.34,
    volume24h: 6_780_000,
    openInterest: 2_670_000,
    maxLeverage: 20,
    traders: 1203,
    fundingRate: -0.0008,
    nextFunding: 2847,
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'jup-perp',
    symbol: 'JUP-PERP',
    name: 'Jupiter',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    price: 1.234,
    change24h: 7.89,
    volume24h: 11_230_000,
    openInterest: 4_560_000,
    maxLeverage: 30,
    traders: 1456,
    fundingRate: 0.0045,
    nextFunding: 2847,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'pyth-perp',
    symbol: 'PYTH-PERP',
    name: 'Pyth Network',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    price: 0.4523,
    change24h: -1.45,
    volume24h: 3_450_000,
    openInterest: 1_230_000,
    maxLeverage: 20,
    traders: 412,
    fundingRate: 0.0002,
    nextFunding: 2847,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'render-perp',
    symbol: 'RENDER-PERP',
    name: 'Render',
    mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
    price: 7.234,
    change24h: 4.56,
    volume24h: 5_670_000,
    openInterest: 2_340_000,
    maxLeverage: 20,
    traders: 567,
    fundingRate: 0.0023,
    nextFunding: 2847,
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'w-perp',
    symbol: 'W-PERP',
    name: 'Wormhole',
    mint: '85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ',
    price: 0.5678,
    change24h: -3.21,
    volume24h: 2_340_000,
    openInterest: 890_000,
    maxLeverage: 15,
    traders: 298,
    fundingRate: -0.0015,
    nextFunding: 2847,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'tnsr-perp',
    symbol: 'TNSR-PERP',
    name: 'Tensor',
    mint: 'TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6',
    price: 0.8923,
    change24h: 12.34,
    volume24h: 1_890_000,
    openInterest: 670_000,
    maxLeverage: 15,
    traders: 234,
    fundingRate: 0.0067,
    nextFunding: 2847,
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'ray-perp',
    symbol: 'RAY-PERP',
    name: 'Raydium',
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    price: 5.432,
    change24h: -0.87,
    volume24h: 4_560_000,
    openInterest: 1_780_000,
    maxLeverage: 25,
    traders: 567,
    fundingRate: 0.0001,
    nextFunding: 2847,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'orca-perp',
    symbol: 'ORCA-PERP',
    name: 'Orca',
    mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    price: 4.123,
    change24h: 2.15,
    volume24h: 2_120_000,
    openInterest: 890_000,
    maxLeverage: 20,
    traders: 345,
    fundingRate: 0.0009,
    nextFunding: 2847,
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'mew-perp',
    symbol: 'MEW-PERP',
    name: 'cat in a dogs world',
    mint: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
    price: 0.00892,
    change24h: -8.43,
    volume24h: 1_560_000,
    openInterest: 450_000,
    maxLeverage: 10,
    traders: 189,
    fundingRate: -0.0034,
    nextFunding: 2847,
    createdAt: '2026-03-01T00:00:00Z',
  },
];

export const MOCK_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    marketId: 'sol-perp',
    symbol: 'SOL-PERP',
    side: 'long',
    size: 12.5,
    entryPrice: 142.30,
    markPrice: 147.82,
    leverage: 10,
    margin: 178.75,
    unrealizedPnl: 69.00,
    unrealizedPnlPercent: 38.6,
    liquidationPrice: 128.07,
  },
  {
    id: 'pos-2',
    marketId: 'bonk-perp',
    symbol: 'BONK-PERP',
    side: 'short',
    size: 50000000,
    entryPrice: 0.00002450,
    markPrice: 0.00002341,
    leverage: 5,
    margin: 245.00,
    unrealizedPnl: 54.50,
    unrealizedPnlPercent: 22.24,
    liquidationPrice: 0.00002940,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    marketId: 'jup-perp',
    symbol: 'JUP-PERP',
    side: 'long',
    type: 'limit',
    size: 500,
    price: 1.180,
    leverage: 10,
    status: 'open',
    createdAt: '2026-03-07T14:30:00Z',
  },
];

export const MOCK_TRADES: Trade[] = [
  {
    id: 'trade-1',
    marketId: 'sol-perp',
    symbol: 'SOL-PERP',
    side: 'long',
    size: 5,
    price: 145.20,
    fee: 0.73,
    pnl: 23.40,
    timestamp: '2026-03-07T12:00:00Z',
  },
  {
    id: 'trade-2',
    marketId: 'wif-perp',
    symbol: 'WIF-PERP',
    side: 'short',
    size: 200,
    price: 1.95,
    fee: 0.39,
    pnl: -12.80,
    timestamp: '2026-03-07T10:30:00Z',
  },
  {
    id: 'trade-3',
    marketId: 'jto-perp',
    symbol: 'JTO-PERP',
    side: 'long',
    size: 100,
    price: 3.72,
    fee: 0.37,
    pnl: 45.00,
    timestamp: '2026-03-06T22:15:00Z',
  },
];

export function generateOrderbook(market: Market): Orderbook {
  const spread = market.price * 0.001;
  const bids: { price: number; size: number; total: number }[] = [];
  const asks: { price: number; size: number; total: number }[] = [];

  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 15; i++) {
    const bidPrice = market.price - spread * (i + 1);
    const askPrice = market.price + spread * (i + 1);
    const bidSize = Math.random() * 100 + 10;
    const askSize = Math.random() * 100 + 10;
    bidTotal += bidSize;
    askTotal += askSize;

    bids.push({ price: bidPrice, size: bidSize, total: bidTotal });
    asks.push({ price: askPrice, size: askSize, total: askTotal });
  }

  return { bids, asks: asks.reverse() };
}

export function generateRecentTrades(market: Market): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  for (let i = 0; i < 20; i++) {
    const side = Math.random() > 0.5 ? 'long' : 'short';
    const priceOffset = (Math.random() - 0.5) * market.price * 0.002;
    trades.push({
      id: `rt-${i}`,
      marketId: market.id,
      symbol: market.symbol,
      side: side as 'long' | 'short',
      size: Math.random() * 50 + 1,
      price: market.price + priceOffset,
      fee: 0,
      timestamp: new Date(now - i * 15000).toISOString(),
    });
  }

  return trades;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: '7xKX...a3Fp', pnl: 234_567, trades: 1247, winRate: 67.3, volume: 12_450_000 },
  { rank: 2, address: '3mPq...kL9w', pnl: 189_234, trades: 892, winRate: 63.1, volume: 8_920_000 },
  { rank: 3, address: '9dRt...vN2x', pnl: 156_789, trades: 2341, winRate: 58.7, volume: 15_670_000 },
  { rank: 4, address: 'Bk4Z...mQ8s', pnl: 123_456, trades: 567, winRate: 72.1, volume: 5_340_000 },
  { rank: 5, address: 'Fg7Y...pR3t', pnl: 98_765, trades: 1893, winRate: 55.4, volume: 9_870_000 },
  { rank: 6, address: 'Hn2W...jK5v', pnl: 87_654, trades: 445, winRate: 69.8, volume: 3_450_000 },
  { rank: 7, address: 'Lp8X...cM4u', pnl: 76_543, trades: 1234, winRate: 61.2, volume: 7_890_000 },
  { rank: 8, address: 'Qr5T...dN7w', pnl: 65_432, trades: 678, winRate: 64.5, volume: 4_560_000 },
  { rank: 9, address: 'Uv3S...eP9x', pnl: 54_321, trades: 2345, winRate: 52.3, volume: 11_230_000 },
  { rank: 10, address: 'Yz1R...fQ2y', pnl: 43_210, trades: 890, winRate: 57.8, volume: 6_780_000 },
  { rank: 11, address: 'Cd9P...gR4z', pnl: -12_345, trades: 456, winRate: 43.2, volume: 2_340_000 },
  { rank: 12, address: 'Ef7N...hS6a', pnl: -23_456, trades: 1567, winRate: 41.8, volume: 8_450_000 },
  { rank: 13, address: 'Gh5M...iT8b', pnl: -34_567, trades: 234, winRate: 38.5, volume: 1_230_000 },
  { rank: 14, address: 'Ij3L...jU1c', pnl: -45_678, trades: 890, winRate: 35.2, volume: 4_670_000 },
  { rank: 15, address: 'Kl1K...kV3d', pnl: -56_789, trades: 1234, winRate: 33.7, volume: 6_890_000 },
];

export const PLATFORM_STATS = {
  marketsLive: MOCK_MARKETS.length,
  totalVolume: MOCK_MARKETS.reduce((acc, m) => acc + m.volume24h, 0),
  totalTraders: MOCK_MARKETS.reduce((acc, m) => acc + m.traders, 0),
};
