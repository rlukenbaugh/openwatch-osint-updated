import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type WidgetType =
  | "news"
  | "earthquakes"
  | "weather"
  | "aviation"
  | "cyber"
  | "market"
  | "map"
  | "webcams"
  | "keywordAlert"
  | "aiSummary";

const createWidget = (
  id: string,
  type: WidgetType,
  title: string,
  sourceLabel: string,
  x: number,
  y: number,
  w: number,
  h: number
) => ({
  layout: { i: id, x, y, w, h, minW: 2, minH: 2 },
  widget: {
    id,
    type,
    title,
    sourceLabel,
    refreshIntervalSec: 300,
    collapsed: false,
    filters: {}
  }
});

const presets = [
  {
    name: "Global Command Center",
    description: "Broad monitoring across major public intelligence feeds.",
    widgets: [
      createWidget("map-1", "map", "Global Activity Map", "Unified Feed", 0, 0, 8, 8),
      createWidget("news-1", "news", "Breaking News", "Global RSS", 8, 0, 4, 4),
      createWidget("earth-1", "earthquakes", "Earthquake Feed", "USGS", 8, 4, 4, 4),
      createWidget("ai-1", "aiSummary", "AI Analyst Snapshot", "Local RAG", 0, 8, 12, 4)
    ]
  },
  {
    name: "Conflict Monitor",
    description: "Conflict-centric deck combining news, aviation, and cyber advisories.",
    widgets: [
      createWidget("map-2", "map", "Conflict Hotspots", "Unified Feed", 0, 0, 7, 8),
      createWidget("news-2", "news", "Conflict News Stream", "Global RSS", 7, 0, 5, 4),
      createWidget("avi-1", "aviation", "Aviation Summary", "OpenSky Demo", 7, 4, 5, 4),
      createWidget("cyber-1", "cyber", "Cyber Advisories", "CISA", 0, 8, 6, 4),
      createWidget("keyword-1", "keywordAlert", "Keyword Triggers", "Rules Engine", 6, 8, 6, 4)
    ]
  },
  {
    name: "Weather and Hazards",
    description: "Natural hazards watchboard for weather warnings and seismic activity.",
    widgets: [
      createWidget("map-3", "map", "Hazard Map", "Unified Feed", 0, 0, 8, 8),
      createWidget("weather-1", "weather", "Weather Alerts", "NWS", 8, 0, 4, 4),
      createWidget("earth-2", "earthquakes", "Seismic Activity", "USGS", 8, 4, 4, 4),
      createWidget("news-3", "news", "Weather Coverage", "Global RSS", 0, 8, 12, 4)
    ]
  },
  {
    name: "Markets and Supply Chain",
    description: "Tracks market context and transport indicators.",
    widgets: [
      createWidget("market-1", "market", "Market Snapshot", "Stooq + Demo", 0, 0, 4, 4),
      createWidget("avi-2", "aviation", "Flight Tracker Summary", "OpenSky Demo", 4, 0, 4, 4),
      createWidget("news-4", "news", "Logistics Headlines", "Global RSS", 8, 0, 4, 4),
      createWidget("map-4", "map", "Transport and Market Impacts", "Unified Feed", 0, 4, 12, 8)
    ]
  },
  {
    name: "Cyber Watch",
    description: "Cyber-focused operational overview with related global events.",
    widgets: [
      createWidget("cyber-2", "cyber", "Security Advisories", "CISA", 0, 0, 6, 4),
      createWidget("news-5", "news", "Cyber News", "Global RSS", 6, 0, 6, 4),
      createWidget("map-5", "map", "Cyber Event Geo View", "Unified Feed", 0, 4, 8, 8),
      createWidget("keyword-2", "keywordAlert", "Ransomware Keywords", "Rules Engine", 8, 4, 4, 4),
      createWidget("ai-2", "aiSummary", "Threat Summary", "Local RAG", 8, 8, 4, 4)
    ]
  }
];

type SeedProviderSource = {
  key: string;
  name: string;
  kind: "EVENT" | "WEBCAM" | "TOOL" | "LINK";
  category: string;
  description: string;
  requiresApiKey?: boolean;
  command?: string;
  launchUrl?: string;
  sourceUrl?: string;
  metadataJson?: string;
};

