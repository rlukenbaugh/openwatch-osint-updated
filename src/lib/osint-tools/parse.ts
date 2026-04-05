import type { OsintTool } from "@/types/osint-tools";

const TOOL_ENTRY_PATTERN = /^-\s+\[(.+?)\]\((https?:\/\/[^\s)]+)\)\s+-\s+(.+)$/;

export function parseOsintToolsMarkdown(markdown: string): OsintTool[] {
  const lines = markdown.split(/\r?\n/);
  const tools: OsintTool[] = [];
  let currentCategory = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("## ")) {
      currentCategory = line.slice(3).trim();
      continue;
    }

    const match = line.match(TOOL_ENTRY_PATTERN);
    if (!match || !currentCategory) {
      continue;
    }

    const [, name, link, description] = match;
    tools.push({
      name: name.trim(),
      link: link.trim(),
      description: description.trim(),
      category: currentCategory
    });
  }

  return normalizeOsintTools(tools);
}

function normalizeOsintTools(tools: OsintTool[]) {
  const seen = new Set<string>();

  return tools
    .filter((tool) => tool.name && tool.link && tool.description && tool.category)
    .filter((tool) => {
      const key = `${tool.name.toLowerCase()}::${tool.link.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      const categoryCompare = left.category.localeCompare(right.category);
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      return left.name.localeCompare(right.name);
    });
}
