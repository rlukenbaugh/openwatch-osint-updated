import { prisma } from "@/lib/db/prisma";
import { monitorPublicWebcams } from "@/lib/webcams/monitor";
import type { WebcamIngestRecord, WebcamProviderKey, WebcamStatus } from "@/types/webcam";

const CHECK_CACHE_MS = 5 * 60 * 1000;
const LIVE_MONITOR_LIMIT = 60;

function toProvider(provider: WebcamProviderKey): WebcamProviderKey {
  return provider;
}

export async function upsertWebcamSources(records: WebcamIngestRecord[]) {
  for (const record of records) {
    await prisma.webcamSource.upsert({
      where: {
        provider_externalId: {
          provider: toProvider(record.provider),
          externalId: record.externalId
        }
      },
      update: {
        name: record.name,
        pageUrl: record.pageUrl,
        streamUrl: record.streamUrl || null,
        thumbnailUrl: record.thumbnailUrl || null,
        country: record.location.country,
        region: record.location.region,
        city: record.location.city,
        lat: record.location.lat,
        lng: record.location.lng,
        tagsJson: JSON.stringify(record.tags || []),
        metadataJson: JSON.stringify(record.metadata || {}),
        isActive: true,
        lastSyncedAt: new Date()
      },
      create: {
        provider: toProvider(record.provider),
        externalId: record.externalId,
        name: record.name,
        pageUrl: record.pageUrl,
        streamUrl: record.streamUrl || null,
        thumbnailUrl: record.thumbnailUrl || null,
        country: record.location.country,
        region: record.location.region,
        city: record.location.city,
        lat: record.location.lat,
        lng: record.location.lng,
        tagsJson: JSON.stringify(record.tags || []),
        metadataJson: JSON.stringify(record.metadata || {}),
        isActive: true,
        lastSyncedAt: new Date()
      }
    });
  }
}

type SearchParams = {
  query?: string;
  region?: string;
  country?: string;
  tag?: string;
  providers?: WebcamProviderKey[];
  limit?: number;
  offset?: number;
};

type WebcamSourceRow = {
  id: string;
  externalId: string;
  provider: WebcamProviderKey;
  name: string;
  pageUrl: string;
  streamUrl: string | null;
  thumbnailUrl: string | null;
  country: string;
  region: string;
  city: string;
  lat: number | null;
  lng: number | null;
  tagsJson: string;
};

