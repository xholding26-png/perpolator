'use client';

import { useEffect, useState } from 'react';
import { formatPercent } from '@/lib/utils';

interface PriceData {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

export default function TickerStrip() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        if (!res.ok) throw new Error();
        const data = await res.json();

        const mapped: PriceData[] = [];
        const nameMap: Record<string, string> = {
          solana: 'SOL',
          bonk: 'BONK',
          dogwifhat: 'WIF',
          'jito-governance-token': 'JTO',
        };

        for (const [id, info] of Object.entries(data)) {
          const d = info as { usd: number; usd_24h_change?: number };
          mapped.push({
            id,
            symbol: nameMap[id] || id.toUpperCase(),
            price: d.usd,
            change24h: d.usd_24h_change || 0,
          });
        }
        setPrices(mapped);
      } catch {
        setPrices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="border-y border-white/[0.06] py-2">
        <div className="flex items-center justify-center text-xs font-mono text-[#444] py-1">
          Loading prices...
        </div>
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className="border-y border-white/[0.06] py-2">
        <div className="flex items-center justify-center text-xs font-mono text-[#444] py-1">
          No active markets
        </div>
      </div>
    );
  }

  const items = [...prices, ...prices]; // duplicate for seamless loop

  return (
    <div className="border-y border-white/[0.06] overflow-hidden py-2">
      <div className="ticker-animate flex whitespace-nowrap gap-8">
        {items.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-white">{item.symbol}</span>
            <span className="text-[#666]">${item.price < 0.01 ? item.price.toFixed(8) : item.price.toFixed(2)}</span>
            <span className={item.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]'}>
              {formatPercent(item.change24h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
