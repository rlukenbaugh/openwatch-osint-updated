import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type WsdotCamera = {
  id: number;
  url: string;
  title: string;
  roadName?: string;
  direction?: string;
  milepost?: number;
  lat: number;
  lon: number;
  video?: number;
};

export const wsdotConnector: WebcamProviderAdapter = {
  provider: "WSDOT",
  displayName: "Washington State Department of Transportation",
  fetchSources: async () => {
    const data = await fetchJson("https://data.wsdot.wa.gov/mobile/Cameras.json", {
      next: { revalidate: 600 }
    });
    if (!data || typeof data !== "object") return [];

    const items = asArray((data as { cameras?: { items?: unknown[] } }).cameras?.items);
    return items
      .map((item): WebcamIngestRecord | null => {
        const camera = item as Partial<WsdotCamera>;
        const externalId = camera.id ? String(camera.id) : "";
        const imageUrl = asString(camera.url);
        const lat = asNumber(camera.lat);
        const lng = asNumber(camera.lon);
        if (!externalId || !imageUrl || !lat || !lng) return null;

        return {
          provider: "WSDOT",
          externalId,
          name: asString(camera.title, `WSDOT Camera ${externalId}`),
          pageUrl: "https://wsdot.com/Travel/Real-time/Map/",
          streamUrl: imageUrl,
          thumbnailUrl: imageUrl,
          location: {
            country: "United States",
            region: "North America",
            city: "Washington",
            lat,
            lng
          },
          tags: ["traffic", "government", "wsdot", camera.video ? "video" : "image"],
          metadata: {
            roadName: asString(camera.roadName),
            direction: asString(camera.direction),
            milepost: asNumber(camera.milepost)
          }
        };
      })
      .filter((record): record is WebcamIngestRecord => Boolean(record));
  }
};
