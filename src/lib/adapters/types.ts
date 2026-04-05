import type { EventCategory, NormalizedEvent } from "@/types/events";

export type ProviderAdapter = {
  key: string;
  category: EventCategory;
  fetchEvents: () => Promise<NormalizedEvent[]>;
};

export async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
