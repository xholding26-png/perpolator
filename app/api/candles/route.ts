import { NextRequest, NextResponse } from 'next/server';

// GeckoTerminal free API — real OHLCV data for any Solana token
const BASE = 'https://api.geckoterminal.com/api/v2/networks/solana';

export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get('mint');
  const tf = req.nextUrl.searchParams.get('tf') || '5'; // minutes
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '300'), 1000);

  if (!mint) {
    return NextResponse.json({ error: 'Missing mint' }, { status: 400 });
  }

  try {
    // 1. Find the top pool for this token
    const poolResp = await fetch(
      `${BASE}/tokens/${mint}/pools?page=1`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 60 } }
    );
    const poolData = await poolResp.json();
    
    if (!poolData.data?.length) {
      return NextResponse.json({ candles: [], error: 'No pool found' });
    }

    const poolAddress = poolData.data[0].attributes.address;

    // 2. Fetch OHLCV candles
    // Timeframes: minute (1,5,15), hour (1,4,12), day (1)
    let endpoint: string;
    const tfNum = parseInt(tf);
    if (tfNum < 60) {
      endpoint = `pools/${poolAddress}/ohlcv/minute?aggregate=${tfNum}&limit=${limit}`;
    } else if (tfNum < 1440) {
      endpoint = `pools/${poolAddress}/ohlcv/hour?aggregate=${Math.floor(tfNum / 60)}&limit=${limit}`;
    } else {
      endpoint = `pools/${poolAddress}/ohlcv/day?aggregate=1&limit=${limit}`;
    }

    const ohlcvResp = await fetch(
      `${BASE}/${endpoint}`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 15 } }
    );
    const ohlcvData = await ohlcvResp.json();

    const rawCandles = ohlcvData.data?.attributes?.ohlcv_list || [];
    
    // GeckoTerminal format: [timestamp, open, high, low, close, volume]
    // Sort ascending by time
    const candles = rawCandles
      .map((c: number[]) => ({
        time: c[0],
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5],
      }))
      .sort((a: any, b: any) => a.time - b.time);

    return NextResponse.json({
      candles,
      pool: poolAddress,
      count: candles.length,
      source: 'geckoterminal',
    });
  } catch (error) {
    return NextResponse.json({ candles: [], error: String(error) });
  }
}
