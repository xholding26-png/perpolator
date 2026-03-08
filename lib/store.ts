import { create } from 'zustand';
import { Market, Position, Order, Trade } from './types';

interface AppStore {
  // Wallet
  connected: boolean;
  publicKey: string | null;
  balance: number;
  setWallet: (connected: boolean, publicKey: string | null, balance: number) => void;

  // Markets (fetched from on-chain)
  markets: Market[];
  marketsLoading: boolean;
  setMarkets: (markets: Market[]) => void;
  setMarketsLoading: (loading: boolean) => void;
  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;

  // Trading (empty until real on-chain data)
  positions: Position[];
  orders: Order[];
  trades: Trade[];

  // Real prices from CoinGecko
  prices: Record<string, { usd: number; usd_24h_change?: number; usd_24h_vol?: number }>;
  setPrices: (prices: Record<string, { usd: number; usd_24h_change?: number; usd_24h_vol?: number }>) => void;

  // Platform stats (real)
  stats: { marketsLive: number; totalVolume: string; totalTraders: string };
  setStats: (stats: { marketsLive: number; totalVolume: string; totalTraders: string }) => void;

  // Launch wizard
  launchStep: number;
  setLaunchStep: (step: number) => void;
  launchConfig: LaunchConfig;
  updateLaunchConfig: (partial: Partial<LaunchConfig>) => void;
  resetLaunchConfig: () => void;
}

export interface LaunchConfig {
  tokenMint: string;
  tokenName: string;
  tokenSymbol: string;
  maxLeverage: number;
  initialMargin: number;
  maintenanceMargin: number;
  tradingFeeBps: number;
  liquidationFeeBps: number;
  initialLiquidity: number;
  lpSpread: number;
}

const DEFAULT_LAUNCH_CONFIG: LaunchConfig = {
  tokenMint: '',
  tokenName: '',
  tokenSymbol: '',
  maxLeverage: 20,
  initialMargin: 10,
  maintenanceMargin: 5,
  tradingFeeBps: 10,
  liquidationFeeBps: 50,
  initialLiquidity: 0,
  lpSpread: 0.5,
};

export const useAppStore = create<AppStore>((set) => ({
  // Wallet — starts disconnected, real balance fetched on connect
  connected: false,
  publicKey: null,
  balance: 0,
  setWallet: (connected, publicKey, balance) => set({ connected, publicKey, balance }),

  // Markets — empty until fetched from on-chain
  markets: [],
  marketsLoading: true,
  setMarkets: (markets) => set({ markets, marketsLoading: false }),
  setMarketsLoading: (loading) => set({ marketsLoading: loading }),
  selectedMarket: null,
  setSelectedMarket: (market) => set({ selectedMarket: market }),

  // Trading — empty, no fake data
  positions: [],
  orders: [],
  trades: [],

  // Prices — empty until fetched from CoinGecko
  prices: {},
  setPrices: (prices) => set({ prices }),

  // Stats — real, default to dashes
  stats: { marketsLive: 0, totalVolume: '—', totalTraders: '—' },
  setStats: (stats) => set({ stats }),

  // Launch wizard
  launchStep: 1,
  setLaunchStep: (step) => set({ launchStep: step }),
  launchConfig: DEFAULT_LAUNCH_CONFIG,
  updateLaunchConfig: (partial) =>
    set((state) => ({
      launchConfig: { ...state.launchConfig, ...partial },
    })),
  resetLaunchConfig: () =>
    set({ launchConfig: DEFAULT_LAUNCH_CONFIG, launchStep: 1 }),
}));
