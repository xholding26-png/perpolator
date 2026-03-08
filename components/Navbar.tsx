'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { cn, shortenAddress } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const NAV_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/launch', label: 'Launch' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/stake', label: 'Stake' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-12 border-b border-white/[0.06] flex items-center px-6 justify-between sticky top-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-mono text-sm font-bold tracking-[0.2em] text-white">
          PERPOLATOR
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-xs uppercase tracking-wider transition-colors',
                pathname === link.href || pathname?.startsWith(link.href + '/')
                  ? 'text-white'
                  : 'text-[#666] hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <ConnectButton />
    </nav>
  );
}

function ConnectButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { setWallet, balance } = useAppStore();

  // Fetch real SOL balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        try {
          const bal = await connection.getBalance(publicKey);
          setWallet(true, publicKey.toBase58(), bal / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error('Balance fetch error:', err);
          setWallet(true, publicKey.toBase58(), 0);
        }
      };
      fetchBalance();
      const interval = setInterval(fetchBalance, 15000);
      return () => clearInterval(interval);
    } else {
      setWallet(false, null, 0);
    }
  }, [connected, publicKey, connection, setWallet]);

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-[#666]">
          {balance.toFixed(3)} SOL
        </span>
        <button
          onClick={disconnect}
          className="text-xs border border-white/[0.06] px-4 py-1.5 hover:bg-white/[0.04] transition-colors font-mono text-white"
        >
          {shortenAddress(publicKey.toBase58())}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="text-xs border border-white/[0.06] px-4 py-1.5 hover:bg-white/[0.04] transition-colors font-mono"
    >
      Connect Wallet
    </button>
  );
}
