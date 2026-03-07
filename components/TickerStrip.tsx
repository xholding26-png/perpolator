'use client';

import { MOCK_MARKETS } from '@/lib/mock-data';
import { formatPrice, formatPercent } from '@/lib/utils';

export default function TickerStrip() {
  const items = [...MOCK_MARKETS, ...MOCK_MARKETS]; // duplicate for seamless loop

  return (
    <div className="border-y border-white/[0.06] overflow-hidden py-2">
      <div className="ticker-animate flex whitespace-nowrap gap-8">
        {items.map((market, i) => (
          <div key={`${market.id}-${i}`} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-white">{market.symbol}</span>
            <span className="text-[#666]">{formatPrice(market.price)}</span>
            <span
              className={
                market.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]'
              }
            >
              {formatPercent(market.change24h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
