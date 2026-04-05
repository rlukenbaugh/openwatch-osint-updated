"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MapControlBar } from "@/components/map/map-control-bar";
import { GlobalEventMapDynamic } from "@/components/map/global-event-map-dynamic";
import { EventList } from "@/components/widgets/event-list";
import { useDashboardStore } from "@/stores/dashboard-store";

type RegionPreset = "world" | "middleEast" | "europe" | "northAmerica" | "asia";

export default function MapPage() {
  const [regionPreset, setRegionPreset] = useState<RegionPreset>("world");
  const { events, layers, filters, initialize, fetchEvents, setLayers, setFilters } = useDashboardStore();

  useEffect(() => {
    if (!events.length) {
      void initialize();
    }
  }, [initialize, events.length]);

  const visible = useMemo(() => {
    const cutoff = Date.now() - filters.timeRangeHours * 60 * 60 * 1000;
    return events
      .filter((event) => layers.includes(event.category) && new Date(event.timestamp).getTime() >= cutoff)
      .slice(0, 20);
  }, [events, layers, filters.timeRangeHours]);

  return (
    <AppShell
      title="Global Map"
      subtitle="Clustered live event monitoring by category and severity"
      onRefresh={() => {
        void fetchEvents({ refresh: true, evaluateAlerts: true });
      }}
    >
      <div className="space-y-3">
        <MapControlBar
          layers={layers}
          onLayersChange={setLayers}
          hours={filters.timeRangeHours}
          onHoursChange={(timeRangeHours) => setFilters({ timeRangeHours })}
          regionPreset={regionPreset}
          onRegionPresetChange={setRegionPreset}
        />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-xl border border-border/70 bg-panel/85 p-2">
            <GlobalEventMapDynamic events={events} layers={layers} hours={filters.timeRangeHours} preset={regionPreset} showClusters />
          </div>
          <div className="rounded-xl border border-border/70 bg-panel/85 p-3">
            <p className="mb-2 text-sm font-semibold">Recent mapped events</p>
            <EventList events={visible} emptyLabel="No events in selected time window and layers." />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