const providerSources: SeedProviderSource[] = [
  {
    key: "NEWS",
    name: "Global News Feed",
    kind: "EVENT",
    category: "news",
    description: "Reuters world RSS headlines normalized into the event stream.",
    sourceUrl: "https://www.reutersagency.com/en/reutersbest/reuters-world-news/"
  },
  {
    key: "EARTHQUAKES",
    name: "USGS Earthquakes",
    kind: "EVENT",
    category: "earthquake",
    description: "USGS seismic feed for global earthquake activity.",
    sourceUrl: "https://earthquake.usgs.gov/earthquakes/feed/"
  },
  {
    key: "WEATHER",
    name: "NOAA Weather Alerts",
    kind: "EVENT",
    category: "weather",
    description: "NOAA and NWS alert coverage for weather-driven hazards.",
    sourceUrl: "https://alerts.weather.gov/"
  },
  {
    key: "AVIATION",
    name: "OpenSky Aviation Summary",
    kind: "EVENT",
    category: "aviation",
    description: "Aviation movement summaries from the OpenSky states endpoint.",
    sourceUrl: "https://opensky-network.org/"
  },
  {
    key: "CYBER",
    name: "CISA Cyber Advisories",
    kind: "EVENT",
    category: "cyber",
    description: "Known exploited vulnerabilities and public cyber advisories.",
    sourceUrl: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
  },
  {
    key: "MARKET",
    name: "Market Snapshot",
    kind: "EVENT",
    category: "market",
    description: "Market context and economic indicators from Stooq.",
    sourceUrl: "https://stooq.com/"
  },
  {
    key: "CURATED",
    name: "Curated Global Webcams",
    kind: "WEBCAM",
    category: "webcams",
    description: "Fallback public webcam registry for worldwide coverage."
  },
  {
    key: "WSDOT",
    name: "WSDOT Cameras",
    kind: "WEBCAM",
    category: "webcams",
    description: "Washington State DOT traffic cameras."
  },
  {
    key: "CALTRANS_CCTV",
    name: "Caltrans CCTV",
    kind: "WEBCAM",
    category: "webcams",
    description: "California DOT CCTV traffic cameras."
  },
  {
    key: "ONTARIO_511",
    name: "Ontario 511",
    kind: "WEBCAM",
    category: "webcams",
    description: "Ontario 511 public roadway cameras."
  },
  {
    key: "NZTA_TRAFFIC",
    name: "NZTA Traffic Cameras",
    kind: "WEBCAM",
    category: "webcams",
    description: "New Zealand transport camera feeds."
  },
  {
    key: "DIGITRAFFIC_FI",
    name: "Digitraffic Finland",
    kind: "WEBCAM",
    category: "webcams",
    description: "Finnish weather and roadway cameras."
  },
  {
    key: "VANCOUVER_OPENDATA",
    name: "Vancouver Open Data",
    kind: "WEBCAM",
    category: "webcams",
    description: "Vancouver public webcam coverage."
  },
  {
    key: "OHGO",
    name: "OHGO Cameras",
    kind: "WEBCAM",
    category: "webcams",
    description: "Ohio traffic camera endpoints.",
    requiresApiKey: true
  },
  {
    key: "FAA_WEATHERCAMS",
    name: "FAA WeatherCams",
    kind: "WEBCAM",
    category: "webcams",
    description: "FAA weather camera network.",
    requiresApiKey: true
  },
  {
    key: "QGIS",
    name: "QGIS Desktop",
    kind: "TOOL",
    category: "geospatial",
    description: "GIS mapping and layer analysis workspace.",
    command: "C:\\Program Files\\QGIS 3.34.0\\bin\\qgis-bin.exe",
    metadataJson: JSON.stringify({ launchGroup: "desktop-tools" })
  },
  {
    key: "SDRSHARP",
    name: "SDRSharp",
    kind: "TOOL",
    category: "signals",
    description: "RF monitoring and signal analysis.",
    command: "C:\\SDRSharp\\SDRSharp.exe",
    metadataJson: JSON.stringify({ launchGroup: "desktop-tools" })
  },
  {
    key: "VIRTUAL_RADAR",
    name: "Virtual Radar Server",
    kind: "TOOL",
    category: "aviation",
    description: "Aircraft tracking workspace for ADS-B receivers.",
    command: "C:\\Program Files\\VirtualRadar\\VirtualRadar.exe",
    metadataJson: JSON.stringify({ launchGroup: "desktop-tools" })
  },
  {
    key: "GOOGLE_EARTH",
    name: "Google Earth Pro",
    kind: "TOOL",
    category: "geospatial",
    description: "Historical satellite imagery and quick visual confirmation.",
    command: "C:\\Program Files\\Google\\Google Earth Pro\\client\\googleearth.exe",
    metadataJson: JSON.stringify({ launchGroup: "desktop-tools" })
  },
  {
    key: "MARINETRAFFIC",
    name: "MarineTraffic",
    kind: "LINK",
    category: "maritime",
    description: "Public ship tracking in the browser.",
    launchUrl: "https://www.marinetraffic.com/",
    metadataJson: JSON.stringify({ launchGroup: "browser-tools" })
  },
  {
    key: "VESSELFINDER",
    name: "VesselFinder",
    kind: "LINK",
    category: "maritime",
    description: "Browser-based vessel tracking and movement history.",
    launchUrl: "https://www.vesselfinder.com/",
    metadataJson: JSON.stringify({ launchGroup: "browser-tools" })
  },
  {
    key: "ADSB_EXCHANGE",
    name: "ADSBexchange Globe",
    kind: "LINK",
    category: "aviation",
    description: "Browser-based aircraft map for quick situational awareness.",
    launchUrl: "https://globe.adsbexchange.com/",
    metadataJson: JSON.stringify({ launchGroup: "browser-tools" })
  }
] ;

