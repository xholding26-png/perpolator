'use client';

import { useEffect, useRef, useState } from 'react';
import { Market } from '@/lib/types';

declare global {
  interface Window {
    TradingView: any;
  }
}

/* ── Price formatting ── */
function getPricescale(price: number): number {
  if (price >= 1000) return 100;
  if (price >= 10) return 10000;
  if (price >= 1) return 100000;
  if (price >= 0.01) return 10000000;
  if (price >= 0.0001) return 1000000000;
  return 100000000000;
}

/* ── GeckoTerminal Datafeed ── */
function createDatafeed(mint: string, symbolName: string, initialPrice: number) {
  const pricescale = getPricescale(initialPrice);
  let subInterval: ReturnType<typeof setInterval> | null = null;

  return {
    onReady: (callback: (config: any) => void) => {
      setTimeout(() => callback({
        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '720', '1D'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [{ value: 'Perpolator', name: 'Perpolator', desc: 'Perpolator DEX' }],
      }), 0);
    },

    searchSymbols: (_input: string, _exchange: string, _type: string, onResult: Function) => {
      onResult([]);
    },

    resolveSymbol: (_name: string, onResolve: Function, _onError: Function) => {
      setTimeout(() => onResolve({
        ticker: symbolName,
        name: `${symbolName}/USD`,
        description: `${symbolName} Perpetual`,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: 'Perpolator',
        listed_exchange: 'Perpolator',
        minmov: 1,
        pricescale,
        has_intraday: true,
        has_seconds: false,
        has_daily: true,
        has_weekly_and_monthly: false,
        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '720', '1D'],
        volume_precision: 2,
        data_status: 'streaming',
        format: 'price',
      }), 0);
    },

    getBars: async (
      _symbolInfo: any,
      resolution: string,
      periodParams: any,
      onResult: Function,
      onError: Function,
    ) => {
      try {
        let tf = resolution;
        if (resolution === '1D' || resolution === 'D') tf = '1440';
        const limit = periodParams.countBack || 300;
        const res = await fetch(`/api/candles?mint=${mint}&tf=${tf}&limit=${Math.min(limit, 500)}`);
        const data = await res.json();
        if (!data.candles?.length) { onResult([], { noData: true }); return; }
        const bars = data.candles
          .filter((c: any) => c.time >= periodParams.from && c.time <= periodParams.to)
          .map((c: any) => ({ time: c.time * 1000, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume || 0 }));
        onResult(bars, { noData: bars.length === 0 });
      } catch (e: any) { onError(e?.message || 'error'); }
    },

    subscribeBars: (_info: any, _res: string, onTick: Function, _guid: string, _onReset: Function) => {
      subInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/candles?mint=${mint}&tf=1&limit=1`);
          const data = await res.json();
          if (data.candles?.length) {
            const c = data.candles[data.candles.length - 1];
            onTick({ time: c.time * 1000, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume || 0 });
          }
        } catch {}
      }, 10000);
    },

    unsubscribeBars: (_guid: string) => {
      if (subInterval) clearInterval(subInterval);
    },
  };
}

/* ── Component ── */
export default function TradingChart({ market }: { market: Market }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !market.mint) return;
    let mounted = true;

    const init = async () => {
      // Load TradingView library from CDN (loads chunks from same origin = no CORS)
      if (!window.TradingView?.widget) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[data-tv-lib]');
          if (existing) { 
            // Already loading, wait for it
            const check = setInterval(() => {
              if (window.TradingView?.widget) { clearInterval(check); resolve(); }
            }, 100);
            setTimeout(() => { clearInterval(check); reject('timeout'); }, 15000);
            return;
          }
          const s = document.createElement('script');
          s.src = '/charting_library/charting_library.standalone.js';
          s.setAttribute('data-tv-lib', '1');
          s.onload = () => {
            const check = setInterval(() => {
              if (window.TradingView?.widget) { clearInterval(check); resolve(); }
            }, 100);
            setTimeout(() => { clearInterval(check); reject('timeout'); }, 15000);
          };
          s.onerror = () => reject('load error');
          document.head.appendChild(s);
        });
      }

      if (!mounted || !containerRef.current || !window.TradingView?.widget) return;

      // Cleanup previous widget
      if (widgetRef.current) {
        try { widgetRef.current.remove(); } catch {}
        widgetRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = '';
      }

      const symbolName = market.symbol?.replace('-PERP', '') || 'TOKEN';

      const widget = new window.TradingView.widget({
        container: containerRef.current,
        // CRITICAL: library_path points to CDN so chunks load from CDN origin
        library_path: '/charting_library/',
        datafeed: createDatafeed(market.mint, symbolName, market.price),
        symbol: symbolName,
        interval: '5',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: 1,
        locale: 'en',
        autosize: true,
        toolbar_bg: '#0b0b0e',
        hide_top_toolbar: false,
        hide_side_toolbar: false,

        disabled_features: [
          'header_symbol_search',
          'symbol_search_hot_key',
          'header_compare',
          'display_market_status',
        ],
        enabled_features: [
          'move_logo_to_main_pane',
          'side_toolbar_in_fullscreen_mode',
          'header_in_fullscreen_mode',
          'items_favoriting',
        ],

        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#0ecb81',
          'mainSeriesProperties.candleStyle.downColor': '#f6465d',
          'mainSeriesProperties.candleStyle.borderUpColor': '#0ecb81',
          'mainSeriesProperties.candleStyle.borderDownColor': '#f6465d',
          'mainSeriesProperties.candleStyle.wickUpColor': '#0ecb81',
          'mainSeriesProperties.candleStyle.wickDownColor': '#f6465d',
          'paneProperties.background': '#0b0b0e',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.vertGridProperties.color': 'rgba(255,255,255,0.02)',
          'paneProperties.horzGridProperties.color': 'rgba(255,255,255,0.02)',
          'scalesProperties.textColor': '#4a4a5a',
          'scalesProperties.lineColor': 'rgba(255,255,255,0.04)',
        },

        loading_screen: { backgroundColor: '#0b0b0e', foregroundColor: '#0ecb81' },
      });

      widgetRef.current = widget;

      widget.onChartReady(() => {
        setLoading(false);
        // Add volume by default
        try {
          widget.activeChart().createStudy('Volume', false, false);
        } catch {}
      });
    };

    init().catch((e) => {
      console.error('TradingView init error:', e);
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (widgetRef.current) {
        try { widgetRef.current.remove(); } catch {}
        widgetRef.current = null;
      }
    };
  }, [market.mint, market.symbol, market.price]);

  return (
    <div className="w-full h-full min-h-[400px] relative bg-[#0b0b0e]">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-5 h-5 border-2 border-[#0ecb81]/30 border-t-[#0ecb81] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
