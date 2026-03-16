import { NextResponse } from 'next/server';
import { fetchMarkets } from '@/lib/solana';
import { Market } from '@/lib/types';

let cachedMarkets: Market[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 15_000;

// Well-known mints → human labels + logos
const KNOWN_MINTS: Record<string, { symbol: string; name: string; image: string }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
};

// System program = renounced admin
const SYSTEM_PROGRAM = '11111111111111111111111111111111';

// Our deployer — only show markets we control
const OUR_ADMIN = '8hPWoU57EobZ1FSvanci9T3bpCSv3jqW4xqboWbt4tth';

export async function GET() {
  const now = Date.now();
  if (cachedMarkets && now - cacheTime < CACHE_TTL) {
    return NextResponse.json({ markets: cachedMarkets, count: cachedMarkets.length });
  }

  try {
    const slabs = await fetchMarkets();

    // Filter: only our admin, not paused, not resolved
    const activeSlabs = slabs.filter(
      (s) =>
        !s.isPaused &&
        !s.isResolved &&
        s.admin !== SYSTEM_PROGRAM &&
        s.admin === OUR_ADMIN
    );

    // Build market objects
    const markets: Market[] = activeSlabs.map((slab) => {
      const known = KNOWN_MINTS[slab.collateralMint];
      const symbol = known
        ? `${known.symbol}-PERP`
        : `${slab.collateralMint.slice(0, 4)}...${slab.collateralMint.slice(-4)}-PERP`;
      const name = known
        ? `${known.name} Perpetual`
        : `${slab.collateralMint.slice(0, 6)} Perpetual`;

      return {
        id: slab.pubkey,
        symbol,
        name,
        mint: slab.collateralMint,
        price: slab.oraclePrice,
        image: known?.image || '',
        change24h: 0,       // Real platform data only — no faking
        volume24h: 0,       // Real platform data only
        openInterest: 0,
        maxLeverage: 20,
        traders: 0,
        fundingRate: 0,
        nextFunding: 3600,
        creator: slab.admin,
        createdAt: new Date().toISOString(),
      } satisfies Market;
    });

    // Get real SOL/USD price for display (just the price, not volume)
    const solMarket = markets.find((m) => m.mint === 'So11111111111111111111111111111111111111112');
    if (solMarket) {
      try {
        const cgResp = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
          { signal: AbortSignal.timeout(3000) }
        );
        const cgData = await cgResp.json();
        if (cgData.solana?.usd > 0) {
          solMarket.price = cgData.solana.usd;
          solMarket.change24h = cgData.solana.usd_24h_change || 0;
        }
      } catch {}
    }

    cachedMarkets = markets;
    cacheTime = now;

    return NextResponse.json({ markets, count: markets.length });
  } catch (error) {
    console.error('Markets fetch error:', error);
    return NextResponse.json({ markets: [], count: 0, error: String(error) });
  }
}
