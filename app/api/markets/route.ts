import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=dd62a158-95b7-40e8-bc19-a59cacb95f40';
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'GM8zjJ8LTBMv9xEsverh6H6wLyevgMHEJXcEzyY3rY24');

let cachedMarkets: unknown[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10000; // 10 seconds

export async function GET() {
  const now = Date.now();

  if (cachedMarkets && now - cacheTime < CACHE_TTL) {
    return NextResponse.json({ markets: cachedMarkets, count: cachedMarkets.length });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);

    // Parse program accounts to find market/slab accounts
    // The Percolator program stores market data in accounts owned by the program
    const markets = accounts
      .map((account) => {
        try {
          const data = account.account.data;
          // Minimum size check for a valid market account
          if (data.length < 100) return null;

          // Try to parse the slab/market account data
          // Percolator slab layout (approximate):
          // 0-8: discriminator
          // 8-40: authority (32 bytes pubkey)
          // 40-72: token_mint (32 bytes pubkey)
          // 72-74: max_leverage (u16)
          // 74-76: trading_fee_bps (u16)
          // 76-78: liquidation_fee_bps (u16)
          // 78-79: is_active (bool)
          const discriminator = data.slice(0, 8);
          const authority = new PublicKey(data.slice(8, 40)).toBase58();
          const tokenMint = new PublicKey(data.slice(40, 72)).toBase58();
          const maxLeverage = data.readUInt16LE(72);
          const tradingFeeBps = data.readUInt16LE(74);
          const liquidationFeeBps = data.readUInt16LE(76);
          const isActive = data[78] === 1;

          if (!isActive) return null;

          return {
            id: account.pubkey.toBase58(),
            pubkey: account.pubkey.toBase58(),
            authority,
            mint: tokenMint,
            symbol: `${tokenMint.slice(0, 4)}...-PERP`,
            name: tokenMint.slice(0, 8),
            maxLeverage,
            tradingFeeBps,
            liquidationFeeBps,
            price: 0,
            change24h: 0,
            volume24h: 0,
            openInterest: 0,
            traders: 0,
            fundingRate: 0,
            nextFunding: 0,
            createdAt: new Date().toISOString(),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    cachedMarkets = markets;
    cacheTime = now;

    return NextResponse.json({ markets, count: markets.length });
  } catch (error) {
    console.error('Markets fetch error:', error);
    return NextResponse.json({ markets: [], count: 0, error: 'Failed to fetch on-chain markets' });
  }
}
