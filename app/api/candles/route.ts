import { NextRequest, NextResponse } from 'next/server';

let cache: Record<string, { data: unknown; time: number }> = {};
const CACHE_TTL = 30000; // 30 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coinId') || 'solana';
  const days = searchParams.get('days') || '7';
  const cacheKey = `${coinId}-${days}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].time < CACHE_TTL) {
    return NextResponse.json(cache[cacheKey].data);
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko returned ${res.status}`);
    }

    const data = await res.json();
    cache[cacheKey] = { data, time: now };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Candle fetch error:', error);
    if (cache[cacheKey]) {
      return NextResponse.json(cache[cacheKey].data);
    }
    return NextResponse.json([], { status: 502 });
  }
}
