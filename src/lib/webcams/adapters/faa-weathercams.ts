import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamAdapterContext, WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type FaaApiEnvelope = {
  success?: boolean;
  payload?: unknown;
};

function normalizeSites(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const typed = payload as Record<string, unknown>;
  if (Array.isArray(typed.payload)) return typed.payload;
  if (Array.isArray(typed.sites)) return typed.sites;
  return [];
}

function toSiteRecord(site: Record<string, unknown>): WebcamIngestRecord | null {
  const siteId = asString(site.siteId || site.id);
  const siteName = asString(site.siteName || site.name, `FAA Site ${siteId}`);
  const lat = asNumber(site.latitude ?? site.lat);
  const lng = asNumber(site.longitude ?? site.lng ?? site.lon);
  if (!siteId || !lat || !lng) return null;

  return {
    provider: "FAA_WEATHERCAMS",
    externalId: siteId,
    name: siteName,
    pageUrl: `https://weathercams.faa.gov/`,
    location: {
      country: "United States",
      region: "North America",
      city: asString(site.city || site.state || "FAA Site"),
      lat,
      lng
    },
    tags: ["aviation", "weather", "faa"],
    metadata: {
      state: asString(site.state),
      region: asString(site.region),
      hasPanorama: Boolean(site.panorama),
      source: "sites"
    }
  };
}

function toCameraRecordsFromSite(site: Record<string, unknown>): WebcamIngestRecord[] {
  const siteId = asString(site.siteId || site.id);
  const siteName = asString(site.siteName || site.name, `FAA Site ${siteId}`);
  const lat = asNumber(site.latitude ?? site.lat);
  const lng = asNumber(site.longitude ?? site.lng ?? site.lon);
  const cameras = asArray(site.cameras);
  if (!siteId || !lat || !lng || !cameras.length) return [];

  const mapped = cameras
    .map((cameraRaw) => {
      if (!cameraRaw || typeof cameraRaw !== "object") return null;
      const camera = cameraRaw as Record<string, unknown>;
      const cameraId = asString(camera.cameraId || camera.id);
      if (!cameraId) return null;
      const name = asString(camera.cameraName || camera.name, `${siteName} Camera ${cameraId}`);
      const imageUrl = asString(camera.imageUrl || camera.lastImageUrl || camera.thumbnailUrl);
      const record: WebcamIngestRecord = {
        provider: "FAA_WEATHERCAMS",
        externalId: `${siteId}:${cameraId}`,
        name,
        pageUrl: "https://weathercams.faa.gov/",
        streamUrl: imageUrl || undefined,
        thumbnailUrl: imageUrl || undefined,
        location: {
          country: "United States",
          region: "North America",
          city: asString(site.city || site.state || "FAA Site"),
          lat,
          lng
        },
        tags: ["aviation", "weather", "faa", "camera"],
        metadata: {
          siteId,
          cameraId,
          cardinalDirection: asString(camera.cardinalDirection || camera.direction),
          source: "sites.cameras"
        }
      };
      return record;
    })
    .filter((record): record is Exclude<typeof record, null> => record !== null);
  return mapped;
}

export const faaWeatherCamsConnector: WebcamProviderAdapter = {
  provider: "FAA_WEATHERCAMS",
  displayName: "FAA WeatherCams",
  fetchSources: async (context: WebcamAdapterContext) => {
    const base = (context.faaApiBaseUrl || process.env.FAA_WEATHERCAMS_API_URL || "https://weathercams.faa.gov/api").replace(
      /\/$/,
      ""
    );
    const apiKey = context.faaApiKey || process.env.FAA_WEATHERCAMS_API_KEY || "";
    const endpoint = `${base}/sites?bounds=-90,-180|90,180`;

    const data = (await fetchJson(endpoint, {
      headers: {
        ...(apiKey ? { "x-api-key": apiKey, apikey: apiKey, ApiKey: apiKey, Authorization: `Bearer ${apiKey}` } : {})
      },
      next: { revalidate: 600 }
    })) as FaaApiEnvelope | unknown;
    if (!data) return [];

    const payload = (data as FaaApiEnvelope).payload ?? data;
    const sites = normalizeSites(payload);

    const records: WebcamIngestRecord[] = [];
    for (const siteRaw of sites) {
      if (!siteRaw || typeof siteRaw !== "object") continue;
      const site = siteRaw as Record<string, unknown>;
      const cameraRecords = toCameraRecordsFromSite(site);
      if (cameraRecords.length) {
        records.push(...cameraRecords);
        continue;
      }
      const siteRecord = toSiteRecord(site);
      if (siteRecord) records.push(siteRecord);
    }
    return records;
  }
};
