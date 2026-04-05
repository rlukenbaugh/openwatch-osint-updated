import { aviationAdapter } from "@/lib/adapters/aviationAdapter";
import { cyberAdapter } from "@/lib/adapters/cyberAdapter";
import { earthquakeAdapter } from "@/lib/adapters/earthquakeAdapter";
import { marketAdapter } from "@/lib/adapters/marketAdapter";
import { newsAdapter } from "@/lib/adapters/newsAdapter";
import { weatherAdapter } from "@/lib/adapters/weatherAdapter";
import type { ProviderAdapter } from "@/lib/adapters/types";
import { dedupeById } from "@/lib/utils";
import type { NormalizedEvent } from "@/types/events";

export const adapters: ProviderAdapter[] = [
  newsAdapter,
  earthquakeAdapter,
  weatherAdapter,
  aviationAdapter,
  cyberAdapter,
  marketAdapter
];

type EventCache = {
  ts: number;
  events: NormalizedEvent[];
};

let cache: EventCache | null = null;
// Short in-memory cache prevents hammering public feeds during rapid UI refreshes.
const cacheTtlMs = 2 * 60 * 1000;

export async function collectAllEvents(forceRefresh = false): Promise<NormalizedEvent[]> {
  const now = Date.now();
  if (!forceRefresh && cache && now - cache.ts < cacheTtlMs) {
    return cache.events;
  }

  const settled = await Promise.allSettled(adapters.map((adapter) => adapter.fetchEvents()));
  const merged: NormalizedEvent[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      merged.push(...result.value);
    }
  }

  const deduped = dedupeById(merged).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  cache = { ts: now, events: deduped };
  return deduped;
}

export async function collectEventsByProvider(providerKey: string): Promise<NormalizedEvent[]> {
  const provider = adapters.find((a) => a.key === providerKey);
  if (!provider) return [];
  return provider.fetchEvents();
}
