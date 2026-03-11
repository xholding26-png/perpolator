import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, RPC_URL } from '@/lib/solana';

export async function GET() {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Check program exists
    const progInfo = await connection.getAccountInfo(PROGRAM_ID);
    const programExists = !!progInfo;
    
    // Count markets
    let marketCount = 0;
    try {
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        dataSlice: { offset: 0, length: 8 },
      });
      marketCount = accounts.length;
    } catch {}

    // Get slot
    const slot = await connection.getSlot();

    return NextResponse.json({
      status: 'ok',
      program: PROGRAM_ID.toBase58(),
      programExists,
      network: RPC_URL.includes('devnet') ? 'devnet' : RPC_URL.includes('mainnet') ? 'mainnet' : 'unknown',
      markets: marketCount,
      slot,
      timestamp: Date.now(),
      version: '2.0.0',
      features: [
        'permissionless_markets',
        'dex_oracle',
        'pyth_oracle',
        'vamm',
        'insurance_lp',
        'coin_margined',
        'keeper_crank',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: String(error),
      timestamp: Date.now(),
    }, { status: 500 });
  }
}
