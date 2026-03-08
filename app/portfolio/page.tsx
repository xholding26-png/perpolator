'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatUsd, formatPercent, cn } from '@/lib/utils';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  const { positions, trades, balance, connected } = useAppStore();
  const [solPrice, setSolPrice] = useState(0);

  // Fetch real SOL price
  useEffect(() => {
    fetch('/api/prices')
      .then((r) => r.json())
      .then((data) => {
        if (data.solana?.usd) setSolPrice(data.solana.usd);
      })
      .catch(() => {});
  }, []);

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const totalMargin = positions.reduce((acc, p) => acc + p.margin, 0);
  const accountValue = solPrice > 0 ? balance * solPrice : 0;

  if (!connected) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#444] font-mono text-sm mb-2">Connect your wallet to view your portfolio</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-xl font-mono font-bold mb-8">Portfolio</h1>

        {/* Account stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ['Account Value', accountValue > 0 ? formatUsd(accountValue) : '—'],
            ['Available Balance', `${balance.toFixed(3)} SOL`],
            ['Margin In Use', totalMargin > 0 ? formatUsd(totalMargin) : '—'],
            ['Unrealized PnL', positions.length > 0 ? formatUsd(totalUnrealizedPnl) : '—'],
          ].map(([label, value], i) => (
            <div key={label} className="border border-white/[0.06] bg-[#080808] p-4">
              <div className="text-[10px] text-[#666] uppercase tracking-wider">{label}</div>
              <div className={cn(
                'text-lg font-mono font-bold mt-1',
                i === 3 && positions.length > 0 ? (totalUnrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]') : 'text-white'
              )}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Positions */}
        <h2 className="text-sm font-mono text-[#666] uppercase tracking-wider mb-3">
          Open Positions ({positions.length})
        </h2>
        <div className="border border-white/[0.06] mb-8 overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-4 py-3 font-normal">Market</th>
                <th className="px-4 py-3 font-normal">Side</th>
                <th className="px-4 py-3 font-normal text-right">Size</th>
                <th className="px-4 py-3 font-normal text-right">Entry</th>
                <th className="px-4 py-3 font-normal text-right">Mark</th>
                <th className="px-4 py-3 font-normal text-right">Leverage</th>
                <th className="px-4 py-3 font-normal text-right">uPnL</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#444]">No open positions</td>
                </tr>
              ) : (
                positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{pos.symbol}</td>
                    <td className={cn('px-4 py-3 uppercase', pos.side === 'long' ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {pos.side}
                    </td>
                    <td className="px-4 py-3 text-right text-white">{pos.size}</td>
                    <td className="px-4 py-3 text-right text-[#666]">{formatPrice(pos.entryPrice)}</td>
                    <td className="px-4 py-3 text-right text-white">{formatPrice(pos.markPrice)}</td>
                    <td className="px-4 py-3 text-right text-[#666]">{pos.leverage}x</td>
                    <td className={cn('px-4 py-3 text-right', pos.unrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {formatUsd(pos.unrealizedPnl)} ({formatPercent(pos.unrealizedPnlPercent)})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Trade History */}
        <h2 className="text-sm font-mono text-[#666] uppercase tracking-wider mb-3">
          Trade History
        </h2>
        <div className="border border-white/[0.06] overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-4 py-3 font-normal">Market</th>
                <th className="px-4 py-3 font-normal">Side</th>
                <th className="px-4 py-3 font-normal text-right">Size</th>
                <th className="px-4 py-3 font-normal text-right">Price</th>
                <th className="px-4 py-3 font-normal text-right">Fee</th>
                <th className="px-4 py-3 font-normal text-right">PnL</th>
                <th className="px-4 py-3 font-normal text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#444]">No trades yet</td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{trade.symbol}</td>
                    <td className={cn('px-4 py-3 uppercase', trade.side === 'long' ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {trade.side}
                    </td>
                    <td className="px-4 py-3 text-right text-white">{trade.size}</td>
                    <td className="px-4 py-3 text-right text-white">{formatPrice(trade.price)}</td>
                    <td className="px-4 py-3 text-right text-[#666]">${trade.fee.toFixed(2)}</td>
                    <td className={cn('px-4 py-3 text-right', (trade.pnl ?? 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {trade.pnl !== undefined ? formatUsd(trade.pnl) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-[#666]">
                      {new Date(trade.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
