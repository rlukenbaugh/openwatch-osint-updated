"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GridStack, type GridStackNode } from "gridstack";
import type { DashboardLayout, DashboardLayoutItem, WidgetConfig } from "@/types/dashboard";
import type { EventCategory, NormalizedEvent } from "@/types/events";
import { FeedWidgetContent } from "@/components/widgets/feed-widget-content";
import { MarketWidgetContent } from "@/components/widgets/market-widget-content";
import { KeywordAlertWidgetContent } from "@/components/widgets/keyword-alert-widget-content";
import { AiSummaryWidgetContent } from "@/components/widgets/ai-summary-widget-content";
import { MapWidgetContent } from "@/components/widgets/map-widget-content";
import { WebcamWidgetContent } from "@/components/widgets/webcam-widget-content";
import { WidgetFrame } from "@/components/widgets/widget-frame";

const GRID_COLUMNS = 12;
const GRID_CELL_HEIGHT = 72;
const GRID_MARGIN = 12;

type DashboardGridProps = {
  dashboard: DashboardLayout;
  events: NormalizedEvent[];
  mapLayers: EventCategory[];
  mapHours: number;
  onLayoutChange: (layout: DashboardLayoutItem[]) => void;
  onRemoveWidget: (widgetId: string) => void;
  onToggleWidget: (widgetId: string) => void;
  onUpdateWidget: (widgetId: string, patch: Partial<WidgetConfig>) => void;
  onWidgetRefresh: () => void;
};

function renderWidgetContent(
  widget: WidgetConfig,
  events: NormalizedEvent[],
  mapLayers: EventCategory[],
  mapHours: number,
  onUpdateWidget: (patch: Partial<WidgetConfig>) => void
) {
  switch (widget.type) {
    case "news":
      return <FeedWidgetContent events={events} category="news" />;
    case "earthquakes":
      return <FeedWidgetContent events={events} category="earthquake" />;
    case "weather":
      return <FeedWidgetContent events={events} category="weather" />;
    case "aviation":
      return <FeedWidgetContent events={events} category="aviation" />;
    case "cyber":
      return <FeedWidgetContent events={events} category="cyber" />;
    case "market":
      return <MarketWidgetContent events={events} />;
    case "map":
      return <MapWidgetContent events={events} layers={mapLayers} hours={mapHours} />;
    case "webcams":
      return <WebcamWidgetContent />;
    case "keywordAlert":
      return (
        <KeywordAlertWidgetContent
          events={events}
          keyword={widget.filters.keyword || ""}
          onKeywordChange={(keyword) =>
            onUpdateWidget({
              filters: {
                ...widget.filters,
                keyword
              }
            })
          }
        />
      );
    case "aiSummary":
      return <AiSummaryWidgetContent events={events} />;
    default:
      return <p className="text-sm text-fg/65">Unsupported widget type.</p>;
  }
}

function defaultLayoutFor(widgetId: string): DashboardLayoutItem {
  return {
    i: widgetId,
    x: 0,
    y: 0,
    w: 4,
    h: 4,
    minW: 2,
    minH: 2
  };
}

function normalizeNode(
  node: GridStackNode,
  fallback: DashboardLayoutItem | undefined
): DashboardLayoutItem | null {
  const itemId = typeof node.id === "string" ? node.id : fallback?.i;
  if (!itemId) {
    return null;
  }

  return {
    i: itemId,
    x: node.x ?? fallback?.x ?? 0,
    y: node.y ?? fallback?.y ?? 0,
    w: node.w ?? fallback?.w ?? 4,
    h: node.h ?? fallback?.h ?? 4,
    minW: fallback?.minW ?? 2,
    minH: fallback?.minH ?? 2
  };
}

function readLayout(grid: GridStack, layoutMap: Map<string, DashboardLayoutItem>): DashboardLayoutItem[] {
  return grid.engine.nodes
    .map((node) => normalizeNode(node, layoutMap.get(String(node.id ?? ""))))
    .filter((item): item is DashboardLayoutItem => Boolean(item))
    .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
}

