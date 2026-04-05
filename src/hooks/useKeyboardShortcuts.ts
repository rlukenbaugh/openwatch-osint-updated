"use client";

import { useEffect } from "react";

type ShortcutsConfig = {
  onAddWidget: () => void;
  onFocusSearch: () => void;
  onRefresh: () => void;
};

export function useKeyboardShortcuts(config: ShortcutsConfig) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key.toLowerCase() === "a") {
        event.preventDefault();
        config.onAddWidget();
      }
      if (event.key === "/") {
        event.preventDefault();
        config.onFocusSearch();
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        config.onRefresh();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [config]);
}
