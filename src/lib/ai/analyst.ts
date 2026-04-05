import OpenAI from "openai";
import { formatDistanceToNow } from "date-fns";
import type { NormalizedEvent } from "@/types/events";

type AnalystAnswer = {
  answer: string;
  citations: string[];
  mode: "openai" | "local";
};

function buildLocalAnswer(question: string, events: NormalizedEvent[]): AnalystAnswer {
  const latest = events
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .slice(0, 10);

  const counts = latest.reduce<Record<string, number>>((acc, event) => {
    acc[event.category] = (acc[event.category] ?? 0) + 1;
    return acc;
  }, {});

  const categorySummary = Object.entries(counts)
    .map(([category, count]) => `${category}: ${count}`)
    .join(", ");

  const lines = latest.map(
    (event, index) =>
      `${index + 1}. ${event.title} (${event.category}, ${event.location.country}, ${formatDistanceToNow(
        new Date(event.timestamp),
        { addSuffix: true }
      )})`
  );

  const citations = Array.from(new Set(latest.map((event) => event.url))).slice(0, 10);
  const answer = [
    `Question: ${question}`,
    `Visible data snapshot includes ${latest.length} recent events (${categorySummary || "no categories"}).`,
    "Top events:",
    ...lines,
    "This response is generated strictly from loaded events."
  ].join("\n");

  return { answer, citations, mode: "local" };
}

export async function answerQuestionFromEvents(question: string, events: NormalizedEvent[]): Promise<AnalystAnswer> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!apiKey) {
    return buildLocalAnswer(question, events);
  }

  const citations = Array.from(new Set(events.slice(0, 30).map((event) => event.url))).slice(0, 20);
  const context = events.slice(0, 30).map((event) => ({
    title: event.title,
    summary: event.summary,
    category: event.category,
    severity: event.severity,
    country: event.location.country,
    region: event.location.region,
    timestamp: event.timestamp,
    url: event.url
  }));

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "You are an OSINT analyst assistant. Only answer from provided JSON events. If unsupported, say data is unavailable. Always cite source URLs explicitly."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nVisible events JSON:\n${JSON.stringify(context)}`
        }
      ],
      temperature: 0.1
    });

    const text = response.output_text?.trim();
    if (!text) {
      return buildLocalAnswer(question, events);
    }

    return {
      answer: text,
      citations,
      mode: "openai"
    };
  } catch {
    return buildLocalAnswer(question, events);
  }
}
