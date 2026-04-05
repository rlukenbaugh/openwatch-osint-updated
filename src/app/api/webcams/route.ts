import { NextRequest, NextResponse } from "next/server";
import { defaultAllProviders, fetchFromProviders, parseProviderList } from "@/lib/webcams/adapters";
import { loadWebcamSources, monitorAndPersistChecks, upsertWebcamSources } from "@/lib/webcams/store";
import { searchWebcams } from "@/lib/webcams/registry";
import { monitorPublicWebcams } from "@/lib/webcams/monitor";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const query = params.get("query") || "";
    const region = params.get("region") || "";
    const country = params.get("country") || "";
    const tag = params.get("tag") || "";
    const monitor = params.get("monitor") === "1";
    const sync = params.get("sync") === "1";
    const providerParam = params.get("providers");
    const providers = parseProviderList(params.get("providers"));
    const forceRefresh = params.get("forceRefresh") === "1";
    const limit = Number(params.get("limit") || "50");
    const offset = Number(params.get("offset") || "0");
    const providersToSync = providers.length ? providers : defaultAllProviders();
    const allowCuratedFallback = !providerParam || providerParam.toUpperCase().includes("CURATED");

    if (sync) {
      const fetched = await fetchFromProviders(providersToSync, {
        ohgoApiKey: process.env.OHGO_API_KEY,
        ohgoApiBaseUrl: process.env.OHGO_API_BASE_URL,
        faaApiKey: process.env.FAA_WEATHERCAMS_API_KEY,
        faaApiBaseUrl: process.env.FAA_WEATHERCAMS_API_URL
      });
      if (fetched.length) {
        await upsertWebcamSources(fetched);
      }
    }

    const loaded = await loadWebcamSources({
      query,
      region,
      country,
      tag,
      providers,
      limit: Number.isNaN(limit) ? 50 : limit,
      offset: Number.isNaN(offset) ? 0 : offset
    });

    const curatedFallback = allowCuratedFallback ? searchWebcams({ query, region, country, tag }) : [];
    const matches =
      loaded.total > 0
        ? loaded.rows
        : curatedFallback.slice(
            Number.isNaN(offset) ? 0 : offset,
            (Number.isNaN(offset) ? 0 : offset) + (Number.isNaN(limit) ? 50 : limit)
          );

    if (!monitor) {
      return NextResponse.json({
        webcams: matches,
        monitored: false,
        source: loaded.total > 0 ? "database" : "curated-fallback",
        total: loaded.total > 0 ? loaded.total : curatedFallback.length
      });
    }

    const monitored =
      loaded.total > 0
        ? await monitorAndPersistChecks(loaded.rows, { forceRefresh })
        : {
            statuses: (await monitorPublicWebcams(matches, { concurrency: 8 })).map((status) => ({ ...status, statusOrigin: "live" as const })),
            liveChecked: matches.length,
            deferred: 0
          };
    return NextResponse.json({
      webcams: monitored.statuses,
      monitored: true,
      source: loaded.total > 0 ? "database" : "curated-fallback",
      total: loaded.total > 0 ? loaded.total : curatedFallback.length,
      monitoringNote:
        monitored.deferred > 0
          ? `Live status was refreshed for ${monitored.liveChecked} visible cameras on this page; ${monitored.deferred} more are showing cached or deferred status to stay under provider rate limits.`
          : forceRefresh
            ? `Live status was refreshed for all ${monitored.liveChecked} visible cameras on this page.`
            : undefined
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch webcams",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
