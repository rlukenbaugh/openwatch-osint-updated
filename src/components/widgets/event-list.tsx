"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { severityToColorClass, severityToLabel } from "@/lib/utils";
import type { NormalizedEvent } from "@/types/events";

type EventListProps = {
  events: NormalizedEvent[];
  emptyLabel: string;
};

export function EventList({ events, emptyLabel }: EventListProps) {
  if (!events.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border/80 p-4 text-center text-sm text-fg/65">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li key={event.id} className="rounded-md border border-border/60 bg-panel/70 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-medium">{event.title}</p>
            <Badge variant={event.severity >= 4 ? "danger" : event.severity === 3 ? "warning" : "success"}>
              {severityToLabel(event.severity)}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-fg/70">{event.summary}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-fg/65">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location.country}
            </span>
            <span className={severityToColorClass(event.severity)}>S{event.severity}</span>
            <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              Source
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
