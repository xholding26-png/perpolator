'use client';

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { cn } from '@/lib/utils';
import { PROGRAM_ID, RPC_URL } from '@/lib/solana';
import Footer from '@/components/Footer';

const HEADER_LEN = 64;
const MAGIC = 0x54414c4f50524550n;

interface Market {
  slab: string;
  admin: string;
  creator: string;
  mint: string;
  oracle: number;
  flags: number;
  paused: boolean;
  resolved: boolean;
  nonce: number;
  size: number;
  creatorBps: number;
  protocolBps: number;
}

function parseSlab(pubkey: string, data: Buffer): Market {
  const flags = data[13];
  return {
    slab: pubkey,
    admin: new PublicKey(data.subarray(16, 48)).toBase58(),
    creator: new PublicKey(data.subarray(HEADER_LEN + 232, HEADER_LEN + 264)).toBase58(),
    mint: new PublicKey(data.subarray(HEADER_LEN, HEADER_LEN + 32)).toBase58(),
    oracle: Number(data.readBigUInt64LE(HEADER_LEN + 152)) / 1e6,
    flags,
    paused: (flags & 0x02) !== 0,
    resolved: (flags & 0x04) !== 0,
    nonce: Number(data.readBigUInt64LE(48)),
    size: data.length,
    creatorBps: data.readUInt16LE(HEADER_LEN + 296),
    protocolBps: data.readUInt16LE(HEADER_LEN + 298),
  };
}

function encU8(n: number): Buffer { const b = Buffer.alloc(1); b.writeUInt8(n); return b; }

