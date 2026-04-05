"use client";

import type { EventCategory } from "@/types/events";

type MapControlBarProps = {
  layers: EventCategory[];
  onLayersChange: (layers: EventCategory[]) => void;
  hours: number;
  onHoursChange: (hours: number) => void;
  regionPreset: "world" | "middleEast" | "europe" | "northAmerica" | "asia";
  onRegionPresetChange: (preset: "world" | "middleEast" | "europe" | "northAmerica" | "asia") => void;
};

const categories: EventCategory[] = ["news", "earthquake", "weather", "aviation", "cyber", "market"];

export function MapControlBar({
  layers,
  onLayersChange,
  hours,
  onHoursChange,
  regionPreset,
  onRegionPresetChange
}: MapControlBarProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border/70 bg-panel/85 p-3">
      <div className="grid gap-2 md:grid-cols-3">
        <label className="text-xs text-fg/70">
          Time filter
          <select
            className="mt-1 h-9 w-full rounded-md border border-border bg-panel px-2 text-sm"
            value={hours}
            onChange={(event) => onHoursChange(Number(event.target.value))}
          >
            <option value={1}>Last 1h</option>
            <option value={6}>Last 6h</option>
            <option value={12}>Last 12h</option>
            <option value={24}>Last 24h</option>
            <option value={48}>Last 48h</option>
          </select>
        </label>

        <label className="text-xs text-fg/70">
          Region preset
          <select
            className="mt-1 h-9 w-full rounded-md border border-border bg-panel px-2 text-sm"
            value={regionPreset}
            onChange={(event) => onRegionPresetChange(event.target.value as MapControlBarProps["regionPreset"])}
          >
            <option value="world">World</option>
            <option value="middleEast">Middle East</option>
            <option value="europe">Europe</option>
            <option value="northAmerica">North America</option>
            <option value="asia">Asia</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = layers.includes(category);
          return (
            <button
              key={category}
              className={`rounded-md border px-2 py-1 text-xs ${
                active ? "border-accent bg-accent/15 text-accent" : "border-border text-fg/70"
              }`}
              onClick={() =>
                onLayersChange(active ? layers.filter((item) => item !== category) : [...layers, category])
              }
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}
