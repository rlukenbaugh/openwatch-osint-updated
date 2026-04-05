"use client";

import { create } from "zustand";
import type { DashboardLayout, DashboardLayoutItem, WidgetConfig, WidgetType } from "@/types/dashboard";
import type { EventCategory, EventFilterState, NormalizedEvent, SeverityLevel } from "@/types/events";

const defaultFilter: EventFilterState = {
  query: "",
  categories: [],
  countries: [],
  regions: [],
  severities: [],
  timeRangeHours: 24
};

const widgetCatalog: Record<WidgetType, Pick<WidgetConfig, "title" | "sourceLabel">> = {
  news: { title: "News Feed", sourceLabel: "Global RSS" },
  earthquakes: { title: "Earthquake Feed", sourceLabel: "USGS" },
  weather: { title: "Weather Alerts", sourceLabel: "NWS" },
  aviation: { title: "Flight Tracker Summary", sourceLabel: "OpenSky" },
  cyber: { title: "Cyber Alerts", sourceLabel: "CISA" },
  market: { title: "Market Snapshot", sourceLabel: "Stooq" },
  map: { title: "Global Map", sourceLabel: "Unified Feed" },
  webcams: { title: "Public Webcam Monitor", sourceLabel: "Curated Public Registry" },
  keywordAlert: { title: "Keyword Alert", sourceLabel: "Rules Engine" },
  aiSummary: { title: "AI Summary", sourceLabel: "Local RAG" }
};

export const widgetTypeToEventCategory: Partial<Record<WidgetType, EventCategory>> = {
  news: "news",
  earthquakes: "earthquake",
  weather: "weather",
  aviation: "aviation",
  cyber: "cyber",
  market: "market"
};

type DashboardState = {
  dashboards: DashboardLayout[];
  activeDashboardId: string | null;
  events: NormalizedEvent[];
  filters: EventFilterState;
  layers: EventCategory[];
  mapWindowHours: number;
  isLoading: boolean;
  error: string | null;
  aiPanelOpen: boolean;
  initialize: () => Promise<void>;
  fetchDashboards: () => Promise<void>;
  fetchEvents: (opts?: { refresh?: boolean; evaluateAlerts?: boolean }) => Promise<void>;
  setFilters: (partial: Partial<EventFilterState>) => void;
  clearFilters: () => void;
  setLayers: (layers: EventCategory[]) => void;
  setMapWindowHours: (hours: number) => void;
  setActiveDashboard: (id: string) => void;
  setLayout: (layout: DashboardLayoutItem[]) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  toggleWidgetCollapsed: (widgetId: string) => void;
  updateWidget: (widgetId: string, patch: Partial<WidgetConfig>) => void;
  saveDashboard: () => Promise<void>;
  clonePresetToNewDashboard: (name: string) => Promise<void>;
  setAiPanelOpen: (open: boolean) => void;
};

function currentDashboard(state: DashboardState): DashboardLayout | undefined {
  return state.dashboards.find((dashboard) => dashboard.id === state.activeDashboardId);
}

function eventToQueryString(filters: EventFilterState, options?: { refresh?: boolean; evaluateAlerts?: boolean }): string {
  const params = new URLSearchParams();
  // Keep filter serialization in one place so API + UI stay in sync as filters evolve.
  if (filters.query) params.set("query", filters.query);
  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  if (filters.countries.length) params.set("countries", filters.countries.join(","));
  if (filters.regions.length) params.set("regions", filters.regions.join(","));
  if (filters.severities.length) params.set("severities", filters.severities.join(","));
  params.set("hours", String(filters.timeRangeHours));
  if (options?.refresh) params.set("refresh", "1");
  if (options?.evaluateAlerts) params.set("evaluateAlerts", "1");
  return params.toString();
}

