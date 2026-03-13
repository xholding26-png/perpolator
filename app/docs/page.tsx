'use client';

import Footer from '@/components/Footer';

const sections = [
  {
    title: 'What is Perpolator?',
    content: `Perpolator is a permissionless perpetual futures protocol on Solana. Anyone can launch a leveraged trading market for any SPL token — no listing fees, no governance, no middlemen. Think "Pump.fun for Perps".`,
  },
  {
    title: 'How It Works',
    content: `1. Pick any Solana token with on-chain liquidity (PumpSwap, Raydium, Meteora)\n2. Set your parameters: leverage (up to 20x), trading fees, and seed liquidity\n3. Deploy — your market goes live on-chain in ~30 seconds\n4. Share the link — anyone with a wallet can trade long or short\n5. The vAMM provides automatic initial liquidity via a constant-product curve`,
  },
  {
    title: 'Coin-Margined',
    content: `Traders deposit the same token they're trading as collateral. Trading a BONK perp? You deposit BONK. PnL is settled in BONK. No USDC dependency.`,
  },
  {
    title: 'Oracles',
    content: `Perpolator supports three oracle sources:\n\n• DEX Oracle (permissionless) — reads prices directly from PumpSwap, Raydium CLMM, and Meteora DLMM pools\n• Pyth V2 — institutional-grade price feeds\n• Authority Push — manual price updates for custom markets`,
  },
  {
    title: 'vAMM',
    content: `Every market launches with a virtual AMM (vAMM) that provides automatic liquidity using a constant-product x*y=k curve. Features:\n\n• 0.3% swap fee (configurable)\n• Circuit breaker (max 5% price impact per trade)\n• Auto-recenter to oracle price (keeper-driven)\n• No impermanent loss — it's virtual liquidity`,
  },
  {
    title: 'Insurance Fund',
    content: `Each market has an insurance fund that collects liquidation fees and protects against bad debt. Anyone can deposit into the insurance fund and receive LP tokens proportional to their share.`,
  },
  {
    title: 'Fee Structure',
    content: `Trading fees are split three ways: 82% to the LP vault (insurance/liquidity), 10% to the protocol, and 8% to the market creator. Fees are accumulated and distributed via a permissionless crank.`,
  },
  {
    title: 'Keeper Network',
    content: `Keepers are permissionless bots that maintain the protocol:\n\n• Crank funding rates every slot\n• Push oracle prices from DEX pools\n• Scan and execute liquidations\n• Recenter vAMM to oracle price\n• Distribute accumulated fees`,
  },
  {
    title: 'For Market Creators',
    content: `As a market creator, you earn 8% of all trading fees generated on your market — forever. Launch a market for a trending token, share the link, and earn passive income from every trade.`,
  },
  {
    title: 'Technical Details',
    content: `• Program: Raw Solana BPF (no Anchor) — 38 instructions\n• Risk Engine: Percolator by Anatoly Yakovenko (Apache 2.0)\n• Architecture: Slab-based (1 account = 1 market)\n• Max leverage: Configurable up to 20x\n• Margin: Initial (5%) + Maintenance (1%) defaults\n• Funding: Continuous, proportional to OI skew`,
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-mono font-bold text-white mb-2">Documentation</h1>
        <p className="text-[#666] text-sm mb-12 font-mono">Everything you need to know about Perpolator.</p>

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-mono font-bold text-white mb-3">{s.title}</h2>
              <div className="text-sm text-[#999] leading-relaxed whitespace-pre-line">{s.content}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
