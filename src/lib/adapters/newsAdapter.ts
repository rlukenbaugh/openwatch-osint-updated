import { XMLParser } from "fast-xml-parser";
import { createMockEvents } from "@/lib/mock/mockEvents";
import { toCountryRegion } from "@/lib/utils";
import type { ProviderAdapter } from "@/lib/adapters/types";
import type { NormalizedEvent, SeverityLevel } from "@/types/events";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
};

type ParsedRss = {
  rss?: {
    channel?: {
      item?: RssItem[] | RssItem;
    };
  };
};

const geoHints: Array<{ token: string; lat: number; lng: number }> = [
  { token: "gaza", lat: 31.5, lng: 34.47 },
  { token: "ukraine", lat: 50.45, lng: 30.52 },
  { token: "taiwan", lat: 25.03, lng: 121.56 },
  { token: "japan", lat: 35.68, lng: 139.76 },
  { token: "washington", lat: 38.91, lng: -77.04 },
  { token: "brussels", lat: 50.85, lng: 4.35 },
  { token: "india", lat: 28.61, lng: 77.2 }
];

function scoreSeverity(text: string): SeverityLevel {
  const lower = text.toLowerCase();
  if (/(war|strike|explosion|attack|fatal|crash|earthquake)/.test(lower)) return 5;
  if (/(conflict|warning|sanction|emergency|disruption)/.test(lower)) return 4;
  if (/(risk|alert|shortage|protest|outage)/.test(lower)) return 3;
  return 2;
}

function locateFromText(text: string): { lat: number; lng: number; country: string; region: string } {
  const hint = geoHints.find((entry) => text.toLowerCase().includes(entry.token));
  if (!hint) {
    return {
      lat: 51.5072,
      lng: -0.1276,
      country: "United Kingdom",
      region: "Europe"
    };
  }

  const mapped = toCountryRegion(hint.lat, hint.lng);
  return {
    lat: hint.lat,
    lng: hint.lng,
    country: mapped.country,
    region: mapped.region
  };
}

export const newsAdapter: ProviderAdapter = {
  key: "news",
  category: "news",
  fetchEvents: async (): Promise<NormalizedEvent[]> => {
    try {
      const response = await fetch("https://feeds.reuters.com/reuters/worldNews", {
        next: { revalidate: 300 }
      });
      if (!response.ok) throw new Error("Reuters RSS fetch failed");
      const xml = await response.text();

      const parser = new XMLParser({
        ignoreAttributes: false
      });
      const parsed = parser.parse(xml) as ParsedRss;
      const rawItems = parsed.rss?.channel?.item || [];
      const items = Array.isArray(rawItems) ? rawItems : [rawItems];

      return items.slice(0, 25).map((item, index) => {
        const text = `${item.title || ""} ${item.description || ""}`;
        const severity = scoreSeverity(text);
        const geo = locateFromText(text);
        return {
          id: `news-${index}-${Buffer.from(item.title || String(index)).toString("base64").slice(0, 8)}`,
          source: "Reuters RSS",
          category: "news",
          title: item.title || "Global event",
          summary: (item.description || "No summary available.").replace(/<[^>]+>/g, "").slice(0, 280),
          location: {
            lat: geo.lat,
            lng: geo.lng,
            country: geo.country,
            region: geo.region
          },
          severity,
          timestamp: new Date(item.pubDate || Date.now()).toISOString(),
          url: item.link || "https://www.reuters.com/world/",
          tags: ["news", severity >= 4 ? "high-priority" : "watch"]
        };
      });
    } catch {
      return createMockEvents("news", 12, "Global RSS (Mock Fallback)");
    }
  }
};
