"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowUpRight, Search, Shield, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OsintTool, OsintToolCatalogSource } from "@/types/osint-tools";

type OsintToolsCatalogClientProps = {
  tools: OsintTool[];
  source: OsintToolCatalogSource;
};

export function OsintToolsCatalogClient({ tools, source }: OsintToolsCatalogClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => ["all", ...new Set(tools.map((tool) => tool.category))],
    [tools]
  );

  const filteredTools = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory = category === "all" || tool.category === category;
      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [tool.name, tool.description, tool.category].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [category, deferredQuery, tools]);

  const hasFilters = Boolean(query.trim()) || category !== "all";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-panel/90 shadow-panel">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:px-8 lg:py-10">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent">
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px]">
                OpenWatch tools index
              </span>
              <span className="text-fg/45">Public-source only</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-fg sm:text-5xl">
                Search the OSINT stack before you open the rest of the command center.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-fg/72 sm:text-lg">
                Explore tool discovery, breach lookup, geo, social, and investigation workflows from a single
                searchable registry, then jump into maps, webcams, alerts, and workspace launchers when you need
                deeper context.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-fg/68">
              <div className="rounded-2xl border border-border/70 bg-bg/60 px-4 py-3">
                <div className="text-2xl font-semibold text-fg">{tools.length}</div>
                <div>curated links indexed</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-bg/60 px-4 py-3">
                <div className="text-2xl font-semibold text-fg">{categories.length - 1}</div>
                <div>searchable categories</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-bg/60 px-4 py-3">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-fg/65">
                  Source
                </div>
                <div className="mt-1 flex items-center gap-2 text-fg">
                  <span
                    className={cn(
                      "inline-flex h-2.5 w-2.5 rounded-full",
                      source === "live" ? "bg-success" : "bg-warning"
                    )}
                  />
                  {source === "live" ? "Live upstream sync" : "Local snapshot fallback"}
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(8,145,178,0.12),rgba(15,23,42,0.04))] p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-border/80 bg-panel/90 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fg/55">
                Navigation path
              </div>
              <div className="space-y-3">
                {[
                  {
                    title: "Start with discovery",
                    text: "Find the right tool by keyword, category, or investigation lane before you leave the page.",
                    icon: Search
                  },
                  {
                    title: "Pivot into monitoring",
                    text: "Move into dashboard, map, alerts, and webcams once you know which lane you’re working.",
                    icon: Sparkles
                  },
                  {
                    title: "Stay inside public sources",
                    text: "The catalog and the surrounding product stay framed around public-source intelligence workflows.",
                    icon: Shield
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3 rounded-2xl border border-border/70 bg-panel/70 p-4">
                      <div className="mt-0.5 rounded-xl border border-accent/25 bg-accent/10 p-2 text-accent">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-fg">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-fg/65">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href="/workspace"
                  className="inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-sm text-fg/75 transition-colors hover:border-accent hover:text-accent"
                >
                  Workspace
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-sm text-fg/75 transition-colors hover:border-accent hover:text-accent"
                >
                  Global Map
                </Link>
                <Link
                  href="/alerts"
                  className="inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-sm text-fg/75 transition-colors hover:border-accent hover:text-accent"
                >
                  Alerts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.5rem] border border-border/70 bg-panel/88 p-4 shadow-panel sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/40" />
              <Input
                aria-label="Search OSINT tools"
                className="h-12 rounded-2xl border-border/70 bg-bg/60 pl-11 pr-12 text-base"
                placeholder="Search tools, categories, or keywords..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-fg/65">
                  {hasFilters
                    ? `Showing ${filteredTools.length} of ${tools.length} tools`
                    : `${tools.length} tools available`}
                </p>
                {hasFilters ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                  >
                    Reset filters
                  </Button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => {
                  const active = category === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-all",
                        active
                          ? "border-accent bg-accent text-white shadow-panel"
                          : "border-border/70 bg-bg/55 text-fg/72 hover:border-accent/55 hover:text-accent"
                      )}
                      onClick={() => setCategory(item)}
                    >
                      {item === "all" ? "All" : item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {filteredTools.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool, index) => (
              <article
                key={`${tool.name}-${tool.link}`}
                className="group rounded-[1.5rem] border border-border/70 bg-panel/88 p-5 shadow-panel transition-all duration-200 hover:-translate-y-1 hover:border-accent/55"
                style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="muted" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                    {tool.category}
                  </Badge>
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border/70 p-2 text-fg/55 transition-colors hover:border-accent hover:text-accent"
                    aria-label={`Open ${tool.name}`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-5 space-y-3">
                  <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-fg">
                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      {tool.name}
                    </a>
                  </h2>
                  <p className="text-sm leading-6 text-fg/68">{tool.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-panel/72 px-6 py-12 text-center shadow-panel">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-bg/70 text-accent">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-fg">No tools matched this search.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-fg/65">
              Try a broader keyword, switch categories, or reset the filters to return to the full index.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
