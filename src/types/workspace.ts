import type { EventCategory } from "@/types/events";

export type SourceKind = "EVENT" | "WEBCAM" | "TOOL" | "LINK";

export type ProviderSourceRecord = {
  id: string;
  key: string;
  name: string;
  kind: SourceKind;
  category: string;
  description: string | null;
  enabled: boolean;
  isDefault: boolean;
  regionScope: string | null;
  countryScope: string | null;
  requiresApiKey: boolean;
  command: string | null;
  args: string[];
  launchUrl: string | null;
  sourceUrl: string | null;
  metadata: Record<string, unknown>;
};

export type WorkspacePanelType = "mission" | "launchpad" | "eventFeed" | "sources";

export type WorkspacePanelConfig = {
  categories?: EventCategory[];
};

export type WorkspacePanel = {
  id: string;
  title: string;
  subtitle: string;
  type: WorkspacePanelType;
  config?: WorkspacePanelConfig;
};

export type WorkspacePresetRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  sourceKeys: string[];
  panelLayout: WorkspacePanel[];
};

export type WorkspacePayload = {
  activePresetKey: string;
  presets: WorkspacePresetRecord[];
  sources: ProviderSourceRecord[];
};
