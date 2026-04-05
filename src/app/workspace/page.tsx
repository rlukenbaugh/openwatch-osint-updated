"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Camera,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Map,
  Play,
  RefreshCw,
  Save,
  Settings2
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventList } from "@/components/widgets/event-list";
import type { NormalizedEvent } from "@/types/events";
import type { ProviderSourceRecord, WorkspacePayload, WorkspacePanel, WorkspacePresetRecord } from "@/types/workspace";

type SourceDraft = {
  enabled: boolean;
  command: string;
  launchUrl: string;
  args: string;
  description: string;
};

function buildDrafts(sources: ProviderSourceRecord[]): Record<string, SourceDraft> {
  return Object.fromEntries(
    sources.map((source) => [
      source.id,
      {
        enabled: source.enabled,
        command: source.command || "",
        launchUrl: source.launchUrl || "",
        args: source.args.join(" "),
        description: source.description || ""
      }
    ])
  );
}

function parseArgs(input: string): string[] {
  return input
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);
}

function sourceBadgeVariant(source: ProviderSourceRecord): "default" | "muted" | "warning" {
  if (source.kind === "TOOL" || source.kind === "LINK") return "default";
  if (source.requiresApiKey) return "warning";
  return "muted";
}

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [drafts, setDrafts] = useState<Record<string, SourceDraft>>({});
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [savingSourceId, setSavingSourceId] = useState<string | null>(null);
  const [launchingKey, setLaunchingKey] = useState<string | null>(null);
  const [savingPreset, setSavingPreset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadWorkspace = async () => {
    setLoadingWorkspace(true);
    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load workspace");
      }
      const payload = (await response.json()) as WorkspacePayload;
      setWorkspace(payload);
      setDrafts(buildDrafts(payload.sources));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load workspace");
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const loadEvents = async (refresh = false) => {
    setLoadingEvents(true);
    try {
      const params = new URLSearchParams({ hours: "24" });
      if (refresh) {
        params.set("refresh", "1");
      }
      const response = await fetch(`/api/events?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load events");
      }
      const payload = (await response.json()) as { events: NormalizedEvent[] };
      setEvents(payload.events || []);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load event stream");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    void loadWorkspace();
    void loadEvents();
  }, []);

  const activePreset = useMemo<WorkspacePresetRecord | undefined>(
    () => workspace?.presets.find((preset) => preset.key === workspace.activePresetKey) || workspace?.presets[0],
    [workspace]
  );

  const missionSources = useMemo(() => {
    if (!workspace || !activePreset) return [];
    const selectedKeys = new Set(activePreset.sourceKeys);
    return workspace.sources.filter((source) => selectedKeys.has(source.key));
  }, [activePreset, workspace]);

  const launchableSources = useMemo(
    () => missionSources.filter((source) => source.kind === "TOOL" || source.kind === "LINK"),
    [missionSources]
  );

  const focusCategories = useMemo(() => {
    const panelCategories =
      activePreset?.panelLayout
        .flatMap((panel) => panel.config?.categories || [])
        .filter(Boolean) || [];
    if (panelCategories.length) {
      return Array.from(new Set(panelCategories));
    }

    return Array.from(
      new Set(
        missionSources
          .filter((source) => source.kind === "EVENT")
          .map((source) => source.category)
          .filter((category): category is NormalizedEvent["category"] =>
            ["news", "earthquake", "weather", "aviation", "cyber", "market"].includes(category)
          )
      )
    );
  }, [activePreset, missionSources]);

  const visibleEvents = useMemo(() => {
    if (!focusCategories.length) {
      return events.slice(0, 8);
    }
    return events.filter((event) => focusCategories.includes(event.category)).slice(0, 8);
  }, [events, focusCategories]);

  const updateDraft = (sourceId: string, patch: Partial<SourceDraft>) => {
    setDrafts((current) => ({
      ...current,
      [sourceId]: { ...current[sourceId], ...patch }
    }));
  };

  const saveSource = async (source: ProviderSourceRecord, overrides?: Partial<SourceDraft>) => {
    const nextDraft = { ...drafts[source.id], ...overrides };
    setSavingSourceId(source.id);
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/workspace/sources/${source.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: nextDraft.enabled,
          command: nextDraft.command,
          launchUrl: nextDraft.launchUrl,
          args: parseArgs(nextDraft.args),
          description: nextDraft.description
        })
      });
      if (!response.ok) {
        throw new Error("Failed to save source");
      }
      const payload = (await response.json()) as { source: ProviderSourceRecord };
      setWorkspace((current) =>
        current
          ? {
              ...current,
              sources: current.sources.map((item) => (item.id === payload.source.id ? payload.source : item))
            }
          : current
      );
      setDrafts((current) => ({
        ...current,
        [payload.source.id]: {
          enabled: payload.source.enabled,
          command: payload.source.command || "",
          launchUrl: payload.source.launchUrl || "",
          args: payload.source.args.join(" "),
          description: payload.source.description || ""
        }
      }));
      setStatusMessage(`${payload.source.name} saved.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to save source");
    } finally {
      setSavingSourceId(null);
    }
  };

  const launchSource = async (source: ProviderSourceRecord) => {
    setLaunchingKey(source.key);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/workspace/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceKey: source.key })
      });
      if (!response.ok) {
        const payload = (await response.json()) as { details?: string };
        throw new Error(payload.details || "Failed to launch source");
      }
      setStatusMessage(`${source.name} launched.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to launch source");
    } finally {
      setLaunchingKey(null);
    }
  };

  const launchAll = async () => {
    for (const source of launchableSources.filter((item) => item.enabled)) {
      // Keep the launches sequential so external apps do not all compete for focus at once.
      await launchSource(source);
    }
  };

  const setActivePreset = async (presetKey: string) => {
    setSavingPreset(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePresetKey: presetKey })
      });
      if (!response.ok) {
        throw new Error("Failed to switch mission preset");
      }
      const payload = (await response.json()) as WorkspacePayload;
      setWorkspace(payload);
      setDrafts(buildDrafts(payload.sources));
      setStatusMessage(`Mission preset switched to ${payload.presets.find((preset) => preset.key === presetKey)?.name || presetKey}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to switch mission preset");
    } finally {
      setSavingPreset(false);
    }
  };

  const renderMissionPanel = () => (
    <Card className="min-h-[340px]">
      <CardHeader>
        <CardTitle>{activePreset?.name || "Mission Snapshot"}</CardTitle>
        <CardDescription>{activePreset?.description || "Choose a mission preset to shape the workspace."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-panel/70 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-fg/55">Sources</p>
            <p className="mt-1 text-2xl font-semibold">{missionSources.length}</p>
            <p className="text-xs text-fg/65">Mission-linked registry entries</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-panel/70 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-fg/55">Launchers</p>
            <p className="mt-1 text-2xl font-semibold">{launchableSources.length}</p>
            <p className="text-xs text-fg/65">Desktop tools and browser targets</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-panel/70 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-fg/55">Focus</p>
            <p className="mt-1 text-2xl font-semibold">{focusCategories.length || 1}</p>
            <p className="text-xs text-fg/65">Primary intelligence lanes</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-fg/55">Mission lanes</p>
          <div className="flex flex-wrap gap-2">
            {focusCategories.length ? (
              focusCategories.map((category) => (
                <Badge key={category} variant="muted">
                  {category}
                </Badge>
              ))
            ) : (
              <Badge variant="muted">all feeds</Badge>
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/map" className="rounded-lg border border-border/70 bg-panel/70 p-3 transition-colors hover:bg-muted">
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <Map className="h-4 w-4 text-accent" />
              Open Global Map
            </p>
            <p className="mt-1 text-xs text-fg/65">Pivot to the main geographic operating picture.</p>
          </Link>
          <Link href="/webcams" className="rounded-lg border border-border/70 bg-panel/70 p-3 transition-colors hover:bg-muted">
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <Camera className="h-4 w-4 text-accent" />
              Open Webcam Monitor
            </p>
            <p className="mt-1 text-xs text-fg/65">Validate locations with public camera coverage.</p>
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-border/70 bg-panel/70 p-3 transition-colors hover:bg-muted">
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <LayoutDashboard className="h-4 w-4 text-accent" />
              Open Widget Deck
            </p>
            <p className="mt-1 text-xs text-fg/65">Return to the full drag-and-drop dashboard.</p>
          </Link>
          <Link href="/alerts" className="rounded-lg border border-border/70 bg-panel/70 p-3 transition-colors hover:bg-muted">
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <BellRing className="h-4 w-4 text-accent" />
              Open Alerts
            </p>
            <p className="mt-1 text-xs text-fg/65">Review rules, notifications, and escalation items.</p>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const renderLaunchpadPanel = () => (
    <Card className="min-h-[340px]">
      <CardHeader>
        <CardTitle>Tool Launcher</CardTitle>
        <CardDescription>Save local executable paths or browser URLs, then launch them from the workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-panel/60 p-3 text-xs text-fg/70">
          <p>Mission launch will only fire enabled tools and links for the active preset.</p>
          <Button size="sm" onClick={() => void launchAll()} disabled={!launchableSources.some((source) => source.enabled) || !!launchingKey}>
            <Play className="mr-1 h-3.5 w-3.5" />
            Launch mission
          </Button>
        </div>

        <div className="space-y-3">
          {launchableSources.length ? (
            launchableSources.map((source) => {
              const draft = drafts[source.id];
              return (
                <div key={source.id} className="rounded-lg border border-border/70 bg-panel/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{source.name}</p>
                      <p className="text-xs text-fg/65">{source.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={source.enabled ? "success" : "muted"}>{source.enabled ? "enabled" : "disabled"}</Badge>
                      <Badge variant={sourceBadgeVariant(source)}>{source.kind.toLowerCase()}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {source.kind === "TOOL" ? (
                      <>
                        <Input
                          value={draft?.command || ""}
                          onChange={(event) => updateDraft(source.id, { command: event.target.value })}
                          placeholder="C:\\Program Files\\YourTool\\tool.exe"
                        />
                        <Input
                          value={draft?.args || ""}
                          onChange={(event) => updateDraft(source.id, { args: event.target.value })}
                          placeholder="Optional launch arguments"
                        />
                      </>
                    ) : (
                      <Input
                        value={draft?.launchUrl || ""}
                        onChange={(event) => updateDraft(source.id, { launchUrl: event.target.value })}
                        placeholder="https://..."
                      />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void saveSource(source, { enabled: !draft?.enabled })}
                      disabled={savingSourceId === source.id}
                    >
                      <Settings2 className="mr-1 h-3.5 w-3.5" />
                      {draft?.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" onClick={() => void saveSource(source)} disabled={savingSourceId === source.id}>
                      {savingSourceId === source.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void launchSource(source)}
                      disabled={launchingKey === source.key || !draft?.enabled}
                    >
                      {launchingKey === source.key ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />}
                      Launch
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-fg/65">This preset does not include any launchable desktop tools or browser targets yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderEventPanel = (panel: WorkspacePanel) => (
    <Card className="min-h-[340px]">
      <CardHeader>
        <CardTitle>{panel.title}</CardTitle>
        <CardDescription>{panel.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingEvents ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-fg/65">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading mission events...
          </div>
        ) : (
          <EventList events={visibleEvents} emptyLabel="No events matched this mission lane in the last 24 hours." />
        )}
      </CardContent>
    </Card>
  );

  const renderSourcesPanel = (panel: WorkspacePanel) => (
    <Card className="min-h-[340px]">
      <CardHeader>
        <CardTitle>{panel.title}</CardTitle>
        <CardDescription>{panel.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {missionSources.map((source) => {
          const draft = drafts[source.id];
          return (
            <div key={source.id} className="rounded-lg border border-border/70 bg-panel/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{source.name}</p>
                  <p className="text-xs text-fg/65">{source.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={source.enabled ? "success" : "muted"}>{source.enabled ? "enabled" : "disabled"}</Badge>
                  <Badge variant={sourceBadgeVariant(source)}>{source.category}</Badge>
                  {source.requiresApiKey ? <Badge variant="warning">API key</Badge> : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void saveSource(source, { enabled: !draft?.enabled })}
                  disabled={savingSourceId === source.id}
                >
                  {draft?.enabled ? "Disable" : "Enable"}
                </Button>
                {source.sourceUrl ? (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    Source reference
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  const renderPanel = (panel: WorkspacePanel) => {
    if (panel.type === "mission") return renderMissionPanel();
    if (panel.type === "launchpad") return renderLaunchpadPanel();
    if (panel.type === "sources") return renderSourcesPanel(panel);
    return renderEventPanel(panel);
  };

  return (
    <AppShell
      title="Workspace"
      subtitle="Mission presets, external tool launchers, and a one-screen OSINT operating deck"
      onRefresh={() => {
        void loadWorkspace();
        void loadEvents(true);
      }}
    >
      <div className="space-y-3">
        <section className="rounded-xl border border-border/70 bg-panel/85 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Mission Presets</p>
              <p className="text-xs text-fg/65">Switch the 2x2 deck between global watch, air and maritime, or geo/signals workflows.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void loadEvents(true)} disabled={loadingEvents}>
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loadingEvents ? "animate-spin" : ""}`} />
              Refresh events
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {loadingWorkspace ? (
              <div className="inline-flex items-center gap-2 text-sm text-fg/65">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading presets...
              </div>
            ) : (
              workspace?.presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={preset.key === activePreset?.key ? "default" : "secondary"}
                  size="sm"
                  onClick={() => void setActivePreset(preset.key)}
                  disabled={savingPreset}
                >
                  {preset.name}
                </Button>
              ))
            )}
          </div>
        </section>

        {statusMessage ? (
          <section className="rounded-xl border border-border/70 bg-panel/70 p-3 text-sm text-fg/80">{statusMessage}</section>
        ) : null}

        <section className="grid gap-3 xl:grid-cols-2">
          {activePreset?.panelLayout.map((panel) => (
            <div key={panel.id}>{renderPanel(panel)}</div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
