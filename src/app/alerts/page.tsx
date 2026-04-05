"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Siren } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAlertsStore } from "@/stores/alerts-store";

export default function AlertsPage() {
  const [form, setForm] = useState({
    name: "",
    keyword: "",
    category: "",
    minSeverity: "",
    country: "",
    enabled: true
  });
  const { rules, notifications, loading, error, fetchAlerts, createRule, deleteRule, markNotificationRead } =
    useAlertsStore();

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  return (
    <AppShell
      title="Alert Rules"
      subtitle="In-app notification rules for keywords, category, severity, and country"
      onRefresh={() => {
        void fetchAlerts(true);
      }}
    >
      <div className="grid gap-3 xl:grid-cols-[440px_minmax(0,1fr)]">
        <section className="rounded-xl border border-border/70 bg-panel/85 p-3">
          <p className="text-sm font-semibold">Create alert rule</p>
          <p className="text-xs text-fg/65">MVP supports in-app notifications. Email/webhook delivery is stubbed for future versions.</p>

          <form
            className="mt-3 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!form.name.trim()) return;
              void createRule({
                name: form.name,
                keyword: form.keyword || null,
                category: (form.category as never) || null,
                minSeverity: form.minSeverity ? Number(form.minSeverity) : null,
                country: form.country || null,
                enabled: form.enabled
              });
              setForm({
                name: "",
                keyword: "",
                category: "",
                minSeverity: "",
                country: "",
                enabled: true
              });
            }}
          >
            <Input
              required
              placeholder="Rule name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="keyword contains (optional)"
              value={form.keyword}
              onChange={(event) => setForm((prev) => ({ ...prev, keyword: event.target.value }))}
            />
            <Select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">Any category</option>
              <option value="news">news</option>
              <option value="earthquake">earthquake</option>
              <option value="weather">weather</option>
              <option value="aviation">aviation</option>
              <option value="cyber">cyber</option>
              <option value="market">market</option>
            </Select>
            <Select
              value={form.minSeverity}
              onChange={(event) => setForm((prev) => ({ ...prev, minSeverity: event.target.value }))}
            >
              <option value="">Any severity</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </Select>
            <Input
              placeholder="country equals (optional)"
              value={form.country}
              onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            />
            <Button type="submit" className="w-full">
              Create Rule
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-fg/65">Active rules</p>
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-md border border-border/70 bg-panel/70 p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{rule.name}</p>
                  <Button variant="ghost" size="sm" onClick={() => void deleteRule(rule.id)}>
                    Remove
                  </Button>
                </div>
                <p className="mt-1 text-xs text-fg/65">
                  {rule.keyword ? `keyword=${rule.keyword} ` : ""}
                  {rule.category ? `category=${rule.category} ` : ""}
                  {rule.minSeverity ? `minSeverity=${rule.minSeverity} ` : ""}
                  {rule.country ? `country=${rule.country}` : ""}
                </p>
              </article>
            ))}
            {!rules.length ? <p className="text-sm text-fg/65">No rules configured yet.</p> : null}
          </div>
        </section>

        <section className="rounded-xl border border-border/70 bg-panel/85 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <BellRing className="h-4 w-4 text-warning" />
              In-app notifications
            </p>
            <Button size="sm" onClick={() => void fetchAlerts(true)} className="gap-1">
              <Siren className="h-3.5 w-3.5" />
              Evaluate now
            </Button>
          </div>

          {loading ? <p className="text-sm text-fg/65">Loading notifications...</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <div className="space-y-2">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-md border p-2 ${
                  notification.read ? "border-border/60 bg-panel/65" : "border-warning/40 bg-warning/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1 text-sm font-medium">
                    <Bell className="h-3.5 w-3.5" />
                    {notification.title}
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => void markNotificationRead(notification.id, !notification.read)}>
                    {notification.read ? "Mark unread" : "Mark read"}
                  </Button>
                </div>
                <p className="mt-1 text-sm text-fg/80">{notification.body}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-fg/65">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  {notification.sourceUrl ? (
                    <a href={notification.sourceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Source URL
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
            {!notifications.length ? <p className="text-sm text-fg/65">No alert notifications yet.</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
