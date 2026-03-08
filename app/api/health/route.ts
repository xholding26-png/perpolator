import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'devnet',
    programId: process.env.NEXT_PUBLIC_PROGRAM_ID || 'unknown',
  });
}