export default function AdminPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const phantom = (window as any)?.solana;
    if (phantom?.isPhantom) {
      phantom.connect({ onlyIfTrusted: true })
        .then(() => setWallet(phantom.publicKey?.toBase58()))
        .catch(() => {});
    }
  }, []);

  const loadMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const conn = new Connection(RPC_URL, 'confirmed');
      const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
        dataSlice: { offset: 0, length: 8 },
      });
      
      const validSlabs = accounts.filter(a => {
        try { return (a.account.data as Buffer).readBigUInt64LE(0) === MAGIC; } catch { return false; }
      });

      const fullMarkets: Market[] = [];
      for (const s of validSlabs) {
        const info = await conn.getAccountInfo(s.pubkey);
        if (info) fullMarkets.push(parseSlab(s.pubkey.toBase58(), info.data as Buffer));
      }
      setMarkets(fullMarkets);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadMarkets(); }, [loadMarkets]);

  const sendTx = async (tag: number, slab: string) => {
    const phantom = (window as any)?.solana;
    if (!phantom?.isPhantom) { setStatus('Connect Phantom'); return; }
    
    try {
      await phantom.connect();
      const conn = new Connection(RPC_URL, 'confirmed');
      const ix = new TransactionInstruction({
        keys: [
          { pubkey: phantom.publicKey, isSigner: true, isWritable: false },
          { pubkey: new PublicKey(slab), isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([tag]),
      });
      const { blockhash } = await conn.getLatestBlockhash();
      const tx = new Transaction().add(ix);
      tx.recentBlockhash = blockhash;
      tx.feePayer = phantom.publicKey;
      const signed = await phantom.signTransaction(tx);
      const sig = await conn.sendRawTransaction(signed.serialize());
      await conn.confirmTransaction(sig, 'confirmed');
      setStatus(`✅ ${sig.slice(0, 16)}...`);
      loadMarkets();
    } catch (e: any) {
      setStatus(`❌ ${e.message?.slice(0, 80)}`);
    }
  };

  // Filter: only show markets where connected wallet is admin
  const adminMarkets = wallet ? markets.filter(m => m.admin === wallet) : [];

  // If no wallet or not admin of any market → show nothing useful
  if (!wallet) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#666] font-mono text-sm">Connect your wallet to access admin controls.</div>
            <button
              onClick={async () => {
                const phantom = (window as any)?.solana;
                if (phantom) { await phantom.connect(); setWallet(phantom.publicKey?.toBase58()); }
              }}
              className="mt-4 text-xs font-mono bg-white/[0.06] px-4 py-2 text-white hover:bg-white/[0.12]"
            >
              Connect Wallet
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!loading && adminMarkets.length === 0) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#666] font-mono text-sm">No markets found for this wallet.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-mono font-bold text-white">Admin Panel</h1>
          <div className="flex items-center gap-4">
            {wallet ? (
              <span className="text-xs font-mono text-[#666]">{wallet.slice(0, 4)}...{wallet.slice(-4)}</span>
            ) : (
              <button
                onClick={async () => {
                  const phantom = (window as any)?.solana;
                  if (phantom) {
                    await phantom.connect();
                    setWallet(phantom.publicKey?.toBase58());
                  }
                }}
                className="text-xs font-mono bg-white/[0.06] px-3 py-1.5 text-white hover:bg-white/[0.12]"
              >
                Connect
              </button>
            )}
            <button onClick={loadMarkets} className="text-xs font-mono bg-white/[0.06] px-3 py-1.5 text-white hover:bg-white/[0.12]">
              Refresh
            </button>
          </div>
        </div>

        {status && (
          <div className="mb-4 text-xs font-mono text-[#888] break-all border border-white/[0.06] p-3">
            {status}
          </div>
        )}

        {loading ? (
          <div className="text-center text-[#666] py-20 font-mono">Loading markets...</div>
        ) : adminMarkets.length === 0 ? (
          <div className="text-center text-[#666] py-20 font-mono">No markets found for this wallet</div>
        ) : (
          <div className="space-y-4">
            {adminMarkets.map((m) => {
              const isAdmin = true; // already filtered
              return (
                <div key={m.slab} className="border border-white/[0.06] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-mono text-white text-sm font-bold">
                        {m.mint.slice(0, 8)}...
                      </div>
                      <div className="text-[11px] text-[#666] font-mono mt-1">
                        Slab: {m.slab.slice(0, 12)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.paused && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 font-mono">PAUSED</span>}
                      {m.resolved && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 font-mono">RESOLVED</span>}
                      {!m.paused && !m.resolved && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 font-mono">ACTIVE</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs font-mono">
                    <div>
                      <span className="text-[#666]">Price:</span>{' '}
                      <span className="text-white">${m.oracle.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#666]">Nonce:</span>{' '}
                      <span className="text-white">{m.nonce}</span>
                    </div>
                    <div>
                      <span className="text-[#666]">Fee Split:</span>{' '}
                      <span className="text-white">{m.creatorBps / 100}% / {m.protocolBps / 100}%</span>
                    </div>
                    <div>
                      <span className="text-[#666]">Size:</span>{' '}
                      <span className="text-white">{(m.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#444] mb-3">
                    Admin: {m.admin} | Creator: {m.creator}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 flex-wrap">
                      {!m.paused ? (
                        <button onClick={() => sendTx(23, m.slab)} className="text-[11px] font-mono bg-yellow-500/20 text-yellow-400 px-3 py-1 hover:bg-yellow-500/30">
                          Pause
                        </button>
                      ) : (
                        <button onClick={() => sendTx(24, m.slab)} className="text-[11px] font-mono bg-green-500/20 text-green-400 px-3 py-1 hover:bg-green-500/30">
                          Unpause
                        </button>
                      )}
                      {!m.resolved && (
                        <button onClick={() => sendTx(25, m.slab)} className="text-[11px] font-mono bg-orange-500/20 text-orange-400 px-3 py-1 hover:bg-orange-500/30">
                          Resolve
                        </button>
                      )}
                      {m.resolved && (
                        <>
                          <button onClick={() => sendTx(26, m.slab)} className="text-[11px] font-mono bg-blue-500/20 text-blue-400 px-3 py-1 hover:bg-blue-500/30">
                            Unresolve
                          </button>
                          <button onClick={() => sendTx(27, m.slab)} className="text-[11px] font-mono bg-red-500/20 text-red-400 px-3 py-1 hover:bg-red-500/30">
                            Close & Reclaim
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!isAdmin && wallet && (
                    <div className="text-[10px] font-mono text-[#444]">Not admin of this market</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
