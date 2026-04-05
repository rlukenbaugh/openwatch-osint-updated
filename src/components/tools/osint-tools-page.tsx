import { AppShell } from "@/components/layout/app-shell";
import { OsintToolsCatalogClient } from "@/components/tools/osint-tools-catalog-client";
import { getOsintTools } from "@/lib/osint-tools/load";

export async function OsintToolsPage() {
  const { tools, source } = await getOsintTools();

  return (
    <AppShell
      title="OSINT Tools"
      subtitle="Search the upstream registry first, then pivot into monitoring, mapping, and alerts."
    >
      <OsintToolsCatalogClient tools={tools} source={source} />
    </AppShell>
  );
}
