import { NextRequest, NextResponse } from "next/server";
import { launchWorkspaceSource } from "@/lib/services/workspaceRegistry";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { sourceKey?: string };
    if (!body.sourceKey) {
      return NextResponse.json({ error: "sourceKey is required" }, { status: 400 });
    }

    const source = await launchWorkspaceSource(body.sourceKey);
    return NextResponse.json({ ok: true, source });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to launch workspace source",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
