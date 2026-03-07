'use client';

import { useMemo } from 'react';
import { Market } from '@/lib/types';
import { generateRecentTrades } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';

export default function RecentTrades({ market }: { market: Market }) {
  const trades = useMemo(() => generateRecentTrades(market), [market]);

  return (
    <div className="flex flex-col">
      <div className="text-xs text-[#666] uppercase tracking-wider px-3 py-2 border-b border-white/[0.06]">
        Recent Trades
      </div>
      <div className="grid grid-cols-3 text-[10px] text-[#666] px-3 py-1 border-b border-white/[0.06]">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="overflow-y-auto max-h-[300px]">
        {trades.map((trade) => (
          <div key={trade.id} className="grid grid-cols-3 text-[11px] font-mono px-3 py-[2px]">
            <span className={trade.side === 'long' ? 'text-[#00ff88]' : 'text-[#ff3344]'}>
              {formatPrice(trade.price)}
            </span>
            <span className="text-right text-[#666]">{trade.size.toFixed(2)}</span>
            <span className="text-right text-[#666]">
              {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
