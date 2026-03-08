'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import Footer from '@/components/Footer';

export default function MyMarketsPage() {
  const { connected } = useAppStore();

  // Real "my markets" would be filtered by creator === connected wallet
  // For now, show empty state since no markets have been created

  if (!connected) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#444] font-mono text-sm">Connect your wallet to view your markets</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <h1 className="text-xl font-mono font-bold mb-8">My Markets</h1>

        {/* Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Markets Created</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">0</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">—</div>
          </div>
          <div className="border border-white/[0.06] bg-[#080808] p-4">
            <div className="text-[10px] text-[#666] uppercase tracking-wider">Total Volume</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">—</div>
          </div>
        </div>

        {/* Empty state */}
        <div className="border border-white/[0.06] py-16 text-center">
          <p className="text-[#444] font-mono text-sm mb-4">You haven&apos;t created any markets yet</p>
          <Link
            href="/launch"
            className="inline-block bg-white text-black px-6 py-2 text-sm font-mono font-bold hover:bg-[#e0e0e0] transition-colors"
          >
            Launch Market →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
