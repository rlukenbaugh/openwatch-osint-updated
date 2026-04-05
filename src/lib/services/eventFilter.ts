import type { EventFilterState, NormalizedEvent } from "@/types/events";

export function filterEvents(events: NormalizedEvent[], filter: EventFilterState): NormalizedEvent[] {
  const now = Date.now();
  const windowStart = now - filter.timeRangeHours * 60 * 60 * 1000;

  return events.filter((event) => {
    const text = `${event.title} ${event.summary} ${event.tags.join(" ")}`.toLowerCase();
    const queryPass = !filter.query || text.includes(filter.query.toLowerCase());
    const categoryPass = !filter.categories.length || filter.categories.includes(event.category);
    const countryPass = !filter.countries.length || filter.countries.includes(event.location.country);
    const regionPass = !filter.regions.length || filter.regions.includes(event.location.region);
    const severityPass = !filter.severities.length || filter.severities.includes(event.severity);
    const timePass = new Date(event.timestamp).getTime() >= windowStart;

    return queryPass && categoryPass && countryPass && regionPass && severityPass && timePass;
  });
}
