import type { EventCategory, NormalizedEvent, SeverityLevel } from "@/types/events";

const sampleTitles: Record<EventCategory, string[]> = {
  news: [
    "Regional ceasefire talks announced",
    "Port disruption impacts shipping routes",
    "Energy ministers schedule emergency summit",
    "Border crossing delays rise after storms"
  ],
  earthquake: [
    "Magnitude 5.1 earthquake recorded offshore",
    "Aftershock sequence continues near urban corridor",
    "Seismic swarm detected near volcanic zone",
    "Shallow tremor reported by monitoring stations"
  ],
  weather: [
    "Flash flood warning issued",
    "Severe thunderstorm watch upgraded",
    "Heat advisory expanded for major metro areas",
    "Cyclone track update increases risk corridor"
  ],
  aviation: [
    "Airspace congestion trending upward",
    "Flight diversion cluster detected",
    "Airport ground stop reported",
    "Route interruptions near restricted corridor"
  ],
  cyber: [
    "Critical vulnerability advisory published",
    "Ransomware campaign targeting infrastructure",
    "Credential stuffing spike detected",
    "Malware indicators shared by public CERT"
  ],
  market: [
    "Commodity volatility increases on supply risk",
    "Shipping index moves sharply higher",
    "FX market reacts to policy signal",
    "Equity futures retrace after overnight event"
  ]
};

const coordinates = [
  { lat: 38.72, lng: -9.14, country: "Portugal", region: "Europe" },
  { lat: 33.32, lng: 44.36, country: "Iraq", region: "Middle East" },
  { lat: 24.71, lng: 46.67, country: "Saudi Arabia", region: "Middle East" },
  { lat: 35.68, lng: 139.76, country: "Japan", region: "East Asia" },
  { lat: 40.71, lng: -74.01, country: "United States", region: "North America" },
  { lat: -33.92, lng: 18.42, country: "South Africa", region: "Africa" },
  { lat: -23.55, lng: -46.63, country: "Brazil", region: "South America" },
  { lat: 19.07, lng: 72.87, country: "India", region: "South Asia" }
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSeverity(): SeverityLevel {
  return randomInt(1, 5) as SeverityLevel;
}

export function createMockEvents(category: EventCategory, count = 8, source = "Mock Provider"): NormalizedEvent[] {
  return Array.from({ length: count }).map((_, index) => {
    const titlePool = sampleTitles[category];
    const title = titlePool[index % titlePool.length];
    const loc = coordinates[index % coordinates.length];
    const severity = randomSeverity();
    const occurred = new Date(Date.now() - randomInt(15, 360) * 60 * 1000).toISOString();
    const id = `${category}-mock-${index}-${Math.floor(Math.random() * 9999)}`;

    return {
      id,
      source,
      category,
      title,
      summary: `${title}. This is a mock event used when live providers are unavailable.`,
      location: {
        lat: loc.lat,
        lng: loc.lng,
        country: loc.country,
        region: loc.region
      },
      severity,
      timestamp: occurred,
      url: "https://example.com/mock-event",
      tags: [category, severity >= 4 ? "high-priority" : "routine"]
    };
  });
}
