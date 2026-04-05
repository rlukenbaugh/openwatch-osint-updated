import { NextRequest, NextResponse } from "next/server";
import { getWorkspacePayload, setActiveWorkspacePreset } from "@/lib/services/workspaceRegistry";

export async function GET() {
  try {
    const payload = await getWorkspacePayload();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load workspace",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { activePresetKey?: string };
    if (!body.activePresetKey) {
      return NextResponse.json({ error: "activePresetKey is required" }, { status: 400 });
    }

    await setActiveWorkspacePreset(body.activePresetKey);
    const payload = await getWorkspacePayload();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update workspace",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
