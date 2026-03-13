'use client';

import Link from 'next/link';
import { useState } from 'react';

// Set this when the token is launched — replace with actual CA
const TOKEN_CA: string = '';
const TOKEN_TICKER: string = '$PERP';

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const shortCA = TOKEN_CA ? `${TOKEN_CA.slice(0, 6)}...${TOKEN_CA.slice(-4)}` : '';

  const copyCA = () => {
    if (!TOKEN_CA) return;
    navigator.clipboard.writeText(TOKEN_CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-white/[0.06] py-5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#666]">
        {/* Left — branding */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-white text-sm tracking-[0.15em]">PERPOLATOR</span>
          <span className="text-[#444]">/</span>
          <span className="font-mono text-[#555]">perpetual futures engine</span>
        </div>

        {/* Center — CA + socials */}
        <div className="flex items-center gap-4">
          {TOKEN_CA ? (
            <>
              <button
                onClick={copyCA}
                className="flex items-center gap-2 font-mono text-[#555] hover:text-white transition-colors"
              >
                <span>{shortCA}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#444]">
                  {copied ? 'copied!' : 'copy'}
                </span>
              </button>
              <span className="text-[#333]">|</span>
            </>
          ) : (
            <>
              <span className="font-mono text-white font-bold text-sm">{TOKEN_TICKER}</span>
              <span className="text-[#333]">|</span>
            </>
          )}
          <div className="flex items-center gap-3">
            <Link
              href="https://x.com/perpolator"
              target="_blank"
              rel="noopener"
              className="hover:text-white transition-colors"
              title="X / Twitter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Right — powered by */}
        <div className="flex items-center gap-2">
          <span className="text-[#444]">powered by</span>
          <span className="font-mono text-[#555]">solana</span>
        </div>
      </div>
    </footer>
  );
}
