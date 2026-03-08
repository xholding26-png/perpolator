'use client';

import { useEffect, useRef, useState } from 'react';
import { Market } from '@/lib/types';

// Map known token mints to CoinGecko IDs
const MINT_TO_COINGECKO: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'solana',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'dogwifhat',
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': 'jito-governance-token',
};

export default function TradingChart({ market }: { market: Market }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const coinId = MINT_TO_COINGECKO[market.mint] || null;

    const loadChart = async () => {
      const { createChart, ColorType } = await import('lightweight-charts');
      if (!mounted || !containerRef.current) return;

      // Clear previous chart
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#000000' },
          textColor: '#666',
          fontSize: 11,
          fontFamily: 'monospace',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: {
          vertLine: { color: 'rgba(255,255,255,0.1)', width: 1 },
          horzLine: { color: 'rgba(255,255,255,0.1)', width: 1 },
        },
        rightPriceScale: {
          borderColor: 'rgba(255,255,255,0.06)',
        },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.06)',
          timeVisible: true,
        },
      });

      chartRef.current = chart;

      if (coinId) {
        try {
          const res = await fetch(`/api/candles?coinId=${coinId}&days=7`);
          if (!res.ok) throw new Error();
          const ohlcData = await res.json();

          if (!mounted || !Array.isArray(ohlcData) || ohlcData.length === 0) {
            setError(true);
            setLoading(false);
            return;
          }

          const series = chart.addSeries(
            // @ts-expect-error lightweight-charts v5 API
            0, // CandlestickSeries
            {
              upColor: '#00ff88',
              downColor: '#ff3344',
              borderUpColor: '#00ff88',
              borderDownColor: '#ff3344',
              wickUpColor: '#00ff88',
              wickDownColor: '#ff3344',
            }
          );

          // CoinGecko OHLC format: [timestamp, open, high, low, close]
          const candleData = ohlcData.map((d: number[]) => ({
            time: Math.floor(d[0] / 1000),
            open: d[1],
            high: d[2],
            low: d[3],
            close: d[4],
          }));

          // @ts-expect-error lightweight-charts v5 data format
          series.setData(candleData);
          chart.timeScale().fitContent();
          setLoading(false);
        } catch {
          setError(true);
          setLoading(false);
        }
      } else {
        // Unknown token — no chart data available
        setError(true);
        setLoading(false);
      }

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      };

      const observer = new ResizeObserver(handleResize);
      if (containerRef.current) observer.observe(containerRef.current);

      return () => observer.disconnect();
    };

    loadChart();

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [market]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#444] font-mono text-sm">Loading chart...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#444] font-mono text-sm">No chart data available for this token</span>
        </div>
      )}
    </div>
  );
}
