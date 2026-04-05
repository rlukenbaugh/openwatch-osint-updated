import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityToLabel(severity: number): "Low" | "Guarded" | "Elevated" | "High" | "Critical" {
  if (severity <= 1) return "Low";
  if (severity === 2) return "Guarded";
  if (severity === 3) return "Elevated";
  if (severity === 4) return "High";
  return "Critical";
}

export function severityToColorClass(severity: number): string {
  if (severity <= 2) return "text-success";
  if (severity === 3) return "text-warning";
  if (severity === 4) return "text-orange-500";
  return "text-danger";
}

export function toCountryRegion(lat: number, lng: number): { country: string; region: string } {
  if (lat > 30 && lng > 30 && lng < 80) return { country: "Turkey", region: "Middle East" };
  if (lat > 24 && lng > 44 && lng < 65) return { country: "Saudi Arabia", region: "Middle East" };
  if (lat > 35 && lng > -10 && lng < 40) return { country: "Italy", region: "Europe" };
  if (lat > 15 && lng > 70 && lng < 90) return { country: "India", region: "South Asia" };
  if (lat > -35 && lat < 38 && lng > 110 && lng < 160) return { country: "Australia", region: "Oceania" };
  if (lat > -50 && lng > -85 && lng < -35) return { country: "Brazil", region: "South America" };
  if (lat > 14 && lat < 73 && lng > -170 && lng < -50) return { country: "United States", region: "North America" };
  if (lat > -35 && lat < 37 && lng > -20 && lng < 55) return { country: "Nigeria", region: "Africa" };
  return { country: "International", region: "Global" };
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const output: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    output.push(item);
  }
  return output;
}
