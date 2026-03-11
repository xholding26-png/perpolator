'use client';

import { useState, useCallback } from 'react';
import { PROGRAM_ID, RPC_URL } from '@/lib/solana';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { cn } from '@/lib/utils';

const TAG_FUND_ACCOUNT = 3;
const TAG_RECLAIM_COLLATERAL = 4;
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

function encU8(n: number): Buffer {
  const b = Buffer.alloc(1); b.writeUInt8(n); return b;
}
function encU16(n: number): Buffer {
  const b = Buffer.alloc(2); b.writeUInt16LE(n); return b;
}
function encU64(n: bigint): Buffer {
  const b = Buffer.alloc(8); b.writeBigUInt64LE(n); return b;
}

interface DepositPanelProps {
  slabId: string;
  vaultAddress: string;
  userIdx: number;
  tokenMint: string;
}

export default function DepositPanel({ slabId, vaultAddress, userIdx, tokenMint }: DepositPanelProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;

    const phantom = (window as any)?.solana;
    if (!phantom?.isPhantom) {
      setStatus('Connect Phantom wallet');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await phantom.connect();
      const userPubkey = phantom.publicKey;

      const connection = new Connection(RPC_URL, 'confirmed');
      const slab = new PublicKey(slabId);
      const vault = new PublicKey(vaultAddress);

      // Get user's ATA for the token
      const mint = new PublicKey(tokenMint);
      const [userAta] = PublicKey.findProgramAddressSync(
        [userPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
      );

      const amountLamports = BigInt(Math.round(amountNum * 1_000_000)); // e6 precision

      const data = Buffer.concat([
        encU8(mode === 'deposit' ? TAG_FUND_ACCOUNT : TAG_RECLAIM_COLLATERAL),
        encU16(userIdx),
        encU64(amountLamports),
      ]);

      const keys = mode === 'deposit'
        ? [
            { pubkey: userPubkey, isSigner: true, isWritable: false },
            { pubkey: slab, isSigner: false, isWritable: true },
            { pubkey: userAta, isSigner: false, isWritable: true },
            { pubkey: vault, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ]
        : [
            { pubkey: userPubkey, isSigner: true, isWritable: false },
            { pubkey: slab, isSigner: false, isWritable: true },
            { pubkey: userAta, isSigner: false, isWritable: true },
            { pubkey: vault, isSigner: false, isWritable: true },
            // vault authority PDA
            { pubkey: PublicKey.findProgramAddressSync(
                [Buffer.from('vault'), slab.toBuffer()], PROGRAM_ID
              )[0], isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ];

      const ix = new TransactionInstruction({
        keys,
        programId: PROGRAM_ID,
        data,
      });

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction().add(ix);
      tx.recentBlockhash = blockhash;
      tx.feePayer = userPubkey;

      const signed = await phantom.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setStatus(`✅ ${mode === 'deposit' ? 'Deposited' : 'Withdrew'}: ${sig.slice(0, 12)}...`);
      setAmount('');
    } catch (e: any) {
      setStatus(`❌ ${e.message?.slice(0, 80) || 'Failed'}`);
    } finally {
      setSubmitting(false);
    }
  }, [amount, mode, slabId, vaultAddress, userIdx, tokenMint]);

  return (
    <div className="border border-white/[0.06] p-4">
      <div className="grid grid-cols-2 gap-1 mb-4">
        {(['deposit', 'withdraw'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'text-xs py-1.5 font-mono uppercase transition-colors',
              mode === m ? 'bg-white/[0.08] text-white' : 'text-[#666] hover:text-white'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full bg-[#080808] border border-white/[0.06] px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/20 mb-3"
      />

      {status && (
        <div className="text-[11px] font-mono text-[#888] break-all mb-3">{status}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !parseFloat(amount)}
        className={cn(
          'w-full py-2 text-sm font-mono uppercase font-bold transition-colors disabled:opacity-40',
          mode === 'deposit'
            ? 'bg-[#00ff88] text-black hover:bg-[#00dd77]'
            : 'bg-[#ff3344] text-white hover:bg-[#dd2233]'
        )}
      >
        {submitting ? 'Processing...' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}
      </button>
    </div>
  );
}
