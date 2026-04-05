"use client";

import Link from "next/link";
import { AlertTriangle, LifeBuoy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-bg p-6 text-fg">
        <div className="w-full max-w-xl rounded-2xl border border-warning/40 bg-panel p-6 shadow-panel">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 text-warning" />
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-warning">Application Error</p>
                <h1 className="mt-1 text-xl font-semibold">A client-side exception interrupted this screen.</h1>
                <p className="mt-2 text-sm text-fg/75">
                  The app is still installed correctly, but one route failed while rendering. You can retry this page
                  or move to a stable screen while we continue hardening the dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
                <Link href="/alerts" className="inline-flex">
                  <Button variant="secondary">Open alerts</Button>
                </Link>
                <Link href="/webcams" className="inline-flex">
                  <Button variant="secondary">Open webcams</Button>
                </Link>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-fg/70">
                <p className="inline-flex items-center gap-1 font-medium">
                  <LifeBuoy className="h-3.5 w-3.5" />
                  Diagnostic detail
                </p>
                <p className="mt-1 break-all">
                  {error.message || "Unknown client error"}
                  {error.digest ? ` (${error.digest})` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