function generateWidget(type: WidgetType, y = 0): { layout: DashboardLayoutItem; widget: WidgetConfig } {
  const id = `${type}-${Date.now()}`;
  return {
    layout: {
      i: id,
      x: 0,
      y,
      w: type === "map" || type === "aiSummary" ? 6 : 4,
      h: type === "map" ? 8 : 4,
      minW: 2,
      minH: 2
    },
    widget: {
      id,
      type,
      title: widgetCatalog[type].title,
      sourceLabel: widgetCatalog[type].sourceLabel,
      refreshIntervalSec: 300,
      collapsed: false,
      filters: {}
    }
  };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: [],
  activeDashboardId: null,
  events: [],
  filters: defaultFilter,
  layers: ["news", "earthquake", "weather", "aviation", "cyber", "market"],
  mapWindowHours: 24,
  isLoading: false,
  error: null,
  aiPanelOpen: true,
  initialize: async () => {
    await get().fetchDashboards();
    await get().fetchEvents();
  },
  fetchDashboards: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/layouts", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch dashboards");
      const payload = (await res.json()) as { dashboards: DashboardLayout[] };
      const dashboards = payload.dashboards || [];
      set((state) => ({
        dashboards,
        activeDashboardId: state.activeDashboardId || dashboards[0]?.id || null,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown dashboard fetch error",
        isLoading: false
      });
    }
  },
  fetchEvents: async (opts) => {
    const state = get();
    try {
      const query = eventToQueryString(state.filters, opts);
      const res = await fetch(`/api/events?${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const payload = (await res.json()) as { events: NormalizedEvent[] };
      set({ events: payload.events || [], error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown event fetch error" });
    }
  },
  setFilters: (partial) => {
    set((state) => ({ filters: { ...state.filters, ...partial } }));
    void get().fetchEvents();
  },
  clearFilters: () => {
    set({ filters: defaultFilter });
    void get().fetchEvents();
  },
  setLayers: (layers) => set({ layers }),
  setMapWindowHours: (hours) => set({ mapWindowHours: hours }),
  setActiveDashboard: (id) => set({ activeDashboardId: id }),
  setLayout: (layout) => {
    set((state) => {
      const dashboard = currentDashboard(state);
      if (!dashboard) return state;
      return {
        dashboards: state.dashboards.map((item) => (item.id === dashboard.id ? { ...item, layout } : item))
      };
    });
  },
  addWidget: (type) => {
    set((state) => {
      const dashboard = currentDashboard(state);
      if (!dashboard) return state;
      const lastRow = dashboard.layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
      const generated = generateWidget(type, lastRow);
      return {
        dashboards: state.dashboards.map((item) =>
          item.id === dashboard.id
            ? { ...item, layout: [...item.layout, generated.layout], widgets: [...item.widgets, generated.widget] }
            : item
        )
      };
    });
  },
  removeWidget: (widgetId) => {
    set((state) => {
      const dashboard = currentDashboard(state);
      if (!dashboard) return state;
      return {
        dashboards: state.dashboards.map((item) =>
          item.id === dashboard.id
            ? {
                ...item,
                layout: item.layout.filter((layoutItem) => layoutItem.i !== widgetId),
                widgets: item.widgets.filter((widget) => widget.id !== widgetId)
              }
            : item
        )
      };
    });
  },
  toggleWidgetCollapsed: (widgetId) => {
    set((state) => {
      const dashboard = currentDashboard(state);
      if (!dashboard) return state;
      return {
        dashboards: state.dashboards.map((item) =>
          item.id === dashboard.id
            ? {
                ...item,
                widgets: item.widgets.map((widget) =>
                  widget.id === widgetId ? { ...widget, collapsed: !widget.collapsed } : widget
                )
              }
            : item
        )
      };
    });
  },
  updateWidget: (widgetId, patch) => {
    set((state) => {
      const dashboard = currentDashboard(state);
      if (!dashboard) return state;
      return {
        dashboards: state.dashboards.map((item) =>
          item.id === dashboard.id
            ? {
                ...item,
                widgets: item.widgets.map((widget) => (widget.id === widgetId ? { ...widget, ...patch } : widget))
              }
            : item
        )
      };
    });
  },
  saveDashboard: async () => {
    const state = get();
    const dashboard = currentDashboard(state);
    if (!dashboard) return;
    await fetch(`/api/layouts/${dashboard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: dashboard.name,
        description: dashboard.description,
        layout: dashboard.layout,
        widgets: dashboard.widgets
      })
    });
    await get().fetchDashboards();
  },
  clonePresetToNewDashboard: async (name) => {
    const state = get();
    const dashboard = currentDashboard(state);
    if (!dashboard) return;
    const res = await fetch("/api/layouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: dashboard.description,
        isPreset: false,
        layout: dashboard.layout,
        widgets: dashboard.widgets
      })
    });
    if (res.ok) {
      const payload = (await res.json()) as { dashboard: DashboardLayout };
      await get().fetchDashboards();
      set({ activeDashboardId: payload.dashboard.id });
    }
  },
  setAiPanelOpen: (open) => set({ aiPanelOpen: open })
}));

export function parseSeverities(values: string[]): SeverityLevel[] {
  return values
    .map((value) => Number(value))
    .filter((value): value is SeverityLevel => value >= 1 && value <= 5) as SeverityLevel[];
}
