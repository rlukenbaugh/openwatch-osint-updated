import { createMockEvents } from "@/lib/mock/mockEvents";
import type { ProviderAdapter } from "@/lib/adapters/types";
import type { NormalizedEvent, SeverityLevel } from "@/types/events";

type StooqSymbol = {
  symbol: string;
  date: string;
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

type StooqResponse = {
  symbols: StooqSymbol[];
};

const symbolNames: Record<string, string> = {
  "spy.us": "S&P 500 ETF",
  "qqq.us": "Nasdaq 100 ETF",
  "cl.f": "Crude Oil Futures",
  "gc.f": "Gold Futures",
  eurusd: "EUR/USD"
};

function marketSeverity(open: number, close: number): SeverityLevel {
  if (!open || !close) return 2;
  const pct = Math.abs(((close - open) / open) * 100);
  if (pct > 2.5) return 5;
  if (pct > 1.5) return 4;
  if (pct > 0.8) return 3;
  return 2;
}

export const marketAdapter: ProviderAdapter = {
  key: "market",
  category: "market",
  fetchEvents: async (): Promise<NormalizedEvent[]> => {
    try {
      const response = await fetch(
        "https://stooq.com/q/l/?s=spy.us,qqq.us,cl.f,gc.f,eurusd&f=sd2t2ohlcv&h&e=json",
        { next: { revalidate: 300 } }
      );
      if (!response.ok) throw new Error("Stooq fetch failed");
      const data = (await response.json()) as StooqResponse;

      return (data.symbols || []).map((symbol) => {
        const open = Number(symbol.open);
        const close = Number(symbol.close);
        const severity = marketSeverity(open, close);
        const pct = open > 0 ? ((close - open) / open) * 100 : 0;
        return {
          id: `mkt-${symbol.symbol}`,
          source: "Stooq",
          category: "market",
          title: symbolNames[symbol.symbol] || symbol.symbol,
          summary: `Open ${open.toFixed(2)} | Close ${close.toFixed(2)} | Move ${pct.toFixed(2)}%.`,
          location: {
            lat: 51.5072,
            lng: -0.1276,
            country: "Global",
            region: "Global"
          },
          severity,
          timestamp: new Date(`${symbol.date}T${symbol.time || "00:00:00"}Z`).toISOString(),
          url: "https://stooq.com/",
          tags: ["market", symbol.symbol]
        };
      });
    } catch {
      return createMockEvents("market", 8, "Stooq (Mock Fallback)");
    }
  }
};
