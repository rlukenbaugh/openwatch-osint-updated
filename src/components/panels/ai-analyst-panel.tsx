"use client";

import { useMemo, useState } from "react";
import { Bot, SendHorizonal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NormalizedEvent } from "@/types/events";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: string[];
};

type AiAnalystPanelProps = {
  visibleEvents: NormalizedEvent[];
};

const starterPrompts = [
  "Summarize the top 10 events in the last 6 hours.",
  "What changed in aviation and cyber today?",
  "Which events are clustered in the Middle East?"
];

export function AiAnalystPanel({ visibleEvents }: AiAnalystPanelProps) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Analyst ready. I will only answer from currently loaded dashboard events and cite source URLs."
    }
  ]);

  const eventCountLabel = useMemo(() => `${visibleEvents.length} events in context`, [visibleEvents.length]);

  const askQuestion = async (inputQuestion: string) => {
    const clean = inputQuestion.trim();
    if (!clean) return;
    setBusy(true);
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: clean
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clean,
          events: visibleEvents
        })
      });
      const payload = await res.json();
      const assistant: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: payload.answer || "No response available for this question.",
        citations: payload.citations || []
      };
      setMessages((prev) => [...prev, assistant]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "I could not process that request. Try again with a narrower question."
        }
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex h-full flex-col bg-panel/65">
      <header className="border-b border-border/70 p-3">
        <p className="text-xs uppercase tracking-[0.15em] text-accent">AI Analyst</p>
        <p className="text-xs text-fg/65">{eventCountLabel}</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <div className="rounded-md border border-border/70 bg-muted/35 p-2">
          <p className="text-xs font-semibold">Quick prompts</p>
          <div className="mt-2 space-y-1">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => askQuestion(prompt)}
                className="block w-full rounded border border-border/60 px-2 py-1 text-left text-xs hover:bg-muted"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-md border border-border/70 p-2 text-sm ${
              message.role === "assistant" ? "bg-panel" : "bg-accent/10"
            }`}
          >
            <div className="mb-1 flex items-center gap-1 text-xs text-fg/65">
              {message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {message.role === "assistant" ? "Analyst" : "You"}
            </div>
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.citations?.length ? (
              <div className="mt-2 border-t border-border/60 pt-1">
                <p className="text-xs font-medium">Sources</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {message.citations.slice(0, 6).map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border/70 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void askQuestion(question);
        }}
      >
        <Input
          placeholder="Ask about visible events..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !question.trim()} size="sm">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
