'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatUsd, formatPercent, formatFundingRate, formatCountdown, cn } from '@/lib/utils';
import Orderbook from '@/components/Orderbook';
import RecentTrades from '@/components/RecentTrades';
import OrderEntry from '@/components/OrderEntry';
import PositionsTable from '@/components/PositionsTable';
import TradingChart from '@/components/TradingChart';
import type { Market } from '@/lib/types';

export default function TradePage({ params }: { params: Promise<{ slab: string }> }) {
  const { slab } = use(params);
  const { selectedMarket, setSelectedMarket } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tokenMeta, setTokenMeta] = useState<{ name: string; symbol: string; image: string } | null>(null);

  // Fetch market from on-chain
  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    fetch('/api/markets')
      .then((r) => r.json())
      .then((data) => {
        const market = (data.markets || []).find((m: Market) => m.id === slab);
        if (market) {
          setSelectedMarket(market);
          // Fetch token metadata + live price
          if (market.mint) {
            // Metadata (name, symbol, image)
            fetch(`/api/token-metadata?mint=${market.mint}`)
              .then(r => r.json())
              .then(meta => {
                if (meta.symbol) {
                  setTokenMeta(meta);
                  const cur = useAppStore.getState().selectedMarket;
                  if (cur) setSelectedMarket({ ...cur, symbol: `${meta.symbol}-PERP`, name: `${meta.name} Perpetual` });
                }
              })
              .catch(() => {});
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => setSelectedMarket(null);
  }, [slab, setSelectedMarket]);

  // Live price polling from DexScreener
  useEffect(() => {
    if (!selectedMarket?.mint) return;
    const mint = selectedMarket.mint;
    
    const fetchLivePrice = () => {
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`)
        .then(r => r.json())
        .then(data => {
          if (data.pairs?.[0]) {
            const pair = data.pairs[0];
            const cur = useAppStore.getState().selectedMarket;
            if (cur && cur.mint === mint) {
              setSelectedMarket({
                ...cur,
                price: parseFloat(pair.priceUsd || '0'),
                change24h: parseFloat(pair.priceChange?.h24 || '0'),
                volume24h: parseFloat(pair.volume?.h24 || '0'),
              });
            }
          }
        })
        .catch(() => {});
    };
    
    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 5000);
    return () => clearInterval(interval);
  }, [selectedMarket?.mint, setSelectedMarket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-48px)]">
        <span className="text-[#666] font-mono text-sm">Loading market...</span>
      </div>
    );
  }

  if (notFound || !selectedMarket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] gap-4">
        <span className="text-[#666] font-mono text-sm">Market not found</span>
        <Link
          href="/markets"
          className="text-xs font-mono border border-white/[0.06] px-4 py-2 hover:bg-white/[0.04] transition-colors"
        >
          ← Back to Markets
        </Link>
      </div>
    );
  }

  const m = selectedMarket;

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Market Header */}
      <div className="border-b border-white/[0.06] px-4 py-2 flex items-center gap-6 overflow-x-auto">
        <div className="flex items-center gap-2">
          {tokenMeta?.image && (
            <img src={tokenMeta.image} alt={tokenMeta.symbol} className="w-6 h-6 rounded-full" />
          )}
          <span className="text-lg font-mono font-bold text-white">{m.symbol}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-mono font-bold text-white">
            {m.price > 0 ? formatPrice(m.price) : '—'}
          </span>
          {m.change24h !== 0 && (
            <span className={cn('text-xs font-mono', m.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
              {formatPercent(m.change24h)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-[#666]">
          <div>
            <span className="text-[#444]">24h Vol </span>
            <span className="text-white">{m.volume24h > 0 ? formatUsd(m.volume24h) : '—'}</span>
          </div>
          <div>
            <span className="text-[#444]">OI </span>
            <span className="text-white">{m.openInterest > 0 ? formatUsd(m.openInterest) : '—'}</span>
          </div>
          <div>
            <span className="text-[#444]">Funding </span>
            <span className={cn(m.fundingRate >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
              {m.fundingRate !== 0 ? formatFundingRate(m.fundingRate) : '—'}
            </span>
          </div>
          <div>
            <span className="text-[#444]">Next </span>
            <span className="text-white">{m.nextFunding > 0 ? formatCountdown(m.nextFunding) : '—'}</span>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Orderbook + Recent Trades */}
        <div className="hidden lg:flex flex-col w-[280px] border-r border-white/[0.06] overflow-y-auto">
          <div className="flex-1">
            <Orderbook market={m} />
          </div>
          <div className="border-t border-white/[0.06]">
            <RecentTrades market={m} />
          </div>
        </div>

        {/* Center: Chart + Positions */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <TradingChart market={m} />
          </div>
          <PositionsTable />
        </div>

        {/* Right: Order Entry */}
        <div className="hidden md:flex flex-col w-[300px] border-l border-white/[0.06]">
          <OrderEntry market={m} />
        </div>
      </div>
    </div>
  );
}