const workspacePresets = [
  {
    key: "global-ops",
    name: "Global Ops",
    description: "Balanced 2x2 command view with mission summary, launchpad, events, and sources.",
    isSystem: true,
    sourceKeysJson: JSON.stringify(["NEWS", "EARTHQUAKES", "WEATHER", "AVIATION", "CYBER", "MARKET", "CURATED"]),
    panelLayoutJson: JSON.stringify([
      { id: "mission", title: "Mission Snapshot", subtitle: "Current deck and active sources", type: "mission" },
      { id: "launchpad", title: "Tool Launcher", subtitle: "Desktop tools and browser targets", type: "launchpad" },
      { id: "events", title: "Recent Event Feed", subtitle: "Latest activity in selected mission lanes", type: "eventFeed" },
      { id: "sources", title: "Source Registry", subtitle: "Mission-enabled providers and quick toggles", type: "sources" }
    ])
  },
  {
    key: "air-maritime",
    name: "Air and Maritime",
    description: "One-screen deck focused on aircraft, ship movement, and map validation workflows.",
    isSystem: true,
    sourceKeysJson: JSON.stringify(["AVIATION", "MARKET", "NEWS", "MARINETRAFFIC", "VESSELFINDER", "ADSB_EXCHANGE", "VIRTUAL_RADAR"]),
    panelLayoutJson: JSON.stringify([
      { id: "mission", title: "Air and Maritime Mission", subtitle: "Flight, ship, and logistics watch", type: "mission" },
      { id: "launchpad", title: "Air and Sea Tools", subtitle: "Virtual Radar, browser tracking, and geospatial pivots", type: "launchpad" },
      { id: "events", title: "Movement Indicators", subtitle: "Recent aviation, market, and news signals", type: "eventFeed", config: { categories: ["aviation", "market", "news"] } },
      { id: "sources", title: "Mission Sources", subtitle: "Launch-ready sources for the current deck", type: "sources" }
    ])
  },
  {
    key: "geo-signals",
    name: "Geo and Signals",
    description: "Map-centric operating view for geospatial and RF workflows.",
    isSystem: true,
    sourceKeysJson: JSON.stringify(["WEATHER", "EARTHQUAKES", "NEWS", "QGIS", "GOOGLE_EARTH", "SDRSHARP"]),
    panelLayoutJson: JSON.stringify([
      { id: "mission", title: "Geo and Signals Mission", subtitle: "Map, imagery, and RF collection stack", type: "mission" },
      { id: "launchpad", title: "Geo and RF Tools", subtitle: "Open QGIS, Earth, and SDR tools fast", type: "launchpad" },
      { id: "events", title: "Hazards and Geography", subtitle: "Weather, seismic, and location-driven signals", type: "eventFeed", config: { categories: ["weather", "earthquake", "news"] } },
      { id: "sources", title: "Source Registry", subtitle: "Geospatial and signal mission sources", type: "sources" }
    ])
  }
];

async function main() {
  await prisma.workspacePreset.deleteMany();
  await prisma.providerSource.deleteMany();
  await prisma.alertNotification.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.dashboard.deleteMany();

  for (const preset of presets) {
    const layout = preset.widgets.map((w) => w.layout);
    const widgets = preset.widgets.map((w) => w.widget);

    await prisma.dashboard.create({
      data: {
        name: preset.name,
        description: preset.description,
        isPreset: true,
        layoutJson: JSON.stringify(layout),
        widgetsJson: JSON.stringify(widgets)
      }
    });
  }

  await prisma.alertRule.createMany({
    data: [
      {
        name: "High Severity Hazards",
        category: "weather",
        minSeverity: 4,
        enabled: true
      },
      {
        name: "Middle East Conflict Keywords",
        keyword: "missile",
        category: "news",
        enabled: true
      },
      {
        name: "US Cyber Advisories",
        category: "cyber",
        country: "United States",
        minSeverity: 3,
        enabled: true
      }
    ]
  });

  await prisma.appSetting.upsert({
    where: { key: "defaultDashboardName" },
    update: { value: "Global Command Center" },
    create: { key: "defaultDashboardName", value: "Global Command Center" }
  });

  await prisma.appSetting.upsert({
    where: { key: "defaultWorkspacePresetKey" },
    update: { value: "global-ops" },
    create: { key: "defaultWorkspacePresetKey", value: "global-ops" }
  });

  await prisma.providerSource.createMany({
    data: providerSources.map((source) => ({
      key: source.key,
      name: source.name,
      kind: source.kind,
      category: source.category,
      description: source.description,
      enabled: true,
      isDefault: true,
      requiresApiKey: source.requiresApiKey ?? false,
      command: source.command ?? null,
      argsJson: "[]",
      launchUrl: source.launchUrl ?? null,
      sourceUrl: source.sourceUrl ?? null,
      metadataJson: source.metadataJson ?? "{}"
    }))
  });

  for (const preset of workspacePresets) {
    await prisma.workspacePreset.create({ data: preset });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
