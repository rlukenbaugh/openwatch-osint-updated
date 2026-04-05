"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import type { NormalizedEvent } from "@/types/events";

type AiSummaryWidgetContentProps = {
  events: NormalizedEvent[];
};

export function AiSummaryWidgetContent({ events }: AiSummaryWidgetContentProps) {
  const summary = useMemo(() => {
    if (!events.length) {
      return {
        sentence: "No events are loaded yet. Refresh feeds to generate an analyst snapshot.",
        citations: [] as string[]
      };
    }

    const recent = events.slice(0, 20);
    const totalHigh = recent.filter((event) => event.severity >= 4).length;
    const byCategory = recent.reduce<Record<string, number>>((acc, event) => {
      acc[event.category] = (acc[event.category] ?? 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    const sentence = [
      `Last ${recent.length} visible events include ${totalHigh} high-severity records.`,
      topCategory ? `Most active category: ${topCategory[0]} (${topCategory[1]}).` : "No dominant category detected.",
      "Use the AI panel for deeper comparative questions with full source citations."
    ].join(" ");
    const citations = Array.from(new Set(recent.map((event) => event.url))).slice(0, 5);
    return { sentence, citations };
  }, [events]);

  return (
    <div className="space-y-3 text-sm">
      <p>{summary.sentence}</p>
      {summary.citations.length ? (
        <div className="rounded-md border border-border/70 bg-muted/25 p-2">
          <p className="mb-1 text-xs font-semibold text-fg/70">Reference sources</p>
          <ul className="space-y-1 text-xs">
            {summary.citations.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="inline-flex items-center gap-1 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          Source citations appear when events are available.
        </p>
      )}
    </div>
  );
}
