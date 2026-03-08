'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatUsd, formatPercent, cn } from '@/lib/utils';

type Tab = 'positions' | 'orders' | 'history';

export default function PositionsTable() {
  const [tab, setTab] = useState<Tab>('positions');
  const { positions, orders, trades } = useAppStore();

  return (
    <div className="border-t border-white/[0.06]">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {(['positions', 'orders', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-xs uppercase tracking-wider transition-colors',
              tab === t ? 'text-white border-b border-white' : 'text-[#666] hover:text-white'
            )}
          >
            {t} {t === 'positions' ? `(${positions.length})` : t === 'orders' ? `(${orders.length})` : ''}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        {tab === 'positions' && (
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-3 py-2 font-normal">Market</th>
                <th className="px-3 py-2 font-normal">Side</th>
                <th className="px-3 py-2 font-normal text-right">Size</th>
                <th className="px-3 py-2 font-normal text-right">Entry</th>
                <th className="px-3 py-2 font-normal text-right">Mark</th>
                <th className="px-3 py-2 font-normal text-right">Lev</th>
                <th className="px-3 py-2 font-normal text-right">uPnL</th>
                <th className="px-3 py-2 font-normal text-right">Liq. Price</th>
                <th className="px-3 py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-[#444]">
                    No open positions
                  </td>
                </tr>
              ) : (
                positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-white">{pos.symbol}</td>
                    <td className={cn('px-3 py-2 uppercase', pos.side === 'long' ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {pos.side}
                    </td>
                    <td className="px-3 py-2 text-right text-white">{pos.size}</td>
                    <td className="px-3 py-2 text-right text-[#666]">{formatPrice(pos.entryPrice)}</td>
                    <td className="px-3 py-2 text-right text-white">{formatPrice(pos.markPrice)}</td>
                    <td className="px-3 py-2 text-right text-[#666]">{pos.leverage}x</td>
                    <td className={cn('px-3 py-2 text-right', pos.unrealizedPnl >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {formatUsd(pos.unrealizedPnl)} ({formatPercent(pos.unrealizedPnlPercent)})
                    </td>
                    <td className="px-3 py-2 text-right text-[#ff3344]">{formatPrice(pos.liquidationPrice)}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-[#666] hover:text-white transition-colors">Close</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'orders' && (
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-3 py-2 font-normal">Market</th>
                <th className="px-3 py-2 font-normal">Side</th>
                <th className="px-3 py-2 font-normal">Type</th>
                <th className="px-3 py-2 font-normal text-right">Size</th>
                <th className="px-3 py-2 font-normal text-right">Price</th>
                <th className="px-3 py-2 font-normal text-right">Lev</th>
                <th className="px-3 py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter(o => o.status === 'open').length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#444]">
                    No pending orders
                  </td>
                </tr>
              ) : (
                orders.filter(o => o.status === 'open').map((order) => (
                  <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-white">{order.symbol}</td>
                    <td className={cn('px-3 py-2 uppercase', order.side === 'long' ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {order.side}
                    </td>
                    <td className="px-3 py-2 text-[#666] uppercase">{order.type}</td>
                    <td className="px-3 py-2 text-right text-white">{order.size}</td>
                    <td className="px-3 py-2 text-right text-white">{formatPrice(order.price)}</td>
                    <td className="px-3 py-2 text-right text-[#666]">{order.leverage}x</td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-[#ff3344] hover:text-[#ff5566] transition-colors">Cancel</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'history' && (
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-[#666] text-left border-b border-white/[0.06]">
                <th className="px-3 py-2 font-normal">Market</th>
                <th className="px-3 py-2 font-normal">Side</th>
                <th className="px-3 py-2 font-normal text-right">Size</th>
                <th className="px-3 py-2 font-normal text-right">Price</th>
                <th className="px-3 py-2 font-normal text-right">Fee</th>
                <th className="px-3 py-2 font-normal text-right">PnL</th>
                <th className="px-3 py-2 font-normal text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#444]">
                    No trades yet
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-white">{trade.symbol}</td>
                    <td className={cn('px-3 py-2 uppercase', trade.side === 'long' ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {trade.side}
                    </td>
                    <td className="px-3 py-2 text-right text-white">{trade.size}</td>
                    <td className="px-3 py-2 text-right text-white">{formatPrice(trade.price)}</td>
                    <td className="px-3 py-2 text-right text-[#666]">${trade.fee.toFixed(2)}</td>
                    <td className={cn('px-3 py-2 text-right', (trade.pnl ?? 0) >= 0 ? 'text-[#00ff88]' : 'text-[#ff3344]')}>
                      {trade.pnl !== undefined ? formatUsd(trade.pnl) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-[#666]">
                      {new Date(trade.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
