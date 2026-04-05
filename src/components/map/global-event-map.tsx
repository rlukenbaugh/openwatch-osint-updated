"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, CircleMarker } from "react-leaflet";
import L from "leaflet";
import type { EventCategory, NormalizedEvent } from "@/types/events";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type MapPreset = "world" | "middleEast" | "europe" | "northAmerica" | "asia";

const presets: Record<MapPreset, { center: [number, number]; zoom: number }> = {
  world: { center: [20, 10], zoom: 2 },
  middleEast: { center: [30, 45], zoom: 4 },
  europe: { center: [49, 10], zoom: 4 },
  northAmerica: { center: [40, -95], zoom: 4 },
  asia: { center: [30, 95], zoom: 4 }
};

const severityColor: Record<number, string> = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#f59e0b",
  4: "#f97316",
  5: "#ef4444"
};

type ClusterPoint = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  topSeverity: number;
  categories: EventCategory[];
};

function buildClusters(events: NormalizedEvent[]): ClusterPoint[] {
  const map = new Map<string, ClusterPoint>();

  for (const event of events) {
    const latKey = Math.round(event.location.lat * 2) / 2;
    const lngKey = Math.round(event.location.lng * 2) / 2;
    const key = `${latKey}:${lngKey}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        id: key,
        lat: latKey,
        lng: lngKey,
        count: 1,
        topSeverity: event.severity,
        categories: [event.category]
      });
      continue;
    }
    existing.count += 1;
    existing.topSeverity = Math.max(existing.topSeverity, event.severity);
    if (!existing.categories.includes(event.category)) existing.categories.push(event.category);
  }
  return Array.from(map.values());
}

export type GlobalEventMapProps = {
  events: NormalizedEvent[];
  layers: EventCategory[];
  hours: number;
  preset?: MapPreset;
  showClusters?: boolean;
};

export function GlobalEventMap({
  events,
  layers,
  hours,
  preset = "world",
  showClusters = true
}: GlobalEventMapProps) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const filtered = useMemo(
    () =>
      events.filter(
        (event) =>
          layers.includes(event.category) && new Date(event.timestamp).getTime() >= cutoff && event.location.lat && event.location.lng
      ),
    [events, layers, cutoff]
  );

  const clusters = useMemo(() => buildClusters(filtered), [filtered]);
  const view = presets[preset];

  return (
    <div className="h-full min-h-[320px] overflow-hidden rounded-md border border-border/60">
      <MapContainer center={view.center} zoom={view.zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showClusters
          ? clusters.map((cluster) => (
              <CircleMarker
                key={cluster.id}
                center={[cluster.lat, cluster.lng]}
                radius={Math.min(24, 6 + cluster.count)}
                pathOptions={{
                  color: severityColor[cluster.topSeverity] || severityColor[3],
                  weight: 1,
                  fillOpacity: 0.6
                }}
              >
                <Popup>
                  <p className="font-semibold">{cluster.count} events clustered</p>
                  <p>Highest severity: {cluster.topSeverity}</p>
                  <p>Categories: {cluster.categories.join(", ")}</p>
                </Popup>
              </CircleMarker>
            ))
          : filtered.map((event) => (
              <Marker key={event.id} position={[event.location.lat, event.location.lng]} icon={markerIcon}>
                <Popup>
                  <p className="font-semibold">{event.title}</p>
                  <p>{event.summary}</p>
                  <p>Category: {event.category}</p>
                  <p>Severity: {event.severity}</p>
                  <a href={event.url} target="_blank" rel="noreferrer" className="text-cyan-600 underline">
                    Source
                  </a>
                </Popup>
              </Marker>
            ))}
      </MapContainer>
    </div>
  );
}
