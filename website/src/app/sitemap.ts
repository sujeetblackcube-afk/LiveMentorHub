import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://livementorhub.com";

  const routes = [
    "",
    "/about",
    "/contact",
    "/institute",
    "/get-started",
    "/create-account",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/institute" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/institute" || route === "/get-started" ? 0.9 : 0.7,
  }));
}
