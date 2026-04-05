import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseOsintToolsMarkdown } from "@/lib/osint-tools/parse";
import type { OsintTool, OsintToolCatalogSource } from "@/types/osint-tools";

const OSINT_TOOLS_URL =
  "https://cdn.jsdelivr.net/gh/Astrosp/Awesome-OSINT-For-Everything/README.md";
const SNAPSHOT_PATH = path.join(process.cwd(), "public", "data", "osint-tools-snapshot.md");
const REVALIDATE_SECONDS = 60 * 60 * 6;

export async function getOsintTools(): Promise<{
  tools: OsintTool[];
  source: OsintToolCatalogSource;
}> {
  const liveTools = await loadLiveTools();
  if (liveTools.length > 0) {
    return { tools: liveTools, source: "live" };
  }

  const snapshotTools = await loadSnapshotTools();
  return { tools: snapshotTools, source: "snapshot" };
}

async function loadLiveTools() {
  try {
    const response = await fetch(OSINT_TOOLS_URL, {
      next: { revalidate: REVALIDATE_SECONDS }
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const markdown = await response.text();
    return parseOsintToolsMarkdown(markdown);
  } catch {
    return [];
  }
}

async function loadSnapshotTools() {
  try {
    const markdown = await readFile(SNAPSHOT_PATH, "utf8");
    return parseOsintToolsMarkdown(markdown);
  } catch {
    return [];
  }
}
