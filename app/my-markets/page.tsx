'use client';

import Link from 'next/link';
import { MOCK_MARKETS } from '@/lib/mock-data';
import { formatUsd, formatPercent } from '@/lib/utils';
import Footer from '@/components/Footer';

export default function MyMarketsPage() {
  // Mock: pretend first 3 markets are "yours"
  const myMarkets = MOCK_MARKETS.slice(0, 3);
  const totalRevenue = 12_340;
  const totalVolume = myMarkets.reduce((acc, m) => acc + m.volume24h, 0);

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-xl font-mono font-bold mb-8">My Markets</h1>

        {/* Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Markets Created</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{myMarkets.length}</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-mono font-bold text-[#00ff88] mt-1">{formatUsd(totalRevenue)}</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Total Volume</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{formatUsd(totalVolume)}</div>
          </div>
        </div>

        {/* Markets list */}
        <div className="border border-white/[0.06]">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-4 py-3 font-normal">Market</th>
                <th className="px-4 py-3 font-normal text-right">Volume (24h)</th>
                <th className="px-4 py-3 font-normal text-right">Open Interest</th>
                <th className="px-4 py-3 font-normal text-right">Traders</th>
                <th className="px-4 py-3 font-normal text-right">Change (24h)</th>
                <th className="px-4 py-3 font-normal text-right">Revenue</th>
                <th className="px-4 py-3 font-normal text-right"></th>
              </tr>
            </thead>
            <tbody>
              {myMarkets.map((market, i) => (
                <tr key={market.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white text-sm">{market.symbol}</td>
                  <td className="px-4 py-3 text-right text-white">{formatUsd(market.volume24h)}</td>
                  <td className="px-4 py-3 text-right text-[#666]">{formatUsd(market.openInterest)}</td>
                  <td className="px-4 py-3 text-right text-[#666]">{market.traders}</td>
                  <td className={`px-4 py-3 text-right ${market.change24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]'}`}>
                    {formatPercent(market.change24h)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#00ff88]">
                    {formatUsd([5670, 3450, 3220][i])}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/trade/${market.id}`}
                      className="text-[#666] hover:text-white transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
