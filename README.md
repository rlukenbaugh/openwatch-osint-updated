# OpenWatch OSINT Dashboard (MVP)

OpenWatch is a browser-based OSINT command center MVP for monitoring public, near-real-time events.  
It provides modular dashboard widgets, map-based event exploration, alert rules, an OSINT workspace, and an AI analyst panel constrained to loaded data.

## Stack

- Next.js (App Router) + TypeScript
- React + Tailwind CSS
- Zustand for client state
- Prisma ORM + SQLite
- React Grid Layout for widget layout system
- Leaflet + React Leaflet for map rendering
- OpenAI API placeholder with deterministic local fallback

## MVP Features Included

- Drag/drop + resizable dashboard widgets
- Save/load layouts from DB
- Workspace page with 2x2 mission presets and external tool launchers
- Light/dark mode
- Widget types:
  - News feed
  - Earthquake feed
  - Weather alerts
  - Flight tracker summary
  - Cyber/security advisories
  - Market snapshot
  - Global map
  - Keyword alert
  - AI summary
- Interactive map:
  - World event plotting
  - Category layer toggles
  - Time filtering
  - Severity coloring
  - Region zoom presets
  - Marker grouping (cluster-style buckets)
- Unified normalized event schema + swappable provider adapters
- Search/filter by keyword/category/location/severity/time
- In-app alert rules and notification feed
- AI analyst side panel with source URL citations on every response
- Public webcam finder and availability monitor (curated public sources only)
- Webcam connector pipeline with Prisma-backed source catalog and monitoring history
- Tool/source registry for workspace mission packs and one-click launch settings

## Normalized Event Schema

All provider events are normalized to:

```ts
{
  id,
  source,
  category,
  title,
  summary,
  location: { lat, lng, country, region },
  severity,
  timestamp,
  url,
  tags
}
```

## Public Data Providers (MVP)

- Earthquakes: USGS GeoJSON feed
- Weather: NOAA/NWS active alerts
- Markets: Stooq snapshot endpoint
- News: Reuters world RSS feed
- Aviation: OpenSky states endpoint
- Cyber: CISA Known Exploited Vulnerabilities feed
- Webcams:
  - WSDOT cameras connector
  - Ontario 511 cameras connector
  - NZTA traffic cameras connector
  - Finland Digitraffic weathercams connector
  - Vancouver Open Data webcams connector
  - OHGO cameras connector
  - FAA WeatherCams connector

Each adapter has error handling and mock fallback data to keep the UI functional if a provider is unavailable.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   On Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Sync DB schema:
   ```bash
   npm run db:push
   ```
4. Seed sample decks/rules:
   ```bash
   npm run db:seed
   ```
5. Run dev server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Keyboard Shortcuts

- `A`: quick add widget
- `/`: focus global search
- `R`: refresh feeds

## Build Windows Executable (.exe)

1. Ensure database is initialized:
   ```bash
   npm run db:push
   npm run db:seed
   ```
2. Build Windows installer:
   ```bash
   npm run dist:win
   ```
3. If installer signing tools are blocked by local Windows policy, build a direct runnable app EXE:
   ```bash
   npm run dist:exe
   ```
4. Output artifacts:
   - `dist/openwatch-osint-0.1.0-setup.exe`
   - `dist/win-unpacked/OpenWatch OSINT.exe`

## Workspace Notes

- `/workspace` is the new OSINT-facing home screen and now becomes the default route.
- Mission presets are stored in SQLite and seed with `Global Ops`, `Air and Maritime`, and `Geo and Signals`.
- Local tool launch settings for QGIS, SDRSharp, Virtual Radar Server, and Google Earth are editable from the workspace and stored per machine in the local database.
- Browser launch targets like MarineTraffic, VesselFinder, and ADSBexchange are also managed from the same workspace registry.

## Project Structure

```text
openwatch-osint/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      dashboard/page.tsx
      map/page.tsx
      alerts/page.tsx
      api/
    components/
      layout/
      map/
      panels/
      ui/
      widgets/
    hooks/
    lib/
      adapters/
      ai/
      db/
      mock/
      services/
    stores/
    types/
```

## Architecture Notes

- Data ingestion is isolated in `src/lib/adapters/*`, enabling provider swaps without UI changes.
- `src/lib/services/eventAggregator.ts` unifies adapter output and performs short-lived caching.
- Global filtering happens server-side (`/api/events`) to keep widget/map inputs consistent.
- Dashboard layouts/widgets persist via Prisma in `Dashboard` rows (`layoutJson`, `widgetsJson`).
- Alert engine (`src/lib/services/alertEngine.ts`) evaluates rules against normalized events and writes in-app notifications.
- AI analyst endpoint (`/api/ai/ask`) accepts only currently visible events from the client and never queries external facts.
- Webcam connectors implement a shared adapter interface and sync into `WebcamSource`/`WebcamCheck` tables through `/api/webcams?sync=1`.

## AI Behavior Guarantees (MVP)

- Responses are based only on provided in-memory event objects.
- If OpenAI key/model is absent or unavailable, deterministic local summarization is used.
- Source citations are always returned as URLs from the visible event set.

## Notes

- This MVP intentionally uses public/demo-safe sources only.
- Webcam monitoring is restricted to curated public/owner-permitted endpoints; no private-device scanning is supported.
- OHGO and FAA WeatherCams connectors may require API keys depending on provider access policy.
- Email/webhook alert delivery is stubbed for later phases.
- Authentication/roles are not implemented in this phase.
