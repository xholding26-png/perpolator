'use client';

import { Market } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function Orderbook({ market }: { market: Market }) {
  // Real orderbook would come from on-chain program accounts
  // For now, show empty state since no orders exist yet
  const bids: { price: number; size: number; total: number }[] = [];
  const asks: { price: number; size: number; total: number }[] = [];

  const hasData = bids.length > 0 || asks.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs text-[#666] uppercase tracking-wider px-3 py-2 border-b border-white/[0.06]">
        Orderbook
      </div>

      {/* Header */}
      <div className="grid grid-cols-3 text-[10px] text-[#666] px-3 py-1 border-b border-white/[0.06]">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {hasData ? (
        <>
          {/* Asks */}
          <div className="flex-1 overflow-hidden flex flex-col justify-end">
            {asks.map((entry, i) => (
              <div key={`ask-${i}`} className="relative grid grid-cols-3 text-[11px] font-mono px-3 py-[2px]">
                <span className="relative text-[#ff3344]">{formatPrice(entry.price)}</span>
                <span className="relative text-right text-[#666]">{entry.size.toFixed(2)}</span>
                <span className="relative text-right text-[#666]">{entry.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Spread / current price */}
          <div className="px-3 py-2 border-y border-white/[0.06] text-center">
            <span className="text-sm font-mono font-bold text-white">
              {market.price > 0 ? formatPrice(market.price) : '—'}
            </span>
          </div>

          {/* Bids */}
          <div className="flex-1 overflow-hidden">
            {bids.map((entry, i) => (
              <div key={`bid-${i}`} className="relative grid grid-cols-3 text-[11px] font-mono px-3 py-[2px]">
                <span className="relative text-[#00ff88]">{formatPrice(entry.price)}</span>
                <span className="relative text-right text-[#666]">{entry.size.toFixed(2)}</span>
                <span className="relative text-right text-[#666]">{entry.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <p className="text-[11px] text-[#444] font-mono text-center px-4">
            No orders yet
          </p>
          {market.price > 0 && (
            <div className="mt-4 px-3 py-2 text-center">
              <span className="text-sm font-mono font-bold text-white">{formatPrice(market.price)}</span>
              <span className="text-[10px] text-[#444] ml-2">oracle</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
