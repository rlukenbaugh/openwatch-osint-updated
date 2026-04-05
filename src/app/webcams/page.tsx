"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, RefreshCw, Radar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { WebcamStatus } from "@/types/webcam";

const providerOptions = [
  { value: "", label: "All providers" },
  { value: "CURATED", label: "Curated Worldwide" },
  { value: "WSDOT", label: "WSDOT" },
  { value: "CALTRANS_CCTV", label: "Caltrans CCTV" },
  { value: "ONTARIO_511", label: "Ontario 511" },
  { value: "NZTA_TRAFFIC", label: "NZTA Traffic" },
  { value: "DIGITRAFFIC_FI", label: "Finland Digitraffic" },
  { value: "VANCOUVER_OPENDATA", label: "Vancouver Open Data" },
  { value: "OHGO", label: "OHGO" },
  { value: "FAA_WEATHERCAMS", label: "FAA WeatherCams" }
];

const pageSizeOptions = [
  { value: 100, label: "100" },
  { value: 250, label: "250" },
  { value: 500, label: "500" },
  { value: 1000, label: "1000" },
  { value: 5000, label: "All" }
];

export default function WebcamsPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [provider, setProvider] = useState("");
  const [pageSize, setPageSize] = useState(250);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<WebcamStatus[]>([]);
  const [total, setTotal] = useState(0);
  const [sourceLabel, setSourceLabel] = useState("database");
  const [monitoringNote, setMonitoringNote] = useState("");
  const hasInitializedFilters = useRef(false);

  const loadWebcams = async (options?: { sync?: boolean; monitor?: boolean; forceRefresh?: boolean; nextPage?: number; nextPageSize?: number }) => {
    const sync = options?.sync ?? false;
    const monitor = options?.monitor ?? true;
    const forceRefresh = options?.forceRefresh ?? false;
    const activePage = options?.nextPage ?? page;
    const activePageSize = options?.nextPageSize ?? pageSize;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (region) params.set("region", region);
      if (country) params.set("country", country);
      if (provider) params.set("providers", provider);
      if (monitor) params.set("monitor", "1");
      if (forceRefresh) params.set("forceRefresh", "1");
      if (sync) params.set("sync", "1");
      params.set("limit", String(activePageSize));
      params.set("offset", String(activePage * activePageSize));

      const res = await fetch(`/api/webcams?${params.toString()}`, { cache: "no-store" });
      const payload = await res.json();
      setItems(payload.webcams || []);
      setTotal(Number(payload.total || 0));
      setSourceLabel(payload.source || "database");
      setMonitoringNote(payload.monitoringNote || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWebcams({ sync: true, monitor: true });
    const monitorInterval = setInterval(() => {
      void loadWebcams({ monitor: false });
    }, 120000);
    return () => clearInterval(monitorInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasInitializedFilters.current) {
      hasInitializedFilters.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      setPage(0);
      void loadWebcams({ nextPage: 0, monitor: false });
    }, 250);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, region, country, provider]);

  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);
  const hasPrev = page > 0;
  const hasNext = end < total;
  const activeFilterPills = useMemo(
    () =>
      [
        provider ? `Provider: ${providerOptions.find((option) => option.value === provider)?.label ?? provider}` : "",
        country ? `Country: ${country}` : "",
        region ? `Region: ${region}` : "",
        query ? `Search: ${query}` : ""
      ].filter(Boolean),
    [country, provider, query, region]
  );

  return (
    <AppShell
      title="Public Webcam Monitor"
      subtitle="Find and monitor publicly listed, owner-permitted webcam sources"
      onRefresh={() => {
        void loadWebcams({ sync: true, monitor: false });
      }}
    >
      <div className="space-y-3">
        <section className="grid gap-2 rounded-xl border border-border/70 bg-panel/85 p-3 md:grid-cols-6">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find by city/tag/provider..." />
          <Select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">All regions</option>
            <option value="Africa">Africa</option>
            <option value="South America">South America</option>
            <option value="Middle East">Middle East</option>
            <option value="Southeast Asia">Southeast Asia</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="East Asia">East Asia</option>
            <option value="Oceania">Oceania</option>
            <option value="Global">Global</option>
          </Select>
          <Input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country filter..." />
          <Select value={provider} onChange={(event) => setProvider(event.target.value)}>
            {providerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={String(pageSize)}
            onChange={(event) => {
              const nextPageSize = Number(event.target.value);
              setPage(0);
              setPageSize(nextPageSize);
              void loadWebcams({ nextPage: 0, nextPageSize });
            }}
          >
            {pageSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} / page
              </option>
            ))}
          </Select>
          <Button onClick={() => { setPage(0); void loadWebcams({ sync: true, monitor: false, nextPage: 0 }); }} className="gap-1" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync providers
          </Button>
        </section>

        <section className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-panel/60 p-3 text-xs">
          <span className="font-medium text-fg/80">Active filters:</span>
          {activeFilterPills.length ? (
            activeFilterPills.map((pill) => (
              <span key={pill} className="rounded-full border border-border/70 bg-panel px-2 py-1 text-fg/80">
                {pill}
              </span>
            ))
          ) : (
            <span className="text-fg/60">All webcams</span>
          )}
        </section>

        <section className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-panel/60 p-3 text-xs text-fg/70">
          <span className="font-medium text-fg/80">Status legend:</span>
          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 text-success">live: checked just now</span>
          <span className="rounded-full border border-border/70 bg-panel px-2 py-1">cached: recent saved check</span>
          <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-warning">deferred: live check skipped to avoid rate limits</span>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-panel/70 p-3 text-sm">
          <div>
            <p className="font-medium">
              Showing {start}-{end} of {total} webcams
            </p>
            <p className="text-xs text-fg/65">Source: {sourceLabel}</p>
            {monitoringNote ? <p className="text-xs text-warning">{monitoringNote}</p> : null}
            <p className="text-xs text-fg/60">Filters update automatically when you change provider, country, region, or search.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => {
                setPage(0);
                void loadWebcams({ nextPage: 0, monitor: false });
              }}
            >
              Refresh results
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => {
                void loadWebcams({ forceRefresh: true });
              }}
            >
              <Radar className="mr-1 h-4 w-4" />
              Refresh live status
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasPrev || loading}
              onClick={() => {
                const nextPage = Math.max(0, page - 1);
                setPage(nextPage);
                void loadWebcams({ nextPage, monitor: false });
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasNext || loading}
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                void loadWebcams({ nextPage, monitor: false });
              }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <p className="text-xs text-fg/65">
          Safety guardrails: this page only monitors curated public webcam endpoints over HTTPS. Private/local network hosts are blocked.
        </p>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-border/70 bg-panel/85 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Camera className="h-4 w-4 text-accent" />
                  {item.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${item.available ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                    {item.available ? "online" : "offline"}
                  </span>
                  <span className="rounded-full border border-border/70 px-2 py-0.5 text-xs text-fg/70">
                    {item.statusOrigin === "live"
                      ? "live"
                      : item.statusOrigin === "cached"
                        ? "cached"
                        : item.statusOrigin === "deferred"
                          ? "deferred"
                          : "unknown"}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-fg/65">
                {item.provider} · {item.location.city}, {item.location.country}
              </p>
              {item.location.lat === null || item.location.lng === null ? (
                <p className="mt-1 text-xs text-warning">List-only source: precise coordinates were not published by this provider.</p>
              ) : null}
              <p className="mt-2 text-xs text-fg/70">Tags: {item.tags.join(", ")}</p>
              <p className="mt-1 text-xs text-fg/60">
                Checked: {new Date(item.lastCheckedAt).toLocaleTimeString()}
                {item.statusCode ? ` · HTTP ${item.statusCode}` : ""}
              </p>
              {item.statusDetail ? <p className="mt-1 text-xs text-warning">{item.statusDetail}</p> : null}
              <a href={item.pageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-accent hover:underline">
                Open webcam page
              </a>
            </article>
          ))}
        </section>

        {!items.length && !loading ? <p className="text-sm text-fg/65">No public webcam sources matched your filters.</p> : null}
      </div>
    </AppShell>
  );
}
