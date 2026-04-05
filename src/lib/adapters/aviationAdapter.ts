import { createMockEvents } from "@/lib/mock/mockEvents";
import { toCountryRegion } from "@/lib/utils";
import type { ProviderAdapter } from "@/lib/adapters/types";
import type { NormalizedEvent, SeverityLevel } from "@/types/events";

type OpenSkyResponse = {
  time: number;
  states: Array<
    [
      string,
      string | null,
      string | null,
      number | null,
      number | null,
      number | null,
      number | null,
      number | null,
      boolean,
      number | null,
      number | null,
      number | null,
      unknown,
      number | null,
      string | null,
      boolean,
      number
    ]
  >;
};

function velocityToSeverity(velocity: number | null): SeverityLevel {
  if (!velocity) return 2;
  if (velocity > 280) return 4;
  if (velocity > 220) return 3;
  return 2;
}

export const aviationAdapter: ProviderAdapter = {
  key: "aviation",
  category: "aviation",
  fetchEvents: async (): Promise<NormalizedEvent[]> => {
    try {
      const response = await fetch("https://opensky-network.org/api/states/all", {
        next: { revalidate: 180 }
      });
      if (!response.ok) throw new Error("OpenSky fetch failed");

      const data = (await response.json()) as OpenSkyResponse;
      const valid = (data.states || []).filter((state) => state[5] !== null && state[6] !== null).slice(0, 30);

      return valid.map((state, index) => {
        const lat = state[6] ?? 0;
        const lng = state[5] ?? 0;
        const geo = toCountryRegion(lat, lng);
        const velocity = state[9];
        const severity = velocityToSeverity(velocity);
        const callsign = (state[1] || "Unknown").trim();

        return {
          id: `avi-${state[0]}-${index}`,
          source: "OpenSky",
          category: "aviation",
          title: callsign === "Unknown" ? "Tracked flight event" : `Flight ${callsign}`,
          summary: `Aviation position update from ${geo.country}. Velocity ${
            velocity ? `${Math.round(velocity)} m/s` : "unknown"
          }.`,
          location: {
            lat,
            lng,
            country: geo.country,
            region: geo.region
          },
          severity,
          timestamp: new Date((state[4] || data.time) * 1000).toISOString(),
          url: "https://opensky-network.org/network/explorer",
          tags: ["aviation", geo.region]
        };
      });
    } catch {
      return createMockEvents("aviation", 10, "OpenSky (Mock Fallback)");
    }
  }
};
