import { NextRequest, NextResponse } from "next/server";
import { collectEventsByProvider } from "@/lib/services/eventAggregator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const events = await collectEventsByProvider(provider);
    return NextResponse.json({
      provider,
      events,
      total: events.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch provider",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
