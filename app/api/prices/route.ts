import { NextResponse } from 'next/server';

let cachedPrices: Record<string, unknown> | null = null;
let cacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function GET() {
  const now = Date.now();

  if (cachedPrices && now - cacheTime < CACHE_TTL) {
    return NextResponse.json(cachedPrices);
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,bonk,dogwifhat,jito-governance-token&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true',
      { next: { revalidate: 5 } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko returned ${res.status}`);
    }

    const data = await res.json();
    cachedPrices = data;
    cacheTime = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Price fetch error:', error);
    // Return cached data if available, otherwise empty
    if (cachedPrices) {
      return NextResponse.json(cachedPrices);
    }
    return NextResponse.json({}, { status: 502 });
  }
}
