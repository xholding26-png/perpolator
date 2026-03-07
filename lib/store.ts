import { create } from 'zustand';
import { Market, Position, Order, Trade } from './types';
import { MOCK_MARKETS, MOCK_POSITIONS, MOCK_ORDERS, MOCK_TRADES } from './mock-data';

interface AppStore {
  // Wallet
  connected: boolean;
  publicKey: string | null;
  balance: number;

  // Markets
  markets: Market[];
  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;

  // Trading
  positions: Position[];
  orders: Order[];
  trades: Trade[];

  // Prices
  prices: Record<string, number>;

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
  connected: false,
  publicKey: null,
  balance: 24.567,

  markets: MOCK_MARKETS,
  selectedMarket: null,
  setSelectedMarket: (market) => set({ selectedMarket: market }),

  positions: MOCK_POSITIONS,
  orders: MOCK_ORDERS,
  trades: MOCK_TRADES,

  prices: Object.fromEntries(MOCK_MARKETS.map((m) => [m.id, m.price])),

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
