import { useEffect, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
} from 'lightweight-charts';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://alphalensai.onrender.com';

type HistoricalBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type HistoryResponse = {
  success: boolean;
  symbol: string;
  interval: string;
  bars?: HistoricalBar[];
  error?: string;
};

type StockChartProps = {
  symbol: string;
};

function calculateSMA(
  bars: HistoricalBar[],
  period: number,
): LineData<Time>[] {
  const results: LineData<Time>[] = [];

  for (let index = period - 1; index < bars.length; index += 1) {
    const window = bars.slice(index - period + 1, index + 1);

    const average =
      window.reduce((total, bar) => total + bar.close, 0) /
      period;

    results.push({
      time: bars[index].date as Time,
      value: Number(average.toFixed(2)),
    });
  }

  return results;
}

function calculateEMA(
  bars: HistoricalBar[],
  period: number,
): LineData<Time>[] {
  if (bars.length < period) {
    return [];
  }

  const multiplier = 2 / (period + 1);

  const initialAverage =
    bars
      .slice(0, period)
      .reduce((total, bar) => total + bar.close, 0) /
    period;

  let previousEMA = initialAverage;

  const results: LineData<Time>[] = [
    {
      time: bars[period - 1].date as Time,
      value: Number(initialAverage.toFixed(2)),
    },
  ];

  for (let index = period; index < bars.length; index += 1) {
    const currentEMA =
      (bars[index].close - previousEMA) * multiplier +
      previousEMA;

    results.push({
      time: bars[index].date as Time,
      value: Number(currentEMA.toFixed(2)),
    });

    previousEMA = currentEMA;
  }

  return results;
}

export default function StockChart({
  symbol,
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const [bars, setBars] = useState<HistoricalBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        setLoading(true);
        setError('');

        const normalizedSymbol = symbol.trim().toUpperCase();

        const response = await fetch(
          `${API_BASE_URL}/history/${encodeURIComponent(
            normalizedSymbol,
          )}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Historical data request failed with status ${response.status}.`,
          );
        }

        const result =
          (await response.json()) as HistoryResponse;

        if (
          result.success !== true ||
          !Array.isArray(result.bars) ||
          result.bars.length === 0
        ) {
          throw new Error(
            result.error ||
              `No historical data was returned for ${normalizedSymbol}.`,
          );
        }

        const validBars = result.bars
          .filter(
            (bar) =>
              typeof bar.date === 'string' &&
              Number.isFinite(bar.open) &&
              Number.isFinite(bar.high) &&
              Number.isFinite(bar.low) &&
              Number.isFinite(bar.close) &&
              Number.isFinite(bar.volume),
          )
          .sort((first, second) =>
            first.date.localeCompare(second.date),
          );

        if (validBars.length === 0) {
          throw new Error(
            `No valid historical bars were returned for ${normalizedSymbol}.`,
          );
        }

        setBars(validBars);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setBars([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load chart data.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, [symbol]);

  useEffect(() => {
    const container = chartContainerRef.current;

    if (!container || bars.length === 0) {
      return;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 520,

      layout: {
        background: {
          type: ColorType.Solid,
          color: '#07111f',
        },
        textColor: '#94a3b8',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      },

      grid: {
        vertLines: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
        horzLines: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
      },

      crosshair: {
        mode: CrosshairMode.Normal,
      },

      rightPriceScale: {
        borderColor: 'rgba(148, 163, 184, 0.18)',
        scaleMargins: {
          top: 0.08,
          bottom: 0.25,
        },
      },

      timeScale: {
        borderColor: 'rgba(148, 163, 184, 0.18)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
        barSpacing: 8,
        minBarSpacing: 3,
      },

      localization: {
        priceFormatter: (price: number) =>
          `$${price.toFixed(2)}`,
      },
    });

    const candlestickSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        priceLineVisible: true,
        lastValueVisible: true,
      },
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      lastValueVisible: false,
      priceLineVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    const emaSeries = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 2,
      title: 'EMA 20',
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: false,
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      title: 'SMA 50',
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: false,
    });

    const candlestickData: CandlestickData<Time>[] =
      bars.map((bar) => ({
        time: bar.date as Time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      }));

    const volumeData: HistogramData<Time>[] = bars.map(
      (bar) => ({
        time: bar.date as Time,
        value: bar.volume,
        color:
          bar.close >= bar.open
            ? 'rgba(34, 197, 94, 0.45)'
            : 'rgba(239, 68, 68, 0.45)',
      }),
    );

    candlestickSeries.setData(candlestickData);
    volumeSeries.setData(volumeData);
    emaSeries.setData(calculateEMA(bars, 20));
    smaSeries.setData(calculateSMA(bars, 50));

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      chart.applyOptions({
        width: entry.contentRect.width,
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [bars]);

  const latestBar = bars.at(-1);
  const previousBar = bars.at(-2);

  const change =
    latestBar && previousBar
      ? latestBar.close - previousBar.close
      : null;

  const changePercent =
    change !== null && previousBar
      ? (change / previousBar.close) * 100
      : null;

  return (
    <section
      style={{
        border: '1px solid rgba(148, 163, 184, 0.14)',
        borderRadius: '20px',
        background:
          'linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(7, 17, 31, 0.98))',
        boxShadow:
          '0 24px 70px rgba(2, 8, 23, 0.28)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '20px 22px 10px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <h2
              style={{
                margin: 0,
                color: '#f8fafc',
                fontSize: '22px',
              }}
            >
              {symbol.toUpperCase()} Price Chart
            </h2>

            <span
              style={{
                padding: '5px 9px',
                borderRadius: '999px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#7dd3fc',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              1D
            </span>
          </div>

          <p
            style={{
              margin: '6px 0 0',
              color: '#64748b',
              fontSize: '13px',
            }}
          >
            Candlesticks · Volume · EMA 20 · SMA 50
          </p>
        </div>

        {latestBar && (
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                color: '#f8fafc',
                fontSize: '24px',
                fontWeight: 750,
              }}
            >
              ${latestBar.close.toFixed(2)}
            </div>

            {change !== null && changePercent !== null && (
              <div
                style={{
                  marginTop: '3px',
                  color:
                    change >= 0 ? '#4ade80' : '#f87171',
                  fontWeight: 650,
                }}
              >
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)} (
                {change >= 0 ? '+' : ''}
                {changePercent.toFixed(2)}%)
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '18px',
          flexWrap: 'wrap',
          padding: '4px 22px 14px',
          color: '#94a3b8',
          fontSize: '12px',
        }}
      >
        <span>
          <strong style={{ color: '#38bdf8' }}>—</strong>{' '}
          EMA 20
        </span>

        <span>
          <strong style={{ color: '#f59e0b' }}>—</strong>{' '}
          SMA 50
        </span>

        <span>
          <strong style={{ color: '#22c55e' }}>■</strong>{' '}
          Bullish candle
        </span>

        <span>
          <strong style={{ color: '#ef4444' }}>■</strong>{' '}
          Bearish candle
        </span>
      </div>

      {loading && (
        <div
          style={{
            height: '520px',
            display: 'grid',
            placeItems: 'center',
            color: '#94a3b8',
          }}
        >
          Loading {symbol.toUpperCase()} chart…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            height: '300px',
            display: 'grid',
            placeItems: 'center',
            padding: '30px',
            color: '#fca5a5',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            minHeight: '520px',
          }}
        />
      )}

      <div
        style={{
          padding: '9px 22px 16px',
          color: '#475569',
          fontSize: '11px',
          textAlign: 'right',
        }}
      >
        Charts powered by TradingView Lightweight Charts™
      </div>
    </section>
  );
}