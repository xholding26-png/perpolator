'use client';

import { MOCK_LEADERBOARD } from '@/lib/mock-data';
import { formatUsd, cn } from '@/lib/utils';
import Footer from '@/components/Footer';

export default function LeaderboardPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <h1 className="text-xl font-mono font-bold mb-2">Leaderboard</h1>
        <p className="text-sm text-[#666] mb-8">Top traders by realized + unrealized PnL across all markets.</p>

        <div className="border border-white/[0.06]">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-4 py-3 font-normal w-16">#</th>
                <th className="px-4 py-3 font-normal">Trader</th>
                <th className="px-4 py-3 font-normal text-right">PnL</th>
                <th className="px-4 py-3 font-normal text-right hidden md:table-cell">Trades</th>
                <th className="px-4 py-3 font-normal text-right hidden md:table-cell">Win Rate</th>
                <th className="px-4 py-3 font-normal text-right hidden lg:table-cell">Volume</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERBOARD.map((entry) => (
                <tr
                  key={entry.rank}
                  className={cn(
                    'border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',
                    entry.rank <= 3 && 'bg-white/[0.01]'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={cn(
                      'font-bold',
                      entry.rank === 1 ? 'text-white' :
                      entry.rank === 2 ? 'text-[#999]' :
                      entry.rank === 3 ? 'text-[#886644]' :
                      'text-[#666]'
                    )}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{entry.address}</td>
                  <td className={cn(
                    'px-4 py-3 text-right text-sm font-bold',
                    entry.pnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]'
                  )}>
                    {entry.pnl >= 0 ? '+' : ''}{formatUsd(entry.pnl)}
                  </td>
                  <td className="px-4 py-3 text-right text-[#666] hidden md:table-cell">
                    {entry.trades.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className={entry.winRate >= 50 ? 'text-[#00ff88]' : 'text-[#ff3344]'}>
                      {entry.winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#666] hidden lg:table-cell">
                    {formatUsd(entry.volume)}
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
