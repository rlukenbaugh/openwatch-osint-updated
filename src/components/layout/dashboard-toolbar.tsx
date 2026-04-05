"use client";

import { Plus, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DashboardLayout, WidgetType } from "@/types/dashboard";
import type { EventCategory, SeverityLevel } from "@/types/events";

type DashboardToolbarProps = {
  dashboards: DashboardLayout[];
  activeDashboardId: string | null;
  onDashboardChange: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  categories: EventCategory[];
  onCategoriesChange: (categories: EventCategory[]) => void;
  severities: SeverityLevel[];
  onSeveritiesChange: (severities: SeverityLevel[]) => void;
  timeRangeHours: number;
  onTimeRangeChange: (hours: number) => void;
  onAddWidget: (type: WidgetType) => void;
  onSaveLayout: () => void;
  onClearFilters: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
};

const widgetOptions: Array<{ value: WidgetType; label: string }> = [
  { value: "news", label: "News Feed" },
  { value: "earthquakes", label: "Earthquake Feed" },
  { value: "weather", label: "Weather Alerts" },
  { value: "aviation", label: "Flight Summary" },
  { value: "cyber", label: "Cyber Alerts" },
  { value: "market", label: "Market Snapshot" },
  { value: "map", label: "Global Map" },
  { value: "webcams", label: "Webcam Monitor" },
  { value: "keywordAlert", label: "Keyword Alert" },
  { value: "aiSummary", label: "AI Summary" }
];

const categoryOptions: EventCategory[] = ["news", "earthquake", "weather", "aviation", "cyber", "market"];

export function DashboardToolbar({
  dashboards,
  activeDashboardId,
  onDashboardChange,
  query,
  onQueryChange,
  categories,
  onCategoriesChange,
  severities,
  onSeveritiesChange,
  timeRangeHours,
  onTimeRangeChange,
  onAddWidget,
  onSaveLayout,
  onClearFilters,
  searchInputRef
}: DashboardToolbarProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border/70 bg-panel/85 p-3 shadow-panel">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-1 text-xs text-fg/70">
          Deck preset
          <Select value={activeDashboardId || ""} onChange={(event) => onDashboardChange(event.target.value)}>
            {dashboards.map((dashboard) => (
              <option key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1 text-xs text-fg/70 xl:col-span-2">
          Search (`/`)
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-fg/45" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Keyword, tags, title..."
              className="pl-8"
            />
          </div>
        </label>

        <label className="space-y-1 text-xs text-fg/70">
          Time range
          <Select value={String(timeRangeHours)} onChange={(event) => onTimeRangeChange(Number(event.target.value))}>
            <option value="1">Last 1h</option>
            <option value="6">Last 6h</option>
            <option value="12">Last 12h</option>
            <option value="24">Last 24h</option>
            <option value="48">Last 48h</option>
            <option value="72">Last 72h</option>
          </Select>
        </label>

        <label className="space-y-1 text-xs text-fg/70">
          Add widget (`A`)
          <Select onChange={(event) => onAddWidget(event.target.value as WidgetType)} defaultValue="">
            <option value="" disabled>
              Select widget
            </option>
            {widgetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((category) => {
          const active = categories.includes(category);
          return (
            <button
              key={category}
              onClick={() =>
                onCategoriesChange(active ? categories.filter((item) => item !== category) : [...categories, category])
              }
              className={`rounded-full border px-2.5 py-1 text-xs ${
                active ? "border-accent bg-accent/15 text-accent" : "border-border text-fg/70"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((severity) => {
          const active = severities.includes(severity as SeverityLevel);
          return (
            <button
              key={severity}
              onClick={() =>
                onSeveritiesChange(
                  active
                    ? severities.filter((item) => item !== severity)
                    : [...severities, severity as SeverityLevel]
                )
              }
              className={`rounded-md border px-2 py-1 text-xs ${
                active ? "border-warning bg-warning/20 text-warning" : "border-border text-fg/65"
              }`}
            >
              Severity {severity}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onSaveLayout} className="gap-1">
          <Save className="h-3.5 w-3.5" />
          Save layout
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAddWidget("news")} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Quick add news
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
        <span className="text-xs text-fg/60">Shortcut: `R` to refresh feeds</span>
      </div>
    </section>
  );
}
