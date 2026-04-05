import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type DigitrafficPreset = {
  id?: string;
  inCollection?: boolean;
};

type DigitrafficStationFeature = {
  id?: string;
  geometry?: {
    coordinates?: [number, number, number?];
  };
  properties?: {
    id?: string;
    name?: string;
    collectionStatus?: string;
    dataUpdatedTime?: string;
    presets?: DigitrafficPreset[];
  };
};

type DigitrafficEnvelope = {
  features?: DigitrafficStationFeature[];
};

function toImageUrl(presetId: string) {
  return `https://weathercam.digitraffic.fi/${presetId}.jpg`;
}

export const digitrafficFiConnector: WebcamProviderAdapter = {
  provider: "DIGITRAFFIC_FI",
  displayName: "Finland Digitraffic Weathercams",
  fetchSources: async () => {
    const data = (await fetchJson("https://tie.digitraffic.fi/api/weathercam/v1/stations", {
      headers: {
        "Digitraffic-User": "OpenWatch OSINT"
      },
      next: { revalidate: 600 }
    })) as DigitrafficEnvelope | null;
    if (!data?.features?.length) return [];

    return data.features.flatMap((feature) => {
      const stationId = asString(feature.properties?.id, asString(feature.id));
      const stationName = asString(feature.properties?.name, `Digitraffic station ${stationId}`).trim();
      const coordinates = Array.isArray(feature.geometry?.coordinates) ? feature.geometry?.coordinates : [];
      const lng = asNumber(coordinates[0], Number.NaN);
      const lat = asNumber(coordinates[1], Number.NaN);
      if (!stationId || Number.isNaN(lat) || Number.isNaN(lng)) return [];

      const presets = asArray(feature.properties?.presets)
        .map((item) => item as DigitrafficPreset)
        .filter((preset) => preset?.id);
      if (!presets.length) return [];

      return presets.map((preset) => {
        const presetId = asString(preset.id);
        const imageUrl = toImageUrl(presetId);

        return {
          provider: "DIGITRAFFIC_FI",
          externalId: `${stationId}:${presetId}`,
          name: `${stationName} (${presetId})`,
          pageUrl: imageUrl,
          streamUrl: imageUrl,
          thumbnailUrl: imageUrl,
          location: {
            country: "Finland",
            region: "Europe",
            city: stationName,
            lat,
            lng
          },
          tags: [
            "traffic",
            "weather",
            "government",
            "finland",
            preset.inCollection ? "collecting" : "listed"
          ],
          metadata: {
            stationId,
            presetId,
            collectionStatus: asString(feature.properties?.collectionStatus),
            dataUpdatedTime: asString(feature.properties?.dataUpdatedTime)
          }
        } satisfies WebcamIngestRecord;
      });
    });
  }
};
