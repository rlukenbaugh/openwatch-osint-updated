import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const routes = ["/", "/tools", "/workspace", "/dashboard", "/map", "/webcams", "/alerts"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" || route === "/tools" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7
  }));
}
