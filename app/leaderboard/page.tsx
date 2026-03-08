'use client';

import Footer from '@/components/Footer';

export default function LeaderboardPage() {
  // Real leaderboard data would come from Supabase
  // For now, show empty state

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
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[#444]">
                  No data yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
