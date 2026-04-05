import { spawn } from "node:child_process";
import { prisma } from "@/lib/db/prisma";
import { mapProviderSourceRow, mapWorkspacePresetRow } from "@/lib/db/serializers";
import type { WorkspacePayload } from "@/types/workspace";

export async function getWorkspacePayload(): Promise<WorkspacePayload> {
  const [activePreset, presetRows, sourceRows] = await Promise.all([
    prisma.appSetting.findUnique({ where: { key: "defaultWorkspacePresetKey" } }),
    prisma.workspacePreset.findMany({ orderBy: [{ isSystem: "desc" }, { name: "asc" }] }),
    prisma.providerSource.findMany({ orderBy: [{ kind: "asc" }, { name: "asc" }] })
  ]);

  return {
    activePresetKey: activePreset?.value || presetRows[0]?.key || "",
    presets: presetRows.map(mapWorkspacePresetRow),
    sources: sourceRows.map(mapProviderSourceRow)
  };
}

export async function setActiveWorkspacePreset(activePresetKey: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: "defaultWorkspacePresetKey" },
    update: { value: activePresetKey },
    create: { key: "defaultWorkspacePresetKey", value: activePresetKey }
  });
}

type UpdateWorkspaceSourceInput = {
  enabled?: boolean;
  isDefault?: boolean;
  command?: string | null;
  launchUrl?: string | null;
  args?: string[];
  description?: string | null;
};

export async function updateWorkspaceSource(sourceId: string, input: UpdateWorkspaceSourceInput) {
  const row = await prisma.providerSource.update({
    where: { id: sourceId },
    data: {
      enabled: input.enabled,
      isDefault: input.isDefault,
      command: input.command === undefined ? undefined : input.command || null,
      launchUrl: input.launchUrl === undefined ? undefined : input.launchUrl || null,
      argsJson: input.args === undefined ? undefined : JSON.stringify(input.args),
      description: input.description === undefined ? undefined : input.description || null
    }
  });

  return mapProviderSourceRow(row);
}

function spawnDetached(command: string, args: string[]) {
  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  child.unref();
}

function openUrl(url: string) {
  if (process.platform === "win32") {
    spawnDetached("cmd.exe", ["/c", "start", "", url]);
    return;
  }
  spawnDetached("xdg-open", [url]);
}

export async function launchWorkspaceSource(sourceKey: string) {
  const row = await prisma.providerSource.findUnique({ where: { key: sourceKey } });
  if (!row) {
    throw new Error("Launch source not found.");
  }
  if (!row.enabled) {
    throw new Error("Launch source is disabled.");
  }

  const args = JSON.parse(row.argsJson) as string[];

  if (row.kind === "LINK") {
    if (!row.launchUrl) {
      throw new Error("Launch URL is not configured.");
    }
    openUrl(row.launchUrl);
    return mapProviderSourceRow(row);
  }

  if (row.kind !== "TOOL") {
    throw new Error("Only tool and link sources can be launched from the workspace.");
  }

  if (!row.command) {
    throw new Error("Command path is not configured.");
  }

  spawnDetached(row.command, args);
  return mapProviderSourceRow(row);
}
