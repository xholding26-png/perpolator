'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState, useRef } from 'react';
import { cn, shortenAddress } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const NAV_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/launch', label: 'Launch' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/stake', label: 'Stake' },
  { href: '/docs', label: 'Docs' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="h-12 border-b border-white/[0.06] flex items-center px-4 md:px-6 justify-between sticky top-0 z-50 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#666] hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              {mobileOpen ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              )}
            </svg>
          </button>
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
        <div className="flex items-center gap-2 md:gap-3">
          <NetworkSelector />
          <ConnectButton />
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-12 bottom-0 bg-black/95 backdrop-blur-sm z-40 border-t border-white/[0.06]">
          <div className="flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors',
                  pathname === link.href || pathname?.startsWith(link.href + '/')
                    ? 'text-white bg-white/[0.04]'
                    : 'text-[#666] hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function NetworkSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs border border-white/[0.06] px-3 py-1.5 hover:bg-white/[0.04] transition-colors font-mono"
      >
        <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse" />
        <span className="text-white">Devnet</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1">
          <path d="M1 1L5 5L9 1" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 border border-white/[0.06] bg-[#0b0b0e] z-50 shadow-xl">
          <button
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono text-white bg-white/[0.04]"
            onClick={() => setOpen(false)}
          >
            <span className="w-2 h-2 rounded-full bg-[#0ecb81]" />
            Devnet
            <span className="ml-auto text-[#0ecb81]">✓</span>
          </button>
          <button
            disabled
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono text-[#444] cursor-not-allowed"
          >
            <span className="w-2 h-2 rounded-full bg-[#333]" />
            Mainnet
            <span className="ml-auto text-[10px] text-[#444]">Soon</span>
          </button>
        </div>
      )}
    </div>
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
