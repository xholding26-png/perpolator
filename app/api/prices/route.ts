import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, RPC_URL, OFF_ORACLE_PRICE } from '@/lib/solana';

/**
 * GET /api/prices?slab=<pubkey>
 * Returns the current oracle price for a market slab.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slabKey = url.searchParams.get('slab');

  if (!slabKey) {
    return NextResponse.json({ error: 'Missing slab parameter' }, { status: 400 });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const pubkey = new PublicKey(slabKey);
    const info = await connection.getAccountInfo(pubkey);

    if (!info || !info.data) {
      return NextResponse.json({ error: 'Slab not found' }, { status: 404 });
    }

    const data = info.data as Buffer;
    const oraclePriceE6 = Number(data.readBigUInt64LE(OFF_ORACLE_PRICE));
    const price = oraclePriceE6 / 1_000_000;

    // Read some engine state
    const flags = data[13];

    return NextResponse.json({
      slab: slabKey,
      price,
      priceE6: oraclePriceE6,
      isPaused: (flags & 0x02) !== 0,
      isResolved: (flags & 0x01) !== 0,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
