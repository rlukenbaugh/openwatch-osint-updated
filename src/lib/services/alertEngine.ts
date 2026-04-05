import { prisma } from "@/lib/db/prisma";
import type { AlertRule } from "@/types/alerts";
import type { NormalizedEvent } from "@/types/events";

function matchesRule(event: NormalizedEvent, rule: AlertRule): boolean {
  if (!rule.enabled) return false;
  if (rule.keyword) {
    const combined = `${event.title} ${event.summary} ${event.tags.join(" ")}`.toLowerCase();
    if (!combined.includes(rule.keyword.toLowerCase())) return false;
  }
  if (rule.category && event.category !== rule.category) return false;
  if (rule.country && event.location.country !== rule.country) return false;
  if (rule.minSeverity && event.severity < rule.minSeverity) return false;
  return true;
}

export async function runAlertEngine(events: NormalizedEvent[]) {
  const rules = await prisma.alertRule.findMany({
    where: { enabled: true }
  });

  const createdNotifications: string[] = [];

  for (const rule of rules) {
    const typedRule: AlertRule = {
      id: rule.id,
      name: rule.name,
      keyword: rule.keyword,
      category: rule.category as AlertRule["category"],
      minSeverity: rule.minSeverity,
      country: rule.country,
      enabled: rule.enabled
    };

    const matched = events.filter((event) => matchesRule(event, typedRule)).slice(0, 20);
    if (!matched.length) continue;

    for (const event of matched) {
      const exists = await prisma.alertNotification.findFirst({
        where: { ruleId: rule.id, eventId: event.id }
      });
      if (exists) continue;

      const notification = await prisma.alertNotification.create({
        data: {
          ruleId: rule.id,
          title: `${rule.name} matched`,
          body: `${event.title} (${event.location.country}) severity ${event.severity}`,
          eventId: event.id,
          sourceUrl: event.url
        }
      });
      createdNotifications.push(notification.id);
    }

    await prisma.alertRule.update({
      where: { id: rule.id },
      data: {
        lastTriggeredAt: new Date()
      }
    });
  }

  return { created: createdNotifications.length };
}
