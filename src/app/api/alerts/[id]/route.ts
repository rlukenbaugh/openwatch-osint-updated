import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const kind = request.nextUrl.searchParams.get("kind") || "rule";

    if (kind === "notification") {
      const notification = await prisma.alertNotification.update({
        where: { id },
        data: {
          read: Boolean(body.read)
        }
      });
      return NextResponse.json({ notification });
    }

    const rule = await prisma.alertRule.update({
      where: { id },
      data: {
        name: body.name,
        keyword: body.keyword ?? null,
        category: body.category ?? null,
        minSeverity: body.minSeverity ?? null,
        country: body.country ?? null,
        enabled: body.enabled ?? true
      }
    });
    return NextResponse.json({ rule });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update alert entity",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kind = request.nextUrl.searchParams.get("kind") || "rule";

    if (kind === "notification") {
      await prisma.alertNotification.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    await prisma.alertRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete alert entity",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
