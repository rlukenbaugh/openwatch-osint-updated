import type { EventCategory } from "@/types/events";

export type AlertRule = {
  id: string;
  name: string;
  keyword?: string | null;
  category?: EventCategory | null;
  minSeverity?: number | null;
  country?: string | null;
  enabled: boolean;
  lastTriggeredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AlertNotification = {
  id: string;
  ruleId?: string | null;
  title: string;
  body: string;
  eventId: string;
  sourceUrl?: string | null;
  read: boolean;
  createdAt: string;
};
