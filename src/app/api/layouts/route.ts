import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapDashboardRow } from "@/lib/db/serializers";

export async function GET() {
  try {
    const layouts = await prisma.dashboard.findMany({
      orderBy: [{ isPreset: "desc" }, { name: "asc" }]
    });
    return NextResponse.json({
      dashboards: layouts.map(mapDashboardRow)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load layouts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const row = await prisma.dashboard.create({
      data: {
        name: body.name,
        description: body.description || null,
        isPreset: Boolean(body.isPreset),
        layoutJson: JSON.stringify(body.layout || []),
        widgetsJson: JSON.stringify(body.widgets || [])
      }
    });

    return NextResponse.json({ dashboard: mapDashboardRow(row) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create layout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
