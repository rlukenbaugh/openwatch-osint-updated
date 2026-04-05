"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Activity, BellRing, Camera, Compass, LayoutDashboard, RefreshCw, Rows3, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AppShellProps = {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

const navItems: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: "/tools" as Route, label: "Tools", icon: Search },
  { href: "/workspace" as Route, label: "Workspace", icon: Rows3 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Global Map", icon: Compass },
  { href: "/webcams", label: "Webcams", icon: Camera },
  { href: "/alerts", label: "Alerts", icon: BellRing }
];

export function AppShell({ title, subtitle, onRefresh, rightSlot, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-border/70 bg-panel/70 backdrop-blur-sm lg:block">
        <div className="border-b border-border/70 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">OpenWatch</p>
          <h1 className="mt-2 text-lg font-semibold">OSINT Command</h1>
          <p className="mt-1 text-xs text-fg/65">Public data monitoring hub</p>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/tools" ? pathname === "/" || pathname.startsWith("/tools") : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-accent/15 text-accent" : "text-fg/75 hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-panel/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-accent">{title}</p>
              <p className="text-xs text-fg/65">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {onRefresh ? (
                <Button variant="secondary" size="sm" onClick={onRefresh} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="min-h-0 min-w-0 flex-1 p-4">{children}</div>
          {rightSlot ? <aside className="hidden w-[360px] border-l border-border/70 xl:block">{rightSlot}</aside> : null}
        </div>

        <footer className="flex items-center gap-2 border-t border-border/70 px-4 py-2 text-xs text-fg/60">
          <Activity className="h-3.5 w-3.5 text-success" />
          Public OSINT feeds only. AI answers restricted to loaded event context.
        </footer>
      </main>
    </div>
  );
}
