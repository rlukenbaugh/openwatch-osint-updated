"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardToolbar } from "@/components/layout/dashboard-toolbar";
import { Button } from "@/components/ui/button";
import { ClientErrorBoundary } from "@/components/system/client-error-boundary";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDashboardStore } from "@/stores/dashboard-store";

const DashboardGrid = dynamic(
  () => import("@/components/widgets/dashboard-grid").then((mod) => mod.DashboardGrid),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border/70 bg-panel/70 p-4 text-sm text-fg/65">
        Loading dashboard widgets...
      </div>
    )
  }
);

const AiAnalystPanel = dynamic(
  () => import("@/components/panels/ai-analyst-panel").then((mod) => mod.AiAnalystPanel),
  {
    ssr: false,
    loading: () => (
      <div className="h-full border-l border-border/70 bg-panel/65 p-4 text-sm text-fg/65">Loading analyst panel...</div>
    )
  }
);

export default function DashboardPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const {
    dashboards,
    activeDashboardId,
    events,
    filters,
    layers,
    mapWindowHours,
    isLoading,
    error,
    initialize,
    fetchEvents,
    setFilters,
    clearFilters,
    setActiveDashboard,
    setLayout,
    addWidget,
    removeWidget,
    toggleWidgetCollapsed,
    updateWidget,
    saveDashboard
  } = useDashboardStore();

  const activeDashboard = useMemo(
    () => dashboards.find((dashboard) => dashboard.id === activeDashboardId),
    [dashboards, activeDashboardId]
  );

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useKeyboardShortcuts({
    onAddWidget: () => addWidget("news"),
    onFocusSearch: () => searchRef.current?.focus(),
    onRefresh: () => {
      void fetchEvents({ refresh: true, evaluateAlerts: true });
    }
  });

  if (!activeDashboard && !isLoading) {
    return (
      <AppShell
        title="Dashboard"
        subtitle="No dashboards available"
        onRefresh={() => {
          void fetchEvents({ refresh: true });
        }}
      >
        <div className="flex h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-lg font-semibold">No dashboards found</p>
            <p className="mt-1 text-sm text-fg/65">Run database seed to load sample decks.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Situation Deck"
      subtitle="Drag, resize, and save intelligence widgets in real time"
      onRefresh={() => {
        void fetchEvents({ refresh: true, evaluateAlerts: true });
      }}
      rightSlot={
        <ClientErrorBoundary
          title="AI analyst panel unavailable"
          description="The rest of the app is still usable. You can retry this panel or continue with alerts, map, and webcams."
        >
          <AiAnalystPanel visibleEvents={events} />
        </ClientErrorBoundary>
      }
    >
      <div className="space-y-3">
        <DashboardToolbar
          dashboards={dashboards}
          activeDashboardId={activeDashboardId}
          onDashboardChange={setActiveDashboard}
          query={filters.query}
          onQueryChange={(query) => setFilters({ query })}
          categories={filters.categories}
          onCategoriesChange={(categories) => setFilters({ categories })}
          severities={filters.severities}
          onSeveritiesChange={(severities) => setFilters({ severities })}
          timeRangeHours={filters.timeRangeHours}
          onTimeRangeChange={(timeRangeHours) => setFilters({ timeRangeHours })}
          onAddWidget={addWidget}
          onSaveLayout={() => void saveDashboard()}
          onClearFilters={clearFilters}
          searchInputRef={searchRef}
        />

        {error ? (
          <div className="rounded-md border border-danger/40 bg-danger/10 p-2 text-sm text-danger">
            Error loading data: {error}
          </div>
        ) : null}

        {activeDashboard ? (
          <ClientErrorBoundary
            title="Dashboard widgets unavailable"
            description="A widget or grid module failed to render. You can retry this section without restarting the whole app."
          >
            <DashboardGrid
              dashboard={activeDashboard}
              events={events}
              mapLayers={layers}
              mapHours={mapWindowHours}
              onLayoutChange={(layout) => setLayout(layout)}
              onRemoveWidget={removeWidget}
              onToggleWidget={toggleWidgetCollapsed}
              onUpdateWidget={updateWidget}
              onWidgetRefresh={() => {
                void fetchEvents({ refresh: true });
              }}
            />
          </ClientErrorBoundary>
        ) : null}
      </div>
    </AppShell>
  );
}
