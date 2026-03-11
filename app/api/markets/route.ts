import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, RPC_URL, MAGIC, HEADER_LEN, OFF_MAGIC, OFF_FLAGS, OFF_ADMIN, OFF_COLLATERAL_MINT, OFF_ORACLE_PRICE, FLAG_PAUSED } from '@/lib/solana';
import { Market } from '@/lib/types';

let cachedMarkets: Market[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10_000;

export async function GET() {
  const now = Date.now();
  if (cachedMarkets && now - cacheTime < CACHE_TTL) {
    return NextResponse.json({ markets: cachedMarkets, count: cachedMarkets.length });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    // Known slabs (supplement getProgramAccounts which is unreliable on devnet public RPC)
    const KNOWN_SLABS = [
      'AEdBaMQKGcSw51iZHc8WHD3bdWGUstNPGXh9UBiWsNLK', // full market (LP + trader + crank + trades)
    ];

    // Try getProgramAccounts, fallback to known slabs
    let accounts: { pubkey: PublicKey; account: { data: Buffer | Uint8Array } }[] = [];
    try {
      const rpcAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
        dataSlice: { offset: 0, length: 512 },
      });
      accounts = rpcAccounts as any;
    } catch {}

    // Add known slabs if not already found
    const foundKeys = new Set(accounts.map(a => a.pubkey.toBase58()));
    for (const key of KNOWN_SLABS) {
      if (foundKeys.has(key)) continue;
      try {
        const info = await connection.getAccountInfo(new PublicKey(key), { dataSlice: { offset: 0, length: 512 } } as any);
        if (info) {
          accounts.push({ pubkey: new PublicKey(key), account: { data: info.data } });
        }
      } catch {}
    }

    console.log(`Found ${accounts.length} program accounts`);
    const markets = accounts
      .map(({ pubkey, account }) => {
        try {
          const data = Buffer.from(account.data as Uint8Array);
          console.log(`Account ${pubkey.toBase58()}: ${data.length} bytes`);
          if (data.length < HEADER_LEN + 100) return null;

          // Verify magic
          const magic = data.readBigUInt64LE(OFF_MAGIC);
          console.log(`  Magic: ${magic.toString(16)} (expected: ${MAGIC.toString(16)})`);
          if (magic !== MAGIC) return null;

          const flags = data[13]; // OFF_FLAGS
          if (flags & FLAG_PAUSED) return null; // skip paused markets

          const admin = new PublicKey(data.subarray(16, 48)).toBase58();
          const mint = new PublicKey(data.subarray(HEADER_LEN, HEADER_LEN + 32)).toBase58();
          const oraclePriceE6 = Number(data.readBigUInt64LE(OFF_ORACLE_PRICE));
          const price = oraclePriceE6 / 1_000_000;

          // Read engine stats at ENGINE_OFF
          // Engine: vault(16) at offset 0, insurance at ~16
          // For now, basic info
          const slabId = pubkey.toBase58();
          const shortMint = `${mint.slice(0, 4)}...${mint.slice(-4)}`;

          return {
            id: slabId,
            symbol: `${shortMint}-PERP`,
            name: `${shortMint} Perpetual`,
            mint,
            price,
            change24h: 0,
            volume24h: 0,
            openInterest: 0,
            maxLeverage: 20, // from initial_margin_bps = 500 → 20x
            traders: 0,
            fundingRate: 0,
            nextFunding: 3600,
            creator: admin,
            createdAt: new Date().toISOString(),
          } satisfies Market;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Market[];

    cachedMarkets = markets;
    cacheTime = now;

    return NextResponse.json({ markets, count: markets.length });
  } catch (error) {
    console.error('Markets fetch error:', error);
    return NextResponse.json({ markets: [], count: 0, error: String(error) });
  }
}
