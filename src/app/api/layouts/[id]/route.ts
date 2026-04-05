import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapDashboardRow } from "@/lib/db/serializers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await prisma.dashboard.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: "Layout not found" }, { status: 404 });
    }
    return NextResponse.json({ dashboard: mapDashboardRow(row) });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load layout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = await prisma.dashboard.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        layoutJson: JSON.stringify(body.layout || []),
        widgetsJson: JSON.stringify(body.widgets || [])
      }
    });
    return NextResponse.json({ dashboard: mapDashboardRow(row) });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update layout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dashboard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete layout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
