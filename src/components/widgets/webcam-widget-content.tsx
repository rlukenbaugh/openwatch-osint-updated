"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicWebcam, WebcamStatus } from "@/types/webcam";

type WebcamWidgetContentProps = {
  limit?: number;
};

export function WebcamWidgetContent({ limit = 6 }: WebcamWidgetContentProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<(PublicWebcam | WebcamStatus)[]>([]);
  const [monitored, setMonitored] = useState(false);

  const fetchWebcams = async (withMonitoring = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      params.set("limit", String(limit));
      if (withMonitoring) params.set("monitor", "1");
      params.set("sync", "1");
      const res = await fetch(`/api/webcams?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load webcam feed");
      }
      const payload = await res.json();
      setItems(Array.isArray(payload.webcams) ? payload.webcams : []);
      setMonitored(Boolean(payload.monitored));
    } catch (error) {
      console.error("Webcam widget refresh failed", error);
      setItems([]);
      setMonitored(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWebcams(true);
    const interval = setInterval(() => {
      void fetchWebcams(true);
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => items.slice(0, limit), [items, limit]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find public webcams..." />
        <Button size="sm" variant="secondary" onClick={() => void fetchWebcams(true)} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <p className="text-xs text-fg/65">
        Monitoring public/owner-permitted camera pages only. Private/local network cameras are blocked.
      </p>

      <div className="space-y-2">
        {list.map((item) => {
          const status = item as WebcamStatus;
          return (
            <article key={item.id} className="rounded-md border border-border/70 bg-panel/70 p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{item.name}</p>
                {monitored ? (
                  <span className={`text-xs ${status.available ? "text-success" : "text-danger"}`}>
                    {status.available ? "online" : "offline"}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-fg/65">
                {item.provider} · {item.location?.city || "Unknown city"}, {item.location?.country || "Unknown country"}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-fg/70">
                  <Camera className="h-3.5 w-3.5" />
                  {(Array.isArray(item.tags) ? item.tags : []).slice(0, 2).join(", ") || "unlabeled"}
                </span>
                <a href={item.pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  Open
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {!list.length ? <p className="text-sm text-fg/65">No matching public webcams were found.</p> : null}
    </div>
  );
}