export async function loadWebcamSources(search: SearchParams) {
  const rows = (await prisma.webcamSource.findMany({
    where: {
      isActive: true,
      ...(search.providers?.length
        ? {
            provider: {
              in: search.providers.map((provider) => toProvider(provider))
            }
          }
        : {})
    },
    orderBy: [{ provider: "asc" }, { name: "asc" }]
  })) as WebcamSourceRow[];

  const filtered = rows
    .map((row: WebcamSourceRow) => ({
      id: row.id,
      externalId: row.externalId,
      providerKey: row.provider as WebcamProviderKey,
      name: row.name,
      provider: row.provider,
      pageUrl: row.pageUrl,
      streamUrl: row.streamUrl || undefined,
      thumbnailUrl: row.thumbnailUrl || undefined,
      location: {
        country: row.country,
        region: row.region,
        city: row.city,
        lat: row.lat,
        lng: row.lng
      },
      tags: safeParseJsonStringArray(row.tagsJson)
    }))
    .filter((row) => {
      const queryLower = search.query?.toLowerCase().trim();
      const regionLower = search.region?.toLowerCase().trim();
      const countryLower = search.country?.toLowerCase().trim();
      if (queryLower) {
        const haystack = `${row.name} ${row.location.city} ${row.provider} ${row.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(queryLower)) return false;
      }
      if (regionLower && row.location.region.toLowerCase() !== regionLower) return false;
      if (countryLower && row.location.country.toLowerCase() !== countryLower) return false;
      if (!search.tag) return true;
      return row.tags.some((tag) => tag.toLowerCase() === search.tag?.toLowerCase());
    });

  const offset = search.offset ?? 0;
  const limit = search.limit ?? 200;

  return {
    total: filtered.length,
    rows: filtered.slice(offset, offset + limit)
  };
}

function safeParseJsonStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

type StoredWebcamRow = Awaited<ReturnType<typeof loadWebcamSources>>["rows"][number];

type LatestCheck = {
  available: boolean;
  statusCode?: number | null;
  statusDetail?: string | null;
  checkedAt: Date;
};

export type WebcamMonitorResult = {
  statuses: WebcamStatus[];
  liveChecked: number;
  deferred: number;
};

function toStatusFromCheck(
  source: StoredWebcamRow,
  latest?: LatestCheck,
  fallbackDetail?: string,
  statusOrigin: WebcamStatus["statusOrigin"] = "unavailable"
): WebcamStatus {
  const detail = fallbackDetail ?? latest?.statusDetail ?? undefined;
  return {
    ...source,
    available: latest?.available ?? false,
    statusCode: latest?.statusCode ?? undefined,
    statusDetail: detail || undefined,
    lastCheckedAt: latest?.checkedAt.toISOString() ?? new Date().toISOString(),
    statusOrigin
  };
}

async function loadLatestChecks(sourceIds: string[]) {
  const rows = await prisma.webcamCheck.findMany({
    where: {
      sourceId: {
        in: sourceIds
      }
    },
    orderBy: {
      checkedAt: "desc"
    }
  });

  const latestBySourceId = new Map<string, LatestCheck>();
  for (const row of rows) {
    if (latestBySourceId.has(row.sourceId)) continue;
    latestBySourceId.set(row.sourceId, {
      available: row.available,
      statusCode: row.statusCode,
      statusDetail: row.statusDetail,
      checkedAt: row.checkedAt
    });
  }
  return latestBySourceId;
}

export async function monitorAndPersistChecks(
  sources: StoredWebcamRow[],
  options?: { forceRefresh?: boolean }
): Promise<WebcamMonitorResult> {
  const latestChecks = await loadLatestChecks(sources.map((source) => source.id));
  const now = Date.now();

  const fresh = new Map<string, WebcamStatus>();
  const staleSources: StoredWebcamRow[] = [];

  for (const source of sources) {
    const latest = latestChecks.get(source.id);
    if (!options?.forceRefresh && latest && now - latest.checkedAt.getTime() < CHECK_CACHE_MS) {
      fresh.set(
        source.id,
        toStatusFromCheck(source, latest, latest.statusDetail || "Using recent cached check", "cached")
      );
      continue;
    }
    staleSources.push(source);
  }

  const sourcesToProbe = staleSources.slice(0, LIVE_MONITOR_LIMIT);
  const deferredSources = staleSources.slice(LIVE_MONITOR_LIMIT);
  const probedStatuses = await monitorPublicWebcams(sourcesToProbe, { concurrency: 8 });

  if (probedStatuses.length) {
    await prisma.webcamCheck.createMany({
      data: probedStatuses.map((status) => ({
        sourceId: status.id,
        available: status.available,
        statusCode: status.statusCode,
        statusDetail: status.statusDetail || null
      }))
    });
  }

  const statusBySourceId = new Map<string, WebcamStatus>();
  for (const status of probedStatuses) {
    statusBySourceId.set(status.id, { ...status, statusOrigin: "live" });
  }
  for (const [sourceId, status] of fresh.entries()) {
    statusBySourceId.set(sourceId, status);
  }
  for (const source of deferredSources) {
    const latest = latestChecks.get(source.id);
    statusBySourceId.set(
      source.id,
      toStatusFromCheck(
        source,
        latest,
        latest ? "Using cached status to avoid provider rate limits" : "Live check deferred to avoid provider rate limits",
        "deferred"
      )
    );
  }

  return {
    statuses: sources.map((source) => statusBySourceId.get(source.id) ?? toStatusFromCheck(source, undefined, "Status unavailable", "unavailable")),
    liveChecked: probedStatuses.length,
    deferred: deferredSources.length
  };
}
