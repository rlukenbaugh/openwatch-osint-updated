"use client";

import { useMemo } from "react";
import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EventList } from "@/components/widgets/event-list";
import type { NormalizedEvent } from "@/types/events";

type KeywordAlertWidgetContentProps = {
  events: NormalizedEvent[];
  keyword: string;
  onKeywordChange: (keyword: string) => void;
};

export function KeywordAlertWidgetContent({ events, keyword, onKeywordChange }: KeywordAlertWidgetContentProps) {
  const filtered = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) return [];
    return events
      .filter((event) => `${event.title} ${event.summary} ${event.tags.join(" ")}`.toLowerCase().includes(search))
      .slice(0, 10);
  }, [events, keyword]);

  return (
    <div className="space-y-3">
      <label className="block text-xs text-fg/70">
        Keyword trigger
        <Input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="e.g. missile, ransomware, outage"
          className="mt-1"
        />
      </label>

      {keyword ? (
        <p className="inline-flex items-center gap-1 text-xs text-warning">
          <Bell className="h-3.5 w-3.5" />
          {filtered.length} matching events in current view
        </p>
      ) : null}

      <EventList events={filtered} emptyLabel={keyword ? "No events matched this keyword." : "Set a keyword to start matching events."} />
    </div>
  );
}
