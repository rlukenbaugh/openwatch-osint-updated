export type PublicWebcam = {
  id: string;
  externalId?: string;
  providerKey?: WebcamProviderKey;
  name: string;
  provider: string;
  pageUrl: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  location: {
    country: string;
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  tags: string[];
};

export type WebcamStatus = PublicWebcam & {
  available: boolean;
  statusCode?: number;
  lastCheckedAt: string;
  statusDetail?: string;
  statusOrigin?: "live" | "cached" | "deferred" | "unavailable";
};

export type WebcamProviderKey =
  | "CURATED"
  | "WSDOT"
  | "CALTRANS_CCTV"
  | "ONTARIO_511"
  | "NZTA_TRAFFIC"
  | "DIGITRAFFIC_FI"
  | "VANCOUVER_OPENDATA"
  | "OHGO"
  | "FAA_WEATHERCAMS";

export type WebcamIngestRecord = {
  provider: WebcamProviderKey;
  externalId: string;
  name: string;
  pageUrl: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  location: {
    country: string;
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  tags: string[];
  metadata?: Record<string, unknown>;
};
