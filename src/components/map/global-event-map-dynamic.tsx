"use client";

import dynamic from "next/dynamic";
import type { GlobalEventMapProps } from "./global-event-map";

export const GlobalEventMapDynamic = dynamic<GlobalEventMapProps>(
  async () => (await import("./global-event-map")).GlobalEventMap,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-md border border-border/60 bg-panel/70 text-sm text-fg/65">
        Loading map layer...
      </div>
    )
  }
);
