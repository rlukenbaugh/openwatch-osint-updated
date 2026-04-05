import { NextRequest, NextResponse } from "next/server";
import { updateWorkspaceSource } from "@/lib/services/workspaceRegistry";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      enabled?: boolean;
      isDefault?: boolean;
      command?: string | null;
      launchUrl?: string | null;
      args?: string[];
      description?: string | null;
    };

    const source = await updateWorkspaceSource(id, body);
    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update workspace source",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
