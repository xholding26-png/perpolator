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
    const KNOWN_SLABS: string[] = [
      // Cleared — old devnet markets removed, will repopulate after redeploy
    ];

    // Try getProgramAccounts, fallback to known slabs
    let accounts: { pubkey: PublicKey; account: { data: Buffer | Uint8Array } }[] = [];
    // Temporarily disabled — old program markets cleared, will re-enable after redeploy
    // try {
    //   const rpcAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
    //     dataSlice: { offset: 0, length: 512 },
    //   });
    //   accounts = rpcAccounts as any;
    // } catch {}

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
            image: '',
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

    // Enrich with token metadata from Helius DAS
    const HELIUS_KEY = 'dd62a158-95b7-40e8-bc19-a59cacb95f40';
    const mints = markets.map(m => m.mint).filter(Boolean);
    if (mints.length > 0) {
      try {
        const dasResp = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getAssetBatch',
            params: { ids: mints },
          }),
        });
        const dasData = await dasResp.json();
        if (dasData.result) {
          const metaMap = new Map<string, { name: string; symbol: string; image: string }>();
          for (const asset of dasData.result) {
            if (asset?.id && asset?.content?.metadata) {
              metaMap.set(asset.id, {
                name: asset.content.metadata.name || '',
                symbol: asset.content.metadata.symbol || '',
                image: asset.content.links?.image || asset.content.files?.[0]?.uri || '',
              });
            }
          }
          for (const market of markets) {
            const meta = metaMap.get(market.mint);
            if (meta?.symbol) {
              market.symbol = `${meta.symbol}-PERP`;
              market.name = `${meta.name} Perpetual`;
              (market as any).image = meta.image;
            }
          }
        }
      } catch {}
    }

    // Enrich with live prices from DexScreener
    try {
      const mintList = markets.map(m => m.mint).filter(Boolean).join(',');
      if (mintList) {
        for (const market of markets) {
          try {
            const dsResp = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${market.mint}`);
            const dsData = await dsResp.json();
            if (dsData.pairs?.[0]) {
              const pair = dsData.pairs[0];
              market.price = parseFloat(pair.priceUsd || '0') || market.price;
              market.change24h = parseFloat(pair.priceChange?.h24 || '0');
              market.volume24h = parseFloat(pair.volume?.h24 || '0');
            }
          } catch {}
        }
      }
    } catch {}

    cachedMarkets = markets;
    cacheTime = now;

    return NextResponse.json({ markets, count: markets.length });
  } catch (error) {
    console.error('Markets fetch error:', error);
    return NextResponse.json({ markets: [], count: 0, error: String(error) });
  }
}
