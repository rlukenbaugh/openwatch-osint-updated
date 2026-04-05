import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestionFromEvents } from "@/lib/ai/analyst";
import type { NormalizedEvent } from "@/types/events";

const requestSchema = z.object({
  question: z.string().min(3),
  events: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      category: z.enum(["news", "earthquake", "weather", "aviation", "cyber", "market"]),
      title: z.string(),
      summary: z.string(),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
        country: z.string(),
        region: z.string()
      }),
      severity: z.number().min(1).max(5),
      timestamp: z.string(),
      url: z.string().url(),
      tags: z.array(z.string())
    })
  )
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const question = parsed.data.question;
    // The client sends already visible/filtered events so the assistant cannot answer outside dashboard context.
    const events = parsed.data.events as NormalizedEvent[];
    const result = await answerQuestionFromEvents(question, events);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "AI request failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
