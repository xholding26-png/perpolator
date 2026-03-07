'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  return (
    <button className="text-xs border border-white/[0.06] px-4 py-1.5 hover:bg-white/[0.04] transition-colors font-mono">
      Connect Wallet
    </button>
  );
}
