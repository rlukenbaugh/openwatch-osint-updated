import type { PublicWebcam } from "@/types/webcam";

export const curatedPublicWebcams: PublicWebcam[] = [
  {
    id: "nyc-times-square-earthcam",
    name: "Times Square Live Cam",
    provider: "EarthCam",
    pageUrl: "https://www.earthcam.com/usa/newyork/timessquare/",
    location: { country: "United States", region: "North America", city: "New York", lat: 40.758, lng: -73.9855 },
    tags: ["city", "urban", "tourism", "public"]
  },
  {
    id: "dot-ny-trafficcams",
    name: "New York State Traffic Cams",
    provider: "NYSDOT",
    pageUrl: "https://www.dot.ny.gov/trafficcams",
    location: { country: "United States", region: "North America", city: "Albany", lat: 42.6526, lng: -73.7562 },
    tags: ["traffic", "transport", "government", "public"]
  },
  {
    id: "wsdot-seattle-cams",
    name: "Seattle Area Traffic Cams",
    provider: "WSDOT",
    pageUrl: "https://wsdot.com/traffic/seattle/",
    location: { country: "United States", region: "North America", city: "Seattle", lat: 47.6062, lng: -122.3321 },
    tags: ["traffic", "transport", "government", "public"]
  },
  {
    id: "vdot-cctv",
    name: "Virginia DOT CCTV Portal",
    provider: "VDOT",
    pageUrl: "https://www.vdot.virginia.gov/travel/cctv/",
    location: { country: "United States", region: "North America", city: "Richmond", lat: 37.5407, lng: -77.436 },
    tags: ["traffic", "transport", "government", "public"]
  },
  {
    id: "skyline-rome",
    name: "Rome City Center Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/piazza-navona.html",
    location: { country: "Italy", region: "Europe", city: "Rome", lat: 41.9028, lng: 12.4964 },
    tags: ["city", "tourism", "public"]
  },
  {
    id: "skyline-tokyo",
    name: "Tokyo City Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/japan/kanto/tokyo/tokyo.html",
    location: { country: "Japan", region: "East Asia", city: "Tokyo", lat: 35.6762, lng: 139.6503 },
    tags: ["city", "public", "urban"]
  },
  {
    id: "skyline-london-thames",
    name: "London River Thames Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/united-kingdom/england/london/river-thames.html",
    location: { country: "United Kingdom", region: "Europe", city: "London", lat: 51.5074, lng: -0.1278 },
    tags: ["city", "river", "public", "urban"]
  },
  {
    id: "skyline-paris-notre-dame",
    name: "Paris Notre Dame Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/france/ile-de-france/paris/seine-et-notre-dame.html",
    location: { country: "France", region: "Europe", city: "Paris", lat: 48.8566, lng: 2.3522 },
    tags: ["city", "river", "public", "landmark"]
  },
  {
    id: "skyline-berlin-brandenburg",
    name: "Berlin Brandenburg Gate Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/deutschland/hauptstadtregion-berlin-brandenburg/berlin/brandenburg-gate.html",
    location: { country: "Germany", region: "Europe", city: "Berlin", lat: 52.52, lng: 13.405 },
    tags: ["city", "public", "landmark", "urban"]
  },
  {
    id: "skyline-athens-acropolis",
    name: "Athens Acropolis Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/ellada/atiki/athina/acropolis-athens.html",
    location: { country: "Greece", region: "Europe", city: "Athens", lat: 37.9838, lng: 23.7275 },
    tags: ["city", "public", "landmark", "historic"]
  },
  {
    id: "skyline-singapore-harbor",
    name: "Singapore Harbor Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/republic-of-singapore/singapore/singapore/singapore.html",
    location: { country: "Singapore", region: "Southeast Asia", city: "Singapore", lat: 1.3521, lng: 103.8198 },
    tags: ["city", "harbor", "public", "urban"]
  },
  {
    id: "skyline-dubai-princess-tower",
    name: "Dubai Skyline Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/webcam/united-arab-emirates/dubai/dubai/dubai.html",
    location: { country: "United Arab Emirates", region: "Middle East", city: "Dubai", lat: 25.2048, lng: 55.2708 },
    tags: ["city", "public", "urban", "skyline"]
  },
  {
    id: "skyline-cape-town",
    name: "Cape Town Table Mountain Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/south-africa/western-cape/cape-town/cape-town.html",
    location: { country: "South Africa", region: "Africa", city: "Cape Town", lat: -33.9249, lng: 18.4241 },
    tags: ["city", "mountain", "public", "urban"]
  },
  {
    id: "skyline-rio-copacabana",
    name: "Rio Copacabana Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/pt/webcam/brasil/rio-de-janeiro/rio-de-janeiro/copacabana.html",
    location: { country: "Brazil", region: "South America", city: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
    tags: ["city", "beach", "public", "coast"]
  },
  {
    id: "skyline-buenos-aires-obelisk",
    name: "Buenos Aires Obelisk Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/argentina/buenos-aires/buenos-aires/obelisco.html",
    location: { country: "Argentina", region: "South America", city: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
    tags: ["city", "public", "landmark", "urban"]
  },
  {
    id: "skyline-mexico-city-zocalo",
    name: "Mexico City Zocalo Cam",
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/webcam/mexico/federal-district/mexico-city/zocalo.html",
    location: { country: "Mexico", region: "North America", city: "Mexico City", lat: 19.4326, lng: -99.1332 },
    tags: ["city", "public", "landmark", "urban"]
  },
  {
    id: "nasa-iss-stream",
    name: "NASA ISS Live",
    provider: "NASA",
    pageUrl: "https://www.nasa.gov/multimedia/nasatv/iss_ustream.html",
    location: { country: "International", region: "Global", city: "Low Earth Orbit", lat: 0, lng: 0 },
    tags: ["space", "science", "public"]
  },
  {
    id: "harbour-bridge-sydney",
    name: "Sydney Harbour Live Cam",
    provider: "EarthCam",
    pageUrl: "https://www.earthcam.com/world/australia/sydney/",
    location: { country: "Australia", region: "Oceania", city: "Sydney", lat: -33.8688, lng: 151.2093 },
    tags: ["city", "harbor", "public"]
  }
];

export function searchWebcams({
  query,
  region,
  country,
  tag
}: {
  query?: string;
  region?: string;
  country?: string;
  tag?: string;
}): PublicWebcam[] {
  return curatedPublicWebcams
    .filter((camera) => {
      const combined = `${camera.name} ${camera.provider} ${camera.location.city} ${camera.tags.join(" ")}`.toLowerCase();
      const queryPass = !query || combined.includes(query.toLowerCase());
      const regionPass = !region || camera.location.region.toLowerCase() === region.toLowerCase();
      const countryPass = !country || camera.location.country.toLowerCase() === country.toLowerCase();
      const tagPass = !tag || camera.tags.some((item) => item.toLowerCase() === tag.toLowerCase());
      return queryPass && regionPass && countryPass && tagPass;
    })
    .map((camera) => ({
      ...camera,
      externalId: camera.id,
      providerKey: "CURATED" as const
    }));
}
