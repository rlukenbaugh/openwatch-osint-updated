import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamAdapterContext, WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

function extractCameras(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const typed = payload as Record<string, unknown>;
  const direct = asArray(typed.cameras);
  if (direct.length) return direct;
  const items = asArray(typed.items);
  if (items.length) return items;
  const envelope = asArray(typed.payload);
  if (envelope.length) return envelope;
  const nested = asArray((typed.data as Record<string, unknown> | undefined)?.cameras);
  return nested;
}

function mapCameraToRecord(item: unknown): WebcamIngestRecord | null {
  if (!item || typeof item !== "object") return null;
  const camera = item as Record<string, unknown>;

  const externalId = asString(camera.cameraId || camera.id || camera.CameraId || camera.CameraID);
  const name = asString(camera.name || camera.cameraName || camera.title || camera.description, `OHGO Camera ${externalId}`);
  const lat = asNumber(camera.latitude ?? camera.lat ?? camera.Latitude);
  const lng = asNumber(camera.longitude ?? camera.lon ?? camera.lng ?? camera.Longitude);
  const imageUrl = asString(camera.imageUrl || camera.url || camera.snapshotUrl || camera.ImageUrl);
  if (!externalId || !lat || !lng) return null;

  return {
    provider: "OHGO",
    externalId,
    name,
    pageUrl: asString(camera.detailsUrl || camera.pageUrl, "https://ohgo.com/"),
    streamUrl: imageUrl || undefined,
    thumbnailUrl: imageUrl || undefined,
    location: {
      country: "United States",
      region: "North America",
      city: asString(camera.city || camera.county || camera.district || "Ohio"),
      lat,
      lng
    },
    tags: ["traffic", "government", "ohgo", asString(camera.status || camera.cameraStatus || "active").toLowerCase()],
    metadata: {
      routeName: asString(camera.routeName || camera.route || camera.roadName),
      county: asString(camera.county),
      district: asString(camera.district)
    }
  };
}

export const ohgoConnector: WebcamProviderAdapter = {
  provider: "OHGO",
  displayName: "OHGO Ohio Traffic Cameras",
  fetchSources: async (context: WebcamAdapterContext) => {
    const base = (context.ohgoApiBaseUrl || process.env.OHGO_API_BASE_URL || "https://publicapi.ohgo.com").replace(/\/$/, "");
    const apiKey = context.ohgoApiKey || process.env.OHGO_API_KEY || "";
    const endpoint = `${base}/v1/cameras${apiKey ? `?apiKey=${encodeURIComponent(apiKey)}` : ""}`;

    const data = await fetchJson(endpoint, {
      headers: {
        ...(apiKey ? { "x-api-key": apiKey, apikey: apiKey, ApiKey: apiKey } : {})
      },
      next: { revalidate: 600 }
    });
    if (!data) return [];

    return extractCameras(data)
      .map(mapCameraToRecord)
      .filter((record): record is WebcamIngestRecord => Boolean(record));
  }
};
