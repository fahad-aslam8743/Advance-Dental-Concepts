import type { MetadataRoute } from "next";

const privatePaths = ["/admin", "/api", "/preview"];

export default function robots(): MetadataRoute.Robots {
  const publicAndPrivateSafe = {
    allow: "/",
    disallow: privatePaths
  };
  return {
    rules: [
      { userAgent: "*", ...publicAndPrivateSafe },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "anthropic-ai", "PerplexityBot"],
        ...publicAndPrivateSafe
      }
    ],
    sitemap: "https://advance-dental-concepts.vercel.app/sitemap.xml"
  };
}
