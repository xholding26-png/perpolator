'use client';

import { useEffect, useRef } from 'react';
import { Market } from '@/lib/types';

// Generate mock candlestick data
function generateCandleData(basePrice: number, count: number) {
  const data = [];
  let price = basePrice * 0.9;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.02;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;

    data.push({
      time: now - i * 3600,
      open,
      high,
      low,
      close,
    });

    price = close;
  }

  return data;
}

export default function TradingChart({ market }: { market: Market }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    import('lightweight-charts').then(({ createChart, ColorType }) => {
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

      const data = generateCandleData(market.price, 200);
      // @ts-expect-error lightweight-charts v5 data format
      series.setData(data);
      chart.timeScale().fitContent();

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
      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    });

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [market]);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
}
