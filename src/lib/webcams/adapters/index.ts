import { caltransCctvConnector } from "@/lib/webcams/adapters/caltrans-cctv";
import { digitrafficFiConnector } from "@/lib/webcams/adapters/digitraffic-fi";
import { faaWeatherCamsConnector } from "@/lib/webcams/adapters/faa-weathercams";
import { nztaTrafficConnector } from "@/lib/webcams/adapters/nzta-traffic";
import { ohgoConnector } from "@/lib/webcams/adapters/ohgo";
import { ontario511Connector } from "@/lib/webcams/adapters/ontario-511";
import type { WebcamAdapterContext, WebcamProviderAdapter } from "@/lib/webcams/adapters/types";
import { vancouverOpenDataConnector } from "@/lib/webcams/adapters/vancouver-opendata";
import { wsdotConnector } from "@/lib/webcams/adapters/wsdot";
import type { WebcamIngestRecord, WebcamProviderKey } from "@/types/webcam";

export const webcamAdapters: WebcamProviderAdapter[] = [
  wsdotConnector,
  caltransCctvConnector,
  ontario511Connector,
  nztaTrafficConnector,
  digitrafficFiConnector,
  vancouverOpenDataConnector,
  ohgoConnector,
  faaWeatherCamsConnector
];

export function parseProviderList(providerInput?: string | null): WebcamProviderKey[] {
  if (!providerInput) return [];
  const requested = providerInput
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
  return webcamAdapters
    .map((adapter) => adapter.provider)
    .filter((provider) => requested.includes(provider));
}

export function defaultAllProviders(): WebcamProviderKey[] {
  return webcamAdapters.map((adapter) => adapter.provider);
}

export async function fetchFromProviders(
  providers: WebcamProviderKey[],
  context: WebcamAdapterContext
): Promise<WebcamIngestRecord[]> {
  const selected = webcamAdapters.filter((adapter) => providers.includes(adapter.provider));
  if (!selected.length) return [];

  const settled = await Promise.allSettled(selected.map((adapter) => adapter.fetchSources(context)));
  const records: WebcamIngestRecord[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      records.push(...result.value);
    }
  }

  const deduped = new Map<string, WebcamIngestRecord>();
  for (const record of records) {
    deduped.set(`${record.provider}:${record.externalId}`, record);
  }
  return Array.from(deduped.values());
}
