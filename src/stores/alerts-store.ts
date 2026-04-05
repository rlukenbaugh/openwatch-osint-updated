"use client";

import { create } from "zustand";
import type { AlertNotification, AlertRule } from "@/types/alerts";

type AlertsState = {
  rules: AlertRule[];
  notifications: AlertNotification[];
  loading: boolean;
  error: string | null;
  fetchAlerts: (evaluate?: boolean) => Promise<void>;
  createRule: (rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt" | "lastTriggeredAt">) => Promise<void>;
  updateRule: (rule: AlertRule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  markNotificationRead: (id: string, read: boolean) => Promise<void>;
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  rules: [],
  notifications: [],
  loading: false,
  error: null,
  fetchAlerts: async (evaluate = false) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/alerts${evaluate ? "?evaluate=1" : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load alerts");
      const payload = (await res.json()) as {
        rules: AlertRule[];
        notifications: AlertNotification[];
      };
      set({
        rules: payload.rules,
        notifications: payload.notifications,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown alerts error",
        loading: false
      });
    }
  },
  createRule: async (rule) => {
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule)
    });
    await get().fetchAlerts();
  },
  updateRule: async (rule) => {
    await fetch(`/api/alerts/${rule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule)
    });
    await get().fetchAlerts();
  },
  deleteRule: async (id) => {
    await fetch(`/api/alerts/${id}`, {
      method: "DELETE"
    });
    await get().fetchAlerts();
  },
  markNotificationRead: async (id, read) => {
    await fetch(`/api/alerts/${id}?kind=notification`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read })
    });
    await get().fetchAlerts();
  }
}));
