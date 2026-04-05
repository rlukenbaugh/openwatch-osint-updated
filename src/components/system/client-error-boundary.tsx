"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClientErrorBoundaryProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

type ClientErrorBoundaryState = {
  hasError: boolean;
};

export class ClientErrorBoundary extends React.Component<
  ClientErrorBoundaryProps,
  ClientErrorBoundaryState
> {
  override state: ClientErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): ClientErrorBoundaryState {
    return {
      hasError: true
    };
  }

  override componentDidCatch(error: Error) {
    console.error(`${this.props.title} crashed`, error);
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold">{this.props.title}</p>
              <p className="text-sm text-fg/75">{this.props.description}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={this.reset}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
