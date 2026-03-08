'use client';

import { Market } from '@/lib/types';

export default function RecentTrades({ market: _market }: { market: Market }) {
  // Real trades would come from on-chain transaction history
  // For now, show empty state
  const trades: never[] = [];

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
      {trades.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[11px] text-[#444] font-mono">No trades yet</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[300px]">
          {/* Trades would render here */}
        </div>
      )}
    </div>
  );
}
