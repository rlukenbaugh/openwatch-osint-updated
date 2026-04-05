import type { WebcamIngestRecord, WebcamProviderKey } from "@/types/webcam";

export type WebcamAdapterContext = {
  ohgoApiKey?: string;
  ohgoApiBaseUrl?: string;
  faaApiKey?: string;
  faaApiBaseUrl?: string;
};

export type WebcamProviderAdapter = {
  provider: WebcamProviderKey;
  displayName: string;
  fetchSources: (context: WebcamAdapterContext) => Promise<WebcamIngestRecord[]>;
};
