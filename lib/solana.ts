import { Connection, PublicKey } from '@solana/web3.js';

// Perpolator V2 Program
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '884d5ngZbUy3VJTHxgeopSWNBvqw2KAq9cSgVacJfgq2'
);

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

export function getConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

// ═══════════════════════════════════════════════════════════════
// Slab Layout Constants (match contracts-v2)
// ═══════════════════════════════════════════════════════════════

export const MAGIC = BigInt('0x54414c4f50524550'); // "PERPOLAT" LE
export const HEADER_LEN = 64;
export const CONFIG_LEN = 448;
export const ENGINE_OFF = 512;

// Header offsets
export const OFF_MAGIC = 0;
export const OFF_VERSION = 8;
export const OFF_BUMP = 12;
export const OFF_FLAGS = 13;
export const OFF_ADMIN = 16;
export const OFF_NONCE = 48;

// Config offsets (relative to HEADER_LEN)
export const OFF_COLLATERAL_MINT = HEADER_LEN;
export const OFF_VAULT = HEADER_LEN + 32;
export const OFF_ORACLE_FEED = HEADER_LEN + 72;
export const OFF_ORACLE_AUTH = HEADER_LEN + 104;
export const OFF_MAX_STALENESS = HEADER_LEN + 136;
export const OFF_CONF_FILTER = HEADER_LEN + 144;
export const OFF_ORACLE_PRICE = HEADER_LEN + 152;
export const OFF_ORACLE_TS = HEADER_LEN + 160;
export const OFF_PRICE_CAP = HEADER_LEN + 168;

// Flags
export const FLAG_RESOLVED = 0x01;
export const FLAG_PAUSED = 0x02;

// ═══════════════════════════════════════════════════════════════
// Slab Parser
// ═══════════════════════════════════════════════════════════════

export interface SlabInfo {
  pubkey: string;
  magic: bigint;
  version: number;
  flags: number;
  admin: string;
  nonce: bigint;
  collateralMint: string;
  vault: string;
  oraclePrice: number; // in USD (e6 format → float)
  isPaused: boolean;
  isResolved: boolean;
}

export function parseSlab(pubkey: string, data: Buffer): SlabInfo | null {
  if (data.length < HEADER_LEN + CONFIG_LEN) return null;

  const magic = data.readBigUInt64LE(OFF_MAGIC);
  if (magic !== MAGIC) return null;

  const version = data.readUInt32LE(OFF_VERSION);
  const flags = data[OFF_FLAGS];
  const admin = new PublicKey(data.subarray(OFF_ADMIN, OFF_ADMIN + 32)).toBase58();
  const nonce = data.readBigUInt64LE(OFF_NONCE);

  const collateralMint = new PublicKey(
    data.subarray(OFF_COLLATERAL_MINT, OFF_COLLATERAL_MINT + 32)
  ).toBase58();
  const vault = new PublicKey(
    data.subarray(OFF_VAULT, OFF_VAULT + 32)
  ).toBase58();

  const oraclePriceE6 = data.readBigUInt64LE(OFF_ORACLE_PRICE);
  const oraclePrice = Number(oraclePriceE6) / 1_000_000;

  return {
    pubkey,
    magic,
    version,
    flags,
    admin,
    nonce,
    collateralMint,
    vault,
    oraclePrice,
    isPaused: (flags & FLAG_PAUSED) !== 0,
    isResolved: (flags & FLAG_RESOLVED) !== 0,
  };
}

/**
 * Fetch all Perpolator market slabs from on-chain.
 */
export async function fetchMarkets(): Promise<SlabInfo[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { dataSize: 66000 }, // match our slab size
    ],
  });

  const markets: SlabInfo[] = [];
  for (const { pubkey, account } of accounts) {
    const slab = parseSlab(pubkey.toBase58(), account.data as Buffer);
    if (slab) markets.push(slab);
  }

  return markets;
}
