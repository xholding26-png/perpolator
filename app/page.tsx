'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TickerStrip from '@/components/TickerStrip';
import Footer from '@/components/Footer';

export default function Home() {
  const [stats, setStats] = useState({ marketsLive: 0, totalVolume: '—', totalTraders: '—' });

  useEffect(() => {
    // Fetch real market count from on-chain
    fetch('/api/markets')
      .then((r) => r.json())
      .then((data) => {
        setStats((prev) => ({ ...prev, marketsLive: data.count || 0 }));
      })
      .catch(() => {});

    // Future: fetch volume/traders from Supabase
    // For now, show dashes since no real data exists yet
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-48px)]">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center grid-bg">
        <div className="text-center px-6 py-20">
          <h1 className="text-5xl md:text-7xl font-mono font-bold tracking-tight text-white leading-none">
            PERMISSIONLESS
            <br />
            PERPS
          </h1>
          <p className="mt-6 text-[#666] text-lg max-w-xl mx-auto">
            Launch a leveraged trading market for any Solana token in 60 seconds.
          </p>
          <Link
            href="/launch"
            className="inline-block mt-8 bg-white text-black px-8 py-3 text-sm font-mono font-bold tracking-wider hover:bg-[#e0e0e0] transition-colors"
          >
            Launch Market →
          </Link>
        </div>
      </div>

      {/* Ticker */}
      <TickerStrip />

      {/* Stats */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-white/[0.06]">
          <div className="py-8 text-center">
            <div className="text-3xl font-mono font-bold text-white">
              {stats.marketsLive}
            </div>
            <div className="text-xs text-[#666] uppercase tracking-wider mt-1">
              Markets Live
            </div>
          </div>
          <div className="py-8 text-center">
            <div className="text-3xl font-mono font-bold text-white">
              {stats.totalVolume}
            </div>
            <div className="text-xs text-[#666] uppercase tracking-wider mt-1">
              Total Volume
            </div>
          </div>
          <div className="py-8 text-center">
            <div className="text-3xl font-mono font-bold text-white">
              {stats.totalTraders}
            </div>
            <div className="text-xs text-[#666] uppercase tracking-wider mt-1">
              Total Traders
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="border-b border-white/[0.06] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-mono font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-mono text-white font-bold mb-2">1. Pick Any Token</h3>
              <p className="text-sm text-[#666]">
                Any SPL token with on-chain liquidity. PumpSwap, Raydium, Meteora — we read the price directly from DEX pools.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-mono text-white font-bold mb-2">2. Launch Market</h3>
              <p className="text-sm text-[#666]">
                Set leverage, fees, and deposit seed liquidity. Your market goes live instantly with vAMM auto-liquidity.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-mono text-white font-bold mb-2">3. Trade Perps</h3>
              <p className="text-sm text-[#666]">
                Up to 20x leverage. Coin-margined. Keeper bots handle funding, liquidations, and oracle updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-b border-white/[0.06] py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['Permissionless', 'Anyone can launch'],
            ['DEX Oracle', 'No Pyth needed'],
            ['vAMM', 'Auto liquidity'],
            ['On-chain', 'Fully verifiable'],
          ].map(([title, sub]) => (
            <div key={title} className="border border-white/[0.06] p-4">
              <div className="font-mono text-white font-bold text-sm">{title}</div>
              <div className="text-[11px] text-[#666] mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
