"use client";

import { useMemo } from "react";
import { EventList } from "@/components/widgets/event-list";
import type { EventCategory, NormalizedEvent } from "@/types/events";

type FeedWidgetContentProps = {
  events: NormalizedEvent[];
  category: EventCategory;
  limit?: number;
};

export function FeedWidgetContent({ events, category, limit = 8 }: FeedWidgetContentProps) {
  const filtered = useMemo(
    () => events.filter((event) => event.category === category).slice(0, limit),
    [events, category, limit]
  );

  return <EventList events={filtered} emptyLabel={`No ${category} events match current filters.`} />;
}