export function DashboardGrid({
  dashboard,
  events,
  mapLayers,
  mapHours,
  onLayoutChange,
  onRemoveWidget,
  onToggleWidget,
  onUpdateWidget,
  onWidgetRefresh
}: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onLayoutChangeRef = useRef(onLayoutChange);
  const [gridError, setGridError] = useState<string | null>(null);
  const layoutMap = useMemo(
    () => new Map(dashboard.layout.map((item) => [item.i, item])),
    [dashboard.layout]
  );
  const layoutMapRef = useRef(layoutMap);
  const gridIdentity = useMemo(
    () => `${dashboard.id}:${dashboard.widgets.map((widget) => widget.id).join(",")}`,
    [dashboard.id, dashboard.widgets]
  );

  onLayoutChangeRef.current = onLayoutChange;
  layoutMapRef.current = layoutMap;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let grid: GridStack | null = null;
    try {
      setGridError(null);
      grid = GridStack.init(
        {
          column: GRID_COLUMNS,
          cellHeight: GRID_CELL_HEIGHT,
          margin: GRID_MARGIN,
          float: true,
          animate: true,
          resizable: {
            handles: "all"
          },
          draggable: {
            handle: ".widget-drag-handle"
          },
          placeholderClass: "placeholder-content"
        },
        container
      );

      const elements = Array.from(container.querySelectorAll<HTMLElement>(".grid-stack-item"));
      grid.batchUpdate();
      for (const element of elements) {
        const widgetId = element.dataset.widgetId;
        if (!widgetId) {
          continue;
        }

        grid.makeWidget(element);
      }
      grid.batchUpdate(false);

      const persistLayout = () => {
        if (!grid || grid.isIgnoreChangeCB()) {
          return;
        }

        onLayoutChangeRef.current(readLayout(grid, layoutMapRef.current));
      };

      grid.on("change", persistLayout);
      grid.on("dragstop", persistLayout);
      grid.on("resizestop", persistLayout);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown grid initialization error";
      console.error("Dashboard grid failed to initialize", error);
      setGridError(message);
      grid?.destroy(false);
      return;
    }

    return () => {
      grid?.off("change");
      grid?.off("dragstop");
      grid?.off("resizestop");
      grid?.destroy(false);
    };
  }, [gridIdentity]);

  if (gridError) {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
          <div>
            <p className="text-sm font-semibold">Dashboard grid could not load.</p>
            <p className="text-sm text-fg/75">
              The widget layout engine failed to initialize. The rest of the app is still available.
            </p>
            <p className="mt-2 text-xs text-fg/65">{gridError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-stack" ref={containerRef}>
      {dashboard.widgets.map((widget) => (
        (() => {
          const layout = layoutMap.get(widget.id) ?? defaultLayoutFor(widget.id);
          return (
        <div
          key={widget.id}
          className="grid-stack-item"
          data-widget-id={widget.id}
          gs-id={layout.i}
          gs-x={layout.x}
          gs-y={layout.y}
          gs-w={layout.w}
          gs-h={layout.h}
          gs-min-w={layout.minW ?? 2}
          gs-min-h={layout.minH ?? 2}
        >
          <div className="grid-stack-item-content">
            <WidgetFrame
              widget={widget}
              onRemove={() => onRemoveWidget(widget.id)}
              onToggleCollapsed={() => onToggleWidget(widget.id)}
              onRefresh={onWidgetRefresh}
              onTitleChange={(title) => onUpdateWidget(widget.id, { title })}
              onRefreshIntervalChange={(refreshIntervalSec) => onUpdateWidget(widget.id, { refreshIntervalSec })}
            >
              {renderWidgetContent(widget, events, mapLayers, mapHours, (patch) => onUpdateWidget(widget.id, patch))}
            </WidgetFrame>
          </div>
        </div>
          );
        })()
      ))}
    </div>
  );
}
