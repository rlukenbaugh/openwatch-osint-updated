import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type CaltransEnvelope = {
  data?: Array<{
    cctv?: Partial<CaltransCamera>;
  }>;
};

type CaltransCamera = {
  index?: string;
  inService?: string;
  recordTimestamp?: {
    recordDate?: string;
    recordTime?: string;
    recordEpoch?: string;
  };
  location?: {
    district?: string;
    locationName?: string;
    nearbyPlace?: string;
    longitude?: string;
    latitude?: string;
    direction?: string;
    county?: string;
    route?: string;
  };
  imageData?: {
    streamingVideoURL?: string;
    static?: {
      currentImageURL?: string;
      currentImageUpdateFrequency?: string;
    };
  };
};

const districtIds = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toRecord(camera: Partial<CaltransCamera>, districtId: string): WebcamIngestRecord | null {
  const location = camera.location;
  const imageData = camera.imageData;
  const staticImage = imageData?.static;
  const index = asString(camera.index);
  const lat = asNumber(location?.latitude, Number.NaN);
  const lng = asNumber(location?.longitude, Number.NaN);
  const imageUrl = asString(staticImage?.currentImageURL);
  const videoUrl = asString(imageData?.streamingVideoURL);
  const isInService = asString(camera.inService).toLowerCase() === "true";

  if (!isInService || !index || Number.isNaN(lat) || Number.isNaN(lng) || (!imageUrl && !videoUrl)) {
    return null;
  }

  const route = asString(location?.route);
  const direction = asString(location?.direction);
  const county = asString(location?.county);
  const nearbyPlace = asString(location?.nearbyPlace, county || "California");

  return {
    provider: "CALTRANS_CCTV",
    externalId: `${districtId}:${index}`,
    name: asString(location?.locationName, `Caltrans CCTV ${districtId}-${index}`),
    pageUrl: imageUrl || videoUrl,
    streamUrl: videoUrl || undefined,
    thumbnailUrl: imageUrl || undefined,
    location: {
      country: "United States",
      region: "North America",
      city: nearbyPlace,
      lat,
      lng
    },
    tags: [
      "traffic",
      "government",
      "caltrans",
      `district-${Number(districtId)}`,
      route ? normalizeTag(route) : "route-unknown",
      direction ? normalizeTag(direction) : "direction-unknown",
      videoUrl ? "video" : "image"
    ],
    metadata: {
      district: asString(location?.district, String(Number(districtId))),
      county,
      route,
      direction,
      nearbyPlace,
      recordDate: asString(camera.recordTimestamp?.recordDate),
      recordTime: asString(camera.recordTimestamp?.recordTime),
      recordEpoch: asString(camera.recordTimestamp?.recordEpoch),
      currentImageUpdateFrequency: asString(staticImage?.currentImageUpdateFrequency)
    }
  };
}

export const caltransCctvConnector: WebcamProviderAdapter = {
  provider: "CALTRANS_CCTV",
  displayName: "Caltrans CCTV",
  fetchSources: async () => {
    const responses = await Promise.all(
      districtIds.map(async (districtId) => {
        const data = (await fetchJson(`https://cwwp2.dot.ca.gov/data/d${Number(districtId)}/cctv/cctvStatusD${districtId}.json`, {
          next: { revalidate: 600 }
        })) as CaltransEnvelope | null;

        return asArray(data?.data).map((item) => toRecord((item as { cctv?: Partial<CaltransCamera> }).cctv || {}, districtId));
      })
    );

    return responses.flat().filter((record): record is WebcamIngestRecord => Boolean(record));
  }
};
