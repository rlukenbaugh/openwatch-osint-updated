"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventList } from "@/components/widgets/event-list";
import type { NormalizedEvent } from "@/types/events";

type MarketWidgetContentProps = {
  events: NormalizedEvent[];
};

export function MarketWidgetContent({ events }: MarketWidgetContentProps) {
  const marketEvents = useMemo(() => events.filter((event) => event.category === "market").slice(0, 8), [events]);

  if (!marketEvents.length) {
    return <EventList events={[]} emptyLabel="No market snapshot records for current filters." />;
  }

  return (
    <div className="space-y-2">
      {marketEvents.map((event) => {
        const isNegative = /-\d/.test(event.summary);
        return (
          <article key={event.id} className="rounded-md border border-border/70 bg-panel/70 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{event.title}</p>
              <Badge variant={event.severity >= 4 ? "danger" : event.severity === 3 ? "warning" : "success"}>
                S{event.severity}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-fg/70">{event.summary}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-fg/65">
              <span>{event.location.region}</span>
              <span className="inline-flex items-center gap-1">
                {isNegative ? <TrendingDown className="h-3.5 w-3.5 text-danger" /> : <TrendingUp className="h-3.5 w-3.5 text-success" />}
                <a href={event.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  source
                </a>
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
