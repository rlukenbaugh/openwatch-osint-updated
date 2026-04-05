import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type VancouverRecord = {
  mapid?: string;
  name?: string;
  url?: string;
  geo_local_area?: string;
  geo_point_2d?: {
    lat?: number;
    lon?: number;
  };
  geom?: {
    geometry?: {
      coordinates?: [number, number];
    };
  };
};

type VancouverEnvelope = {
  total_count?: number;
  results?: VancouverRecord[];
};

export const vancouverOpenDataConnector: WebcamProviderAdapter = {
  provider: "VANCOUVER_OPENDATA",
  displayName: "Vancouver Open Data Webcams",
  fetchSources: async () => {
    const records: WebcamIngestRecord[] = [];
    const pageSize = 100;

    for (let offset = 0; offset < 1000; offset += pageSize) {
      const data = (await fetchJson(
        `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/web-cam-url-links/records?limit=${pageSize}&offset=${offset}`,
        {
          next: { revalidate: 600 }
        }
      )) as VancouverEnvelope | null;
      const items = asArray(data?.results);
      if (!items.length) break;

      records.push(
        ...items
      .map((item) => {
        const camera = item as VancouverRecord;
        const externalId = asString(camera.mapid);
        const pageUrl = asString(camera.url);
        const fallbackCoordinates = Array.isArray(camera.geom?.geometry?.coordinates)
          ? camera.geom?.geometry?.coordinates
          : [];
        const lng = asNumber(camera.geo_point_2d?.lon ?? fallbackCoordinates[0], Number.NaN);
        const lat = asNumber(camera.geo_point_2d?.lat ?? fallbackCoordinates[1], Number.NaN);
        if (!externalId || !pageUrl || Number.isNaN(lat) || Number.isNaN(lng)) return null;

        const record: WebcamIngestRecord = {
          provider: "VANCOUVER_OPENDATA",
          externalId,
          name: asString(camera.name, `Vancouver Camera ${externalId}`),
          pageUrl,
          location: {
            country: "Canada",
            region: "North America",
            city: "Vancouver",
            lat,
            lng
          },
          tags: ["traffic", "government", "vancouver", asString(camera.geo_local_area, "city").toLowerCase()],
          metadata: {
            localArea: asString(camera.geo_local_area)
          }
        };
        return record;
      })
      .filter((record): record is WebcamIngestRecord => record !== null)
      );

      if ((data?.total_count ?? 0) <= offset + pageSize) break;
    }

    return records;
  }
};
