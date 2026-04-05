"use client";

import type { EventCategory, NormalizedEvent } from "@/types/events";
import { GlobalEventMapDynamic } from "@/components/map/global-event-map-dynamic";

type MapWidgetContentProps = {
  events: NormalizedEvent[];
  layers: EventCategory[];
  hours: number;
};

export function MapWidgetContent({ events, layers, hours }: MapWidgetContentProps) {
  return <GlobalEventMapDynamic events={events} layers={layers} hours={hours} preset="world" showClusters />;
}
