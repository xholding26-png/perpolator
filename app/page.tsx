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

      {/* Features */}
      <div className="border-b border-white/[0.06] py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['Permissionless', 'Anyone can launch'],
            ['8% Creator Fee', 'Earn on every trade'],
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
