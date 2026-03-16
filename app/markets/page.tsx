'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatUsd, formatPercent, cn } from '@/lib/utils';
import type { SortField, SortDirection } from '@/lib/types';
import Footer from '@/components/Footer';

export default function MarketsPage() {
  const { markets, marketsLoading, setMarkets, setMarketsLoading } = useAppStore();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('volume24h');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  // Fetch real markets from on-chain
  useEffect(() => {
    setMarketsLoading(true);
    fetch('/api/markets')
      .then((r) => r.json())
      .then((data) => {
        setMarkets(data.markets || []);
      })
      .catch(() => {
        setMarkets([]);
      });
  }, [setMarkets, setMarketsLoading]);

  const filtered = useMemo(() => {
    let result = markets.filter(
      (m) =>
        m.symbol.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      const aVal = a[sortField] as number;
      const bVal = b[sortField] as number;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [markets, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-mono font-bold">Markets</h1>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search markets..."
            className="bg-[#080808] border border-white/[0.06] px-4 py-2 text-sm font-mono text-white outline-none focus:border-white/20 w-64"
          />
        </div>

        {/* Sort buttons */}
        <div className="flex gap-2 mb-4">
          {([
            ['volume24h', 'Volume'],
            ['openInterest', 'Open Interest'],
            ['change24h', 'Change'],
            ['createdAt', 'Newest'],
          ] as [SortField, string][]).map(([field, label]) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={cn(
                'text-[10px] uppercase tracking-wider px-3 py-1 border transition-colors font-mono',
                sortField === field
                  ? 'border-white/20 text-white'
                  : 'border-white/[0.06] text-[#666] hover:text-white'
              )}
            >
              {label} {sortField === field && (sortDir === 'desc' ? '↓' : '↑')}
            </button>
          ))}
        </div>

        {/* Content */}
        {marketsLoading ? (
          <div className="border border-white/[0.06] py-16 text-center">
            <span className="text-sm font-mono text-[#444]">Loading markets...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-white/[0.06] py-16 text-center">
            <p className="text-[#666] font-mono text-sm mb-4">No markets found. Be the first to launch one.</p>
            <Link
              href="/launch"
              className="inline-block bg-white text-black px-6 py-2 text-sm font-mono font-bold hover:bg-[#e0e0e0] transition-colors"
            >
              Launch Market →
            </Link>
          </div>
        ) : (
          <div className="border border-white/[0.06] overflow-x-auto">
            <table className="w-full min-w-0">
              <thead>
                <tr className="text-[10px] text-[#666] uppercase tracking-wider border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 font-normal">Market</th>
                  <th className="text-right px-4 py-3 font-normal">Price</th>
                  <th className="text-right px-4 py-3 font-normal">24h Change</th>
                  <th className="text-right px-4 py-3 font-normal hidden md:table-cell">24h Volume</th>
                  <th className="text-right px-4 py-3 font-normal hidden lg:table-cell">Open Interest</th>
                  <th className="text-right px-4 py-3 font-normal hidden lg:table-cell">Max Lev</th>
                  <th className="text-right px-4 py-3 font-normal hidden md:table-cell">Traders</th>
                  <th className="text-right px-4 py-3 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((market) => (
                  <tr
                    key={market.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {market.image ? (
                          <img src={market.image} alt={market.symbol} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-[#666]">
                            {market.symbol.split('-')[0].slice(0, 3)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-mono text-white">{market.symbol}</div>
                          <div className="text-[10px] text-[#666]">{market.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-white">
                      {market.price > 0 ? formatPrice(market.price) : '—'}
                    </td>
                    <td className={cn('px-4 py-3 text-right font-mono text-sm', market.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {market.change24h !== 0 ? formatPercent(market.change24h) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[#666] hidden md:table-cell">
                      {formatUsd(market.volume24h)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[#666] hidden lg:table-cell">
                      {formatUsd(market.openInterest)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[#666] hidden lg:table-cell">
                      {market.maxLeverage}x
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[#666] hidden md:table-cell">
                      {market.traders}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/trade/${market.id}`}
                        className="text-xs font-mono bg-white/[0.06] border border-white/[0.1] px-3 py-1.5 hover:bg-white/[0.1] transition-colors whitespace-nowrap"
                      >
                        Trade →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
