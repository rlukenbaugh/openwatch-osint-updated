import { NextRequest, NextResponse } from "next/server";
import { collectAllEvents } from "@/lib/services/eventAggregator";
import { filterEvents } from "@/lib/services/eventFilter";
import { parseFilterFromSearchParams } from "@/lib/services/filterFromQuery";

export async function GET(request: NextRequest) {
  try {
    const events = await collectAllEvents(false);
    const filter = parseFilterFromSearchParams(request.nextUrl.searchParams);
    const results = filterEvents(events, filter);

    return NextResponse.json({
      results,
      total: results.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
