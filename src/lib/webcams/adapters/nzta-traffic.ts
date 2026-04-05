import { XMLParser } from "fast-xml-parser";
import type { WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import type { WebcamIngestRecord } from "@/types/webcam";

type SoapEnvelope = {
  "soap:Envelope"?: {
    "soap:Body"?: {
      "ns2:getCamerasResponse"?: {
        return?: Array<{
          id?: number;
          name?: string;
          description?: string;
          imageUrl?: string;
          viewurl?: string;
          offline?: boolean;
          underMaintenance?: boolean;
        }> | {
          id?: number;
          name?: string;
          description?: string;
          imageUrl?: string;
          viewurl?: string;
          offline?: boolean;
          underMaintenance?: boolean;
        };
      };
    };
  };
};

const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tra="http://traffic.transit.govt.nz/traffic/2009/07/15/">
  <soapenv:Header/>
  <soapenv:Body>
    <tra:getCameras/>
  </soapenv:Body>
</soapenv:Envelope>`;

export const nztaTrafficConnector: WebcamProviderAdapter = {
  provider: "NZTA_TRAFFIC",
  displayName: "NZTA Traffic Cameras",
  fetchSources: async () => {
    try {
      const response = await fetch("https://trafficnz.info/service/TrafficService", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8"
        },
        body: soapBody,
        next: { revalidate: 600 }
      });
      if (!response.ok) return [];
      const xml = await response.text();

      const parser = new XMLParser({
        ignoreAttributes: false,
        parseTagValue: true
      });
      const parsed = parser.parse(xml) as SoapEnvelope;
      const raw = parsed["soap:Envelope"]?.["soap:Body"]?.["ns2:getCamerasResponse"]?.return;
      const cameras = Array.isArray(raw) ? raw : raw ? [raw] : [];

      const records = cameras
        .map((camera) => {
          const id = camera.id ? String(camera.id) : "";
          if (!id || !camera.imageUrl) return null;
          const imageUrl = camera.imageUrl.startsWith("http")
            ? camera.imageUrl
            : `https://trafficnz.info${camera.imageUrl}`;
          const pageUrl = camera.viewurl?.startsWith("http")
            ? camera.viewurl
            : camera.viewurl
              ? `https://trafficnz.info${camera.viewurl}`
              : imageUrl;

          // NZTA's camera SOAP feed exposes camera names and images but not lat/lng in the response.
          const record: WebcamIngestRecord = {
            provider: "NZTA_TRAFFIC",
            externalId: id,
            name: camera.name || `NZTA Camera ${id}`,
            pageUrl,
            streamUrl: imageUrl,
            thumbnailUrl: imageUrl,
            location: {
              country: "New Zealand",
              region: "Oceania",
              city: "Unspecified",
              lat: null,
              lng: null
            },
            tags: [
              "traffic",
              "government",
              "nzta",
              camera.offline ? "offline" : "online",
              camera.underMaintenance ? "maintenance" : "active"
            ],
            metadata: {
              description: camera.description || "",
              hasExactCoordinates: false
            }
          };
          return record;
        })
        .filter((record): record is Exclude<typeof record, null> => record !== null);
      return records;
    } catch {
      return [];
    }
  }
};
