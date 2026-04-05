import { NextRequest, NextResponse } from "next/server";
import { collectAllEvents } from "@/lib/services/eventAggregator";
import { filterEvents } from "@/lib/services/eventFilter";
import { parseFilterFromSearchParams } from "@/lib/services/filterFromQuery";
import { runAlertEngine } from "@/lib/services/alertEngine";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const refresh = searchParams.get("refresh") === "1";
    const evaluateAlerts = searchParams.get("evaluateAlerts") === "1";
    const filter = parseFilterFromSearchParams(searchParams);

    const events = await collectAllEvents(refresh);
    const filtered = filterEvents(events, filter);

    if (evaluateAlerts) {
      await runAlertEngine(filtered);
    }

    return NextResponse.json({
      events: filtered,
      total: filtered.length,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to collect events",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
