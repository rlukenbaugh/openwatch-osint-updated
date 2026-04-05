import type { EventCategory, EventFilterState, SeverityLevel } from "@/types/events";

const defaultFilter: EventFilterState = {
  query: "",
  categories: [],
  countries: [],
  regions: [],
  severities: [],
  timeRangeHours: 24
};

export function parseFilterFromSearchParams(searchParams: URLSearchParams): EventFilterState {
  const categories = (searchParams.get("categories") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as EventCategory[];
  const countries = (searchParams.get("countries") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const regions = (searchParams.get("regions") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const severities = (searchParams.get("severities") || "")
    .split(",")
    .map((item) => Number(item))
    .filter((item): item is SeverityLevel => item >= 1 && item <= 5) as SeverityLevel[];
  const timeRangeHours = Number(searchParams.get("hours") || defaultFilter.timeRangeHours);

  return {
    query: searchParams.get("query") || defaultFilter.query,
    categories,
    countries,
    regions,
    severities,
    timeRangeHours: Number.isNaN(timeRangeHours) ? defaultFilter.timeRangeHours : timeRangeHours
  };
}
