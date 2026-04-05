import { createMockEvents } from "@/lib/mock/mockEvents";
import type { ProviderAdapter } from "@/lib/adapters/types";
import type { NormalizedEvent, SeverityLevel } from "@/types/events";

type UsgsResponse = {
  features: Array<{
    id: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      title: string;
      url: string;
    };
    geometry: {
      coordinates: [number, number, number];
    };
  }>;
};

function magnitudeToSeverity(mag: number): SeverityLevel {
  if (mag < 2.5) return 1;
  if (mag < 4) return 2;
  if (mag < 5) return 3;
  if (mag < 6) return 4;
  return 5;
}

export const earthquakeAdapter: ProviderAdapter = {
  key: "earthquakes",
  category: "earthquake",
  fetchEvents: async (): Promise<NormalizedEvent[]> => {
    try {
      const response = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
        { next: { revalidate: 180 } }
      );
      if (!response.ok) throw new Error("USGS fetch failed");

      const data = (await response.json()) as UsgsResponse;
      return data.features.slice(0, 30).map((feature) => {
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const mag = feature.properties.mag ?? 0;
        return {
          id: feature.id,
          source: "USGS",
          category: "earthquake",
          title: feature.properties.title || "Earthquake event",
          summary: `${feature.properties.place || "Unknown area"} magnitude ${mag.toFixed(1)} event.`,
          location: {
            lat,
            lng,
            country: "International",
            region: "Global"
          },
          severity: magnitudeToSeverity(mag),
          timestamp: new Date(feature.properties.time).toISOString(),
          url: feature.properties.url || "https://earthquake.usgs.gov",
          tags: ["earthquake", `mag-${mag.toFixed(1)}`]
        };
      });
    } catch {
      return createMockEvents("earthquake", 10, "USGS (Mock Fallback)");
    }
  }
};
