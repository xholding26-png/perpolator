'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Market } from '@/lib/types';
import { formatPrice, formatUsd, formatPercent, cn } from '@/lib/utils';

export default function Home() {
  const [stats, setStats] = useState({ marketsLive: 0, totalVolume: 0, totalTraders: 0 });
  const [topMarkets, setTopMarkets] = useState<Market[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/markets')
      .then((r) => r.json())
      .then((data) => {
        const markets = data.markets || [];
        setStats({
          marketsLive: data.count || 0,
          totalVolume: markets.reduce((a: number, m: Market) => a + (m.volume24h || 0), 0),
          totalTraders: markets.reduce((a: number, m: Market) => a + (m.traders || 0), 0),
        });
        setTopMarkets(markets.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  // Terminal boot sequence
  useEffect(() => {
    const lines = [
      '> initializing perpolator v2...',
      '> connecting to solana devnet...',
      '> loading vAMM engine...',
      '> oracle feeds: DEX | Pyth | Authority',
      '> max leverage: 20x',
      '> fee split: 82% LP / 10% protocol / 8% creator',
      '> status: OPERATIONAL',
      '> awaiting trades...',
    ];
    let i = 0;
    let cancelled = false;
    setTerminalLines([]);
    const interval = setInterval(() => {
      if (cancelled) return;
      if (i < lines.length) {
        setTerminalLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 120);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-48px)]">
      {/* Hero — Terminal Style */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl w-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left — headline */}
            <div>
              <div className="text-[10px] text-[#0ecb81] font-mono uppercase tracking-[0.3em] mb-4">
                Permissionless Perpetual Futures
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight text-white leading-[1.1]">
                Any token.
                <br />
                <span className="text-[#0ecb81]">Any leverage.</span>
                <br />
                No permission.
              </h1>
              <p className="mt-6 text-[#666] text-sm md:text-base max-w-md leading-relaxed">
                Launch a leveraged trading market for any Solana token in 60 seconds. Up to 20x. Coin-margined. Fully on-chain.
              </p>
              <div className="flex gap-3 mt-8">
                <Link
                  href="/launch"
                  className="bg-white text-black px-6 py-2.5 text-sm font-mono font-bold tracking-wider hover:bg-[#e0e0e0] transition-colors"
                >
                  Launch Market →
                </Link>
                <Link
                  href="/markets"
                  className="border border-white/[0.12] px-6 py-2.5 text-sm font-mono text-[#999] hover:text-white hover:border-white/30 transition-colors"
                >
                  Browse Markets
                </Link>
              </div>
            </div>

            {/* Right — terminal */}
            <div className="border border-white/[0.08] bg-[#060608]">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="text-[10px] text-[#444] font-mono ml-2">perpolator — engine</span>
              </div>
              <div className="p-4 h-56 overflow-hidden font-mono text-xs leading-relaxed">
                {terminalLines.filter(Boolean).map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      'transition-opacity duration-300',
                      line.includes('OPERATIONAL') ? 'text-[#0ecb81]' : 'text-[#555]'
                    )}
                  >
                    {line}
                  </div>
                ))}
                <span className="inline-block w-2 h-4 bg-[#0ecb81] animate-pulse ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/[0.06]">
          <div className="py-6 text-center">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white">
              {stats.marketsLive}
            </div>
            <div className="text-[10px] text-[#555] uppercase tracking-wider mt-1">
              Markets Live
            </div>
          </div>
          <div className="py-6 text-center">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white">
              {stats.totalVolume > 0 ? formatUsd(stats.totalVolume) : '—'}
            </div>
            <div className="text-[10px] text-[#555] uppercase tracking-wider mt-1">
              24h Volume
            </div>
          </div>
          <div className="py-6 text-center">
            <div className="text-2xl md:text-3xl font-mono font-bold text-white">
              20x
            </div>
            <div className="text-[10px] text-[#555] uppercase tracking-wider mt-1">
              Max Leverage
            </div>
          </div>
        </div>
      </div>

      {/* Live Markets Preview */}
      {topMarkets.length > 0 && (
        <div className="border-b border-white/[0.06] py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs text-[#666] uppercase tracking-wider font-mono">Live Markets</h2>
              <Link href="/markets" className="text-[10px] text-[#555] hover:text-white font-mono transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              {topMarkets.map((m) => (
                <Link
                  key={m.id}
                  href={`/trade/${m.id}`}
                  className="flex items-center justify-between py-2.5 px-3 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {m.image ? (
                      <img src={m.image} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-mono text-[#555]">
                        {m.symbol.split('-')[0].slice(0, 3)}
                      </div>
                    )}
                    <span className="font-mono text-sm text-white">{m.symbol}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs font-mono">
                    <span className="text-white">{m.price > 0 ? formatPrice(m.price) : '—'}</span>
                    <span className={cn(
                      'w-16 text-right',
                      m.change24h >= 0 ? 'text-[#0ecb81]' : 'text-[#ff3344]'
                    )}>
                      {m.change24h !== 0 ? formatPercent(m.change24h) : '—'}
                    </span>
                    <span className="text-[#555] hidden sm:block w-20 text-right">
                      {m.volume24h > 0 ? formatUsd(m.volume24h) : '—'}
                    </span>
                    <span className="text-[#444] opacity-0 group-hover:opacity-100 transition-opacity">
                      Trade →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="py-16 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xs text-[#666] uppercase tracking-wider font-mono mb-8 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Pick a token',
                desc: 'Any SPL token with on-chain liquidity. SOL, memecoins, anything.',
              },
              {
                step: '02',
                title: 'Configure & deploy',
                desc: 'Set leverage, fees, seed liquidity. Market goes live in ~30 seconds.',
              },
              {
                step: '03',
                title: 'Earn 8% of fees',
                desc: 'Market creators earn 8% of every trade. Forever. No cap.',
              },
            ].map((item) => (
              <div key={item.step} className="border border-white/[0.06] p-5">
                <div className="text-[#0ecb81] font-mono text-xs mb-3">{item.step}</div>
                <div className="font-mono text-white text-sm font-bold mb-2">{item.title}</div>
                <div className="text-[11px] text-[#666] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="py-16 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Permissionless', 'Anyone can launch a market'],
              ['8% Creator Fee', 'Earn on every trade, forever'],
              ['vAMM Engine', 'Automatic liquidity, no IL'],
              ['Coin-Margined', 'Trade with the token itself'],
              ['DEX Oracle', 'Real prices from PumpSwap/Raydium'],
              ['Up to 20x', 'Configurable leverage per market'],
              ['Insurance Fund', 'LP protection against bad debt'],
              ['Fully On-Chain', 'No off-chain matching engine'],
            ].map(([title, sub]) => (
              <div key={title} className="border border-white/[0.04] p-4 hover:border-white/[0.08] transition-colors">
                <div className="font-mono text-white text-xs font-bold">{title}</div>
                <div className="text-[10px] text-[#555] mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-white mb-3">
            Ready to launch?
          </h2>
          <p className="text-sm text-[#666] mb-8 max-w-md mx-auto">
            Pick a token, set your parameters, deploy. Start earning trading fees in under a minute.
          </p>
          <Link
            href="/launch"
            className="inline-block bg-white text-black px-8 py-3 text-sm font-mono font-bold tracking-wider hover:bg-[#e0e0e0] transition-colors"
          >
            Launch Market →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
