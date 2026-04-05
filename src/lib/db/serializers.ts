import type { DashboardLayout } from "@/types/dashboard";
import type { ProviderSourceRecord, WorkspacePresetRecord } from "@/types/workspace";

type DashboardRow = {
  id: string;
  name: string;
  description: string | null;
  isPreset: boolean;
  layoutJson: string;
  widgetsJson: string;
};

type ProviderSourceRow = {
  id: string;
  key: string;
  name: string;
  kind: ProviderSourceRecord["kind"];
  category: string;
  description: string | null;
  enabled: boolean;
  isDefault: boolean;
  regionScope: string | null;
  countryScope: string | null;
  requiresApiKey: boolean;
  command: string | null;
  argsJson: string;
  launchUrl: string | null;
  sourceUrl: string | null;
  metadataJson: string;
};

type WorkspacePresetRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  sourceKeysJson: string;
  panelLayoutJson: string;
};

export function mapDashboardRow(row: DashboardRow): DashboardLayout {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isPreset: row.isPreset,
    layout: JSON.parse(row.layoutJson),
    widgets: JSON.parse(row.widgetsJson)
  };
}

export function mapProviderSourceRow(row: ProviderSourceRow): ProviderSourceRecord {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    kind: row.kind,
    category: row.category,
    description: row.description,
    enabled: row.enabled,
    isDefault: row.isDefault,
    regionScope: row.regionScope,
    countryScope: row.countryScope,
    requiresApiKey: row.requiresApiKey,
    command: row.command,
    args: JSON.parse(row.argsJson),
    launchUrl: row.launchUrl,
    sourceUrl: row.sourceUrl,
    metadata: JSON.parse(row.metadataJson)
  };
}

export function mapWorkspacePresetRow(row: WorkspacePresetRow): WorkspacePresetRecord {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    isSystem: row.isSystem,
    sourceKeys: JSON.parse(row.sourceKeysJson),
    panelLayout: JSON.parse(row.panelLayoutJson)
  };
}
