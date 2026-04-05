import type { EventCategory } from "@/types/events";

export type DashboardLayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

export type WidgetType =
  | "news"
  | "earthquakes"
  | "weather"
  | "aviation"
  | "cyber"
  | "market"
  | "map"
  | "webcams"
  | "keywordAlert"
  | "aiSummary";

export type WidgetConfig = {
  id: string;
  type: WidgetType;
  title: string;
  sourceLabel: string;
  refreshIntervalSec: number;
  filters: {
    categories?: EventCategory[];
    keyword?: string;
    minSeverity?: number;
    region?: string;
    country?: string;
  };
  collapsed: boolean;
};

export type DashboardLayout = {
  id: string;
  name: string;
  description?: string | null;
  isPreset: boolean;
  layout: DashboardLayoutItem[];
  widgets: WidgetConfig[];
};

export type DashboardPresetSummary = {
  id: string;
  name: string;
  description?: string | null;
};
