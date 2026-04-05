import { createMockEvents } from "@/lib/mock/mockEvents";
import type { ProviderAdapter } from "@/lib/adapters/types";
import type { NormalizedEvent, SeverityLevel } from "@/types/events";

type KevItem = {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription?: string;
  requiredAction?: string;
};

type KevResponse = {
  vulnerabilities: KevItem[];
};

function cyberSeverity(text: string): SeverityLevel {
  const lower = text.toLowerCase();
  if (/(rce|remote code execution|critical|wormable)/.test(lower)) return 5;
  if (/(privilege|escalation|ransomware|actively exploited)/.test(lower)) return 4;
  if (/(dos|denial|spoofing|exposure)/.test(lower)) return 3;
  return 2;
}

export const cyberAdapter: ProviderAdapter = {
  key: "cyber",
  category: "cyber",
  fetchEvents: async (): Promise<NormalizedEvent[]> => {
    try {
      const response = await fetch(
        "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        { next: { revalidate: 600 } }
      );
      if (!response.ok) throw new Error("CISA fetch failed");

      const data = (await response.json()) as KevResponse;
      return data.vulnerabilities.slice(0, 30).map((item) => {
        const summary = item.shortDescription || `${item.vendorProject} ${item.product} vulnerability advisory.`;
        const severity = cyberSeverity(`${item.vulnerabilityName} ${summary}`);

        return {
          id: item.cveID,
          source: "CISA KEV",
          category: "cyber",
          title: `${item.cveID} - ${item.vulnerabilityName}`,
          summary,
          location: {
            lat: 38.9072,
            lng: -77.0369,
            country: "United States",
            region: "North America"
          },
          severity,
          timestamp: new Date(item.dateAdded).toISOString(),
          url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
          tags: ["cyber", item.vendorProject, item.product]
        };
      });
    } catch {
      return createMockEvents("cyber", 10, "CISA (Mock Fallback)");
    }
  }
};
