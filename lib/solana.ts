import { Connection, PublicKey } from '@solana/web3.js';

export const HELIUS_RPC = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=dd62a158-95b7-40e8-bc19-a59cacb95f40';
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'GM8zjJ8LTBMv9xEsverh6H6wLyevgMHEJXcEzyY3rY24');

export function getConnection(): Connection {
  return new Connection(HELIUS_RPC, 'confirmed');
}
