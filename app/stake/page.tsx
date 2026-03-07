'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';

export default function StakePage() {
  const [tab, setTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');

  const totalStaked = 2_450_000;
  const apy = 18.4;
  const userStaked = 1250;
  const earned = 34.56;

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-xl font-mono font-bold mb-2">Insurance LP Staking</h1>
        <p className="text-sm text-[#666] mb-8">
          Stake USDC to provide insurance liquidity and earn trading fees from all markets.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Total Staked</div>
            <div className="text-lg font-mono font-bold text-white mt-1">$2.45M</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">APY</div>
            <div className="text-lg font-mono font-bold text-[#00ff88] mt-1">{apy}%</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Your Stake</div>
            <div className="text-lg font-mono font-bold text-white mt-1">${userStaked.toLocaleString()}</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Earned</div>
            <div className="text-lg font-mono font-bold text-[#00ff88] mt-1">${earned}</div>
          </div>
        </div>

        {/* Stake/Unstake card */}
        <div className="border border-white/[0.06] bg-[#080808] max-w-md mx-auto">
          <div className="grid grid-cols-2 border-b border-white/[0.06]">
            {(['stake', 'unstake'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'py-3 text-xs uppercase tracking-wider font-mono transition-colors',
                  tab === t ? 'text-white bg-white/[0.04]' : 'text-[#666] hover:text-white'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-[10px] text-[#666] uppercase tracking-wider">
                Amount (USDC)
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20 pr-16"
                />
                <button
                  onClick={() => setAmount(tab === 'stake' ? '10000' : String(userStaked))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#666] hover:text-white font-mono border border-white/[0.06] px-2 py-1"
                >
                  MAX
                </button>
              </div>
            </div>

            {tab === 'stake' && (
              <div className="space-y-2 border-t border-white/[0.06] pt-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666]">Estimated APY</span>
                  <span className="font-mono text-[#00ff88]">{apy}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666]">Lock Period</span>
                  <span className="font-mono text-white">None</span>
                </div>
              </div>
            )}

            <button className="w-full py-3 bg-white text-black text-sm font-mono font-bold uppercase hover:bg-[#e0e0e0] transition-colors">
              {tab === 'stake' ? 'Stake USDC' : 'Unstake USDC'}
            </button>
          </div>
        </div>

        {/* Claim */}
        {earned > 0 && (
          <div className="max-w-md mx-auto mt-4 border border-white/[0.06] bg-[#080808] p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wider">Claimable Rewards</div>
              <div className="text-sm font-mono text-[#00ff88] mt-1">${earned} USDC</div>
            </div>
            <button className="px-4 py-2 border border-[#00ff88] text-[#00ff88] text-xs font-mono hover:bg-[#00ff88]/10 transition-colors">
              Claim
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
