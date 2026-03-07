'use client';

import { useMemo } from 'react';
import { Market } from '@/lib/types';
import { generateOrderbook } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

export default function Orderbook({ market }: { market: Market }) {
  const book = useMemo(() => generateOrderbook(market), [market]);

  const maxTotal = Math.max(
    book.bids[book.bids.length - 1]?.total || 0,
    book.asks[0]?.total || 0
  );

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

      {/* Asks (reversed so lowest ask is at bottom) */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end">
        {book.asks.map((entry, i) => (
          <div key={`ask-${i}`} className="relative grid grid-cols-3 text-[11px] font-mono px-3 py-[2px]">
            <div
              className="absolute inset-0 depth-ask"
              style={{ width: `${(entry.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
            />
            <span className="relative text-[#ff3344]">{formatPrice(entry.price)}</span>
            <span className="relative text-right text-[#666]">{entry.size.toFixed(2)}</span>
            <span className="relative text-right text-[#666]">{entry.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Spread / current price */}
      <div className="px-3 py-2 border-y border-white/[0.06] text-center">
        <span className="text-sm font-mono font-bold text-white">{formatPrice(market.price)}</span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {book.bids.map((entry, i) => (
          <div key={`bid-${i}`} className="relative grid grid-cols-3 text-[11px] font-mono px-3 py-[2px]">
            <div
              className="absolute inset-0 depth-bid"
              style={{ width: `${(entry.total / maxTotal) * 100}%`, right: 0, left: 'auto' }}
            />
            <span className="relative text-[#00ff88]">{formatPrice(entry.price)}</span>
            <span className="relative text-right text-[#666]">{entry.size.toFixed(2)}</span>
            <span className="relative text-right text-[#666]">{entry.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
