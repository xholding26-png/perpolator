// All mock data has been removed. This file is kept for backward compatibility.
// Real data is fetched from on-chain program accounts, CoinGecko, and Supabase.

import { Market, Orderbook } from './types';

// No mock markets — real markets come from on-chain program
export const MOCK_MARKETS: Market[] = [];

// No mock positions, orders, trades — real data from on-chain + wallet
export const MOCK_POSITIONS: never[] = [];
export const MOCK_ORDERS: never[] = [];
export const MOCK_TRADES: never[] = [];
export const MOCK_LEADERBOARD: never[] = [];

// Empty orderbook generator (real orderbook comes from on-chain)
export function generateOrderbook(_market: Market): Orderbook {
  return { bids: [], asks: [] };
}

// No mock recent trades
export function generateRecentTrades(_market: Market): never[] {
  return [];
}

// Platform stats — now fetched dynamically
export const PLATFORM_STATS = {
  marketsLive: 0,
  totalVolume: 0,
  totalTraders: 0,
};
