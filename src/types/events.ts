export type EventCategory =
  | "news"
  | "earthquake"
  | "weather"
  | "aviation"
  | "cyber"
  | "market";

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

export type NormalizedEvent = {
  id: string;
  source: string;
  category: EventCategory;
  title: string;
  summary: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  severity: SeverityLevel;
  timestamp: string;
  url: string;
  tags: string[];
};

export type EventFilterState = {
  query: string;
  categories: EventCategory[];
  countries: string[];
  regions: string[];
  severities: SeverityLevel[];
  timeRangeHours: number;
};
