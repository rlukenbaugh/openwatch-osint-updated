"use client";

import { ChevronDown, ChevronUp, GripVertical, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { WidgetConfig } from "@/types/dashboard";

type WidgetFrameProps = {
  widget: WidgetConfig;
  onRemove: () => void;
  onToggleCollapsed: () => void;
  onRefresh?: () => void;
  onTitleChange: (title: string) => void;
  onRefreshIntervalChange: (seconds: number) => void;
  children: React.ReactNode;
};

export function WidgetFrame({
  widget,
  onRemove,
  onToggleCollapsed,
  onRefresh,
  onTitleChange,
  onRefreshIntervalChange,
  children
}: WidgetFrameProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-2 border-b border-border/60 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="widget-drag-handle flex items-center gap-2 text-fg/55">
            <GripVertical className="h-4 w-4 cursor-move" />
          </div>
          <CardTitle className="min-w-0 flex-1 text-sm">
            <Input
              value={widget.title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="h-8 border-none bg-transparent px-0 font-semibold focus-visible:ring-0"
              aria-label="Widget title"
            />
          </CardTitle>
          <div className="flex items-center gap-1">
            {onRefresh ? (
              <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh widget">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={onToggleCollapsed} aria-label="Collapse widget">
              {widget.collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove widget">
              <Trash2 className="h-3.5 w-3.5 text-danger" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-fg/70">
          <span>{widget.sourceLabel}</span>
          <label className="flex items-center gap-2">
            refresh
            <input
              type="number"
              min={30}
              step={30}
              className="w-16 rounded border border-border bg-panel px-1 py-0.5 text-right"
              value={widget.refreshIntervalSec}
              onChange={(event) => onRefreshIntervalChange(Number(event.target.value))}
            />
            sec
          </label>
        </div>
      </CardHeader>
      {!widget.collapsed ? <CardContent className="h-[calc(100%-5.25rem)] overflow-auto p-3">{children}</CardContent> : null}
    </Card>
  );
}
