import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { collectAllEvents } from "@/lib/services/eventAggregator";
import { runAlertEngine } from "@/lib/services/alertEngine";

export async function GET(request: NextRequest) {
  try {
    const evaluate = request.nextUrl.searchParams.get("evaluate") === "1";
    if (evaluate) {
      const events = await collectAllEvents(false);
      await runAlertEngine(events);
    }

    const [rules, notifications] = await Promise.all([
      prisma.alertRule.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.alertNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      })
    ]);

    return NextResponse.json({
      rules,
      notifications
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load alerts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rule = await prisma.alertRule.create({
      data: {
        name: body.name,
        keyword: body.keyword || null,
        category: body.category || null,
        minSeverity: body.minSeverity ?? null,
        country: body.country || null,
        enabled: body.enabled ?? true
      }
    });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create alert rule",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
