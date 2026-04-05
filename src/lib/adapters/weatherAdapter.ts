import { createMockEvents } from "@/lib/mock/mockEvents";
import type { ProviderAdapter } from "@/lib/adapters/types";
import type { NormalizedEvent, SeverityLevel } from "@/types/events";

type NwsFeature = {
  id: string;
  properties: {
    event: string;
    areaDesc: string;
    severity: "Minor" | "Moderate" | "Severe" | "Extreme" | string;
    sent: string;
    headline?: string;
    description?: string;
    instruction?: string;
    uri?: string;
  };
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][];
  };
};

type NwsResponse = {
  features: NwsFeature[];
};

function nwsSeverityToLevel(severity: string): SeverityLevel {
  if (severity === "Minor") return 2;
  if (severity === "Moderate") return 3;
  if (severity === "Severe") return 4;
  if (severity === "Extreme") return 5;
  return 3;
}

function getLatLng(feature: NwsFeature): { lat: number; lng: number } {
  const polygon = feature.geometry?.coordinates?.[0];
  if (Array.isArray(polygon) && polygon.length > 0) {
    const [lng, lat] = polygon[0] as [number, number];
    return { lat, lng };
  }
  return { lat: 39.8283, lng: -98.5795 };
}

export const weatherAdapter: ProviderAdapter = {
  key: "weather",
  category: "weather",
  fetchEvents: async (): Promise<NormalizedEvent[]> => {
    try {
      const response = await fetch("https://api.weather.gov/alerts/active?status=actual", {
        headers: { "User-Agent": "OpenWatch OSINT MVP (public educational project)" },
        next: { revalidate: 300 }
      });
      if (!response.ok) throw new Error("NWS fetch failed");

      const data = (await response.json()) as NwsResponse;
      return data.features.slice(0, 40).map((feature) => {
        const severity = nwsSeverityToLevel(feature.properties.severity || "Moderate");
        const { lat, lng } = getLatLng(feature);
        return {
          id: feature.id,
          source: "NWS",
          category: "weather",
          title: feature.properties.headline || feature.properties.event || "Weather alert",
          summary:
            feature.properties.description?.slice(0, 260) ||
            `${feature.properties.event} for ${feature.properties.areaDesc}.`,
          location: {
            lat,
            lng,
            country: "United States",
            region: "North America"
          },
          severity,
          timestamp: new Date(feature.properties.sent).toISOString(),
          url: feature.properties.uri || "https://api.weather.gov",
          tags: ["weather", feature.properties.event, `severity-${severity}`]
        };
      });
    } catch {
      return createMockEvents("weather", 10, "NWS (Mock Fallback)");
    }
  }
};
