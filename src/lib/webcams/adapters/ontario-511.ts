import { asArray, asNumber, asString, fetchJson } from "@/lib/webcams/adapters/helpers";
import type { WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type OntarioCamera = {
  Id: number;
  Source?: string;
  SourceId?: string;
  Roadway?: string;
  Direction?: string;
  Latitude: number;
  Longitude: number;
  Location?: string;
  Views?: Array<{
    Id: number;
    Url: string;
    Status?: string;
    Description?: string;
  }>;
};

export const ontario511Connector: WebcamProviderAdapter = {
  provider: "ONTARIO_511",
  displayName: "Ontario 511 Cameras",
  fetchSources: async () => {
    const data = await fetchJson("https://511on.ca/api/v2/get/cameras", {
      next: { revalidate: 600 }
    });
    const items = asArray(data);

    return items
      .flatMap((item) => {
        const camera = item as Partial<OntarioCamera>;
        const sourceId = asString(camera.SourceId, camera.Id ? String(camera.Id) : "");
        const location = asString(camera.Location, "Ontario");
        const lat = asNumber(camera.Latitude, NaN);
        const lng = asNumber(camera.Longitude, NaN);
        if (!sourceId || Number.isNaN(lat) || Number.isNaN(lng)) return [];

        const views = Array.isArray(camera.Views) && camera.Views.length ? camera.Views : [{ Id: camera.Id ?? 0, Url: "" }];
        return views
          .map((view) => {
            const pageUrl = asString(view.Url);
            if (!pageUrl) return null;

            const viewId = view.Id ? String(view.Id) : sourceId;
            const record: WebcamIngestRecord = {
              provider: "ONTARIO_511",
              externalId: `${sourceId}:${viewId}`,
              name: `${asString(camera.Roadway, "Ontario Highway")} - ${location}${view.Description ? ` (${view.Description})` : ""}`,
              pageUrl,
              location: {
                country: "Canada",
                region: "North America",
                city: "Ontario",
                lat,
                lng
              },
              tags: [
                "traffic",
                "government",
                "ontario-511",
                asString(camera.Direction, "unknown").toLowerCase()
              ],
              metadata: {
                source: asString(camera.Source),
                sourceId,
                roadway: asString(camera.Roadway),
                location,
                viewDescription: asString(view.Description),
                viewStatus: asString(view.Status)
              }
            };
            return record;
          })
          .filter((record): record is Exclude<typeof record, null> => record !== null);
      });
  }
};
