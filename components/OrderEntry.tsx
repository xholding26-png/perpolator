'use client';

import { useState, useCallback } from 'react';
import { Market } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { PROGRAM_ID, RPC_URL } from '@/lib/solana';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

// Tags from our program
const TAG_EXECUTE_TRADE = 5;
const TAG_TRADE_VAMM = 35;

function encU8(n: number): Buffer {
  const b = Buffer.alloc(1); b.writeUInt8(n); return b;
}
function encU16(n: number): Buffer {
  const b = Buffer.alloc(2); b.writeUInt16LE(n); return b;
}
function encI128(n: bigint): Buffer {
  const b = Buffer.alloc(16);
  const unsigned = n < 0n ? n + (1n << 128n) : n;
  b.writeBigUInt64LE(unsigned & BigInt('0xFFFFFFFFFFFFFFFF'), 0);
  b.writeBigUInt64LE((unsigned >> 64n) & BigInt('0xFFFFFFFFFFFFFFFF'), 8);
  return b;
}

export default function OrderEntry({ market }: { market: Market }) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [size, setSize] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const sizeNum = parseFloat(size) || 0;
  const price = orderType === 'limit' ? (parseFloat(limitPrice) || market.price) : market.price;
  const notional = sizeNum * price;
  const margin = notional / leverage;
  const liqDistance = 1 / leverage;
  const liqPrice = side === 'long'
    ? price * (1 - liqDistance * 0.9)
    : price * (1 + liqDistance * 0.9);

  const handleSubmit = useCallback(async () => {
    if (sizeNum <= 0) return;
    
    // Check for Phantom wallet
    const phantom = (window as any)?.solana;
    if (!phantom?.isPhantom) {
      setStatus('Connect Phantom wallet first');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await phantom.connect();
      const userPubkey = phantom.publicKey;

      // Build trade_vamm instruction (uses virtual AMM liquidity)
      // Data: tag(1) + user_idx(2) + size(16, i128)
      const sizeE6 = BigInt(Math.round(sizeNum * 1_000_000));
      const signedSize = side === 'long' ? sizeE6 : -sizeE6;

      const data = Buffer.concat([
        encU8(TAG_TRADE_VAMM),
        encU16(1), // User index (first registered trader = index 1)
        encI128(signedSize),
      ]);

      const slabPubkey = new PublicKey(market.id);

      const ix = new TransactionInstruction({
        keys: [
          { pubkey: userPubkey, isSigner: true, isWritable: false },
          { pubkey: slabPubkey, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const connection = new Connection(RPC_URL, 'confirmed');
      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction().add(ix);
      tx.recentBlockhash = blockhash;
      tx.feePayer = userPubkey;

      const signed = await phantom.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setStatus(`✅ Trade confirmed: ${sig.slice(0, 12)}...`);
      setSize('');
    } catch (e: any) {
      setStatus(`❌ ${e.message?.slice(0, 80) || 'Trade failed'}`);
    } finally {
      setSubmitting(false);
    }
  }, [sizeNum, side, market.id]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs text-[#666] uppercase tracking-wider px-4 py-2 border-b border-white/[0.06]">
        Order
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Order Type */}
        <div className="grid grid-cols-2 gap-1 bg-[#080808] p-0.5 border border-white/[0.06]">
          {(['market', 'limit'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={cn(
                'text-xs py-1.5 font-mono uppercase transition-colors',
                orderType === type ? 'bg-white/[0.08] text-white' : 'text-[#666] hover:text-white'
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Side */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setSide('long')}
            className={cn(
              'text-xs py-2 font-mono uppercase border transition-colors',
              side === 'long'
                ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/[0.06]'
                : 'border-white/[0.06] text-[#666] hover:text-white'
            )}
          >
            Long
          </button>
          <button
            onClick={() => setSide('short')}
            className={cn(
              'text-xs py-2 font-mono uppercase border transition-colors',
              side === 'short'
                ? 'border-[#ff3344] text-[#ff3344] bg-[#ff3344]/[0.06]'
                : 'border-white/[0.06] text-[#666] hover:text-white'
            )}
          >
            Short
          </button>
        </div>

        {/* Limit Price */}
        {orderType === 'limit' && (
          <div>
            <label className="text-[10px] text-[#666] uppercase tracking-wider">Price</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={formatPrice(market.price)}
              className="w-full mt-1 bg-[#080808] border border-white/[0.06] px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/20"
            />
          </div>
        )}

        {/* Size */}
        <div>
          <label className="text-[10px] text-[#666] uppercase tracking-wider">Size</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.00"
            className="w-full mt-1 bg-[#080808] border border-white/[0.06] px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/20"
          />
        </div>

        {/* Leverage */}
        <div>
          <div className="flex justify-between">
            <label className="text-[10px] text-[#666] uppercase tracking-wider">Leverage</label>
            <span className="text-xs font-mono text-white">{leverage}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={market.maxLeverage}
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="mt-2"
          />
          <div className="flex justify-between text-[10px] text-[#666] font-mono mt-1">
            <span>1x</span>
            <span>{market.maxLeverage}x</span>
          </div>
        </div>

        {/* Info */}
        <div className="border-t border-white/[0.06] pt-3 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-[#666]">Margin Required</span>
            <span className="font-mono text-white">${margin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[#666]">Notional</span>
            <span className="font-mono text-white">${notional.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[#666]">Est. Liq. Price</span>
            <span className="font-mono text-[#ff3344]">
              {sizeNum > 0 ? formatPrice(liqPrice) : '—'}
            </span>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className="text-[11px] font-mono text-[#888] break-all">{status}</div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || sizeNum <= 0}
          className={cn(
            'w-full py-3 text-sm font-mono uppercase font-bold transition-colors mt-auto disabled:opacity-40',
            side === 'long'
              ? 'bg-[#00ff88] text-black hover:bg-[#00dd77]'
              : 'bg-[#ff3344] text-white hover:bg-[#dd2233]'
          )}
        >
          {submitting ? 'Submitting...' : side === 'long' ? 'Long' : 'Short'} {market.symbol}
        </button>
      </div>
    </div>
  );
}
