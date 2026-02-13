import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { service } = body as { service: "anthropic" | "tavily" | "attio" | "database" };

  const results: Record<string, { ok: boolean; message: string }> = {};

  try {
    if (service === "anthropic" || !service) {
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": process.env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 10,
              messages: [{ role: "user", content: "ping" }],
            }),
          });
          results.anthropic = { ok: res.ok, message: res.ok ? "Connected" : `Status ${res.status}` };
        } catch (err) {
          results.anthropic = { ok: false, message: err instanceof Error ? err.message : "Connection failed" };
        }
      } else {
        results.anthropic = { ok: false, message: "API key not configured" };
      }
    }

    if (service === "tavily" || !service) {
      if (process.env.TAVILY_API_KEY) {
        try {
          const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: "test",
              max_results: 1,
            }),
          });
          results.tavily = { ok: res.ok, message: res.ok ? "Connected" : `Status ${res.status}` };
        } catch (err) {
          results.tavily = { ok: false, message: err instanceof Error ? err.message : "Connection failed" };
        }
      } else {
        results.tavily = { ok: false, message: "API key not configured" };
      }
    }

    if (service === "attio" || !service) {
      if (process.env.ATTIO_API_KEY) {
        try {
          const res = await fetch("https://api.attio.com/v2/self", {
            headers: { Authorization: `Bearer ${process.env.ATTIO_API_KEY}` },
          });
          results.attio = { ok: res.ok, message: res.ok ? "Connected" : `Status ${res.status}` };
        } catch (err) {
          results.attio = { ok: false, message: err instanceof Error ? err.message : "Connection failed" };
        }
      } else {
        results.attio = { ok: false, message: "API key not configured" };
      }
    }

    if (service === "database" || !service) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.$queryRaw`SELECT 1`;
        results.database = { ok: true, message: "Connected" };
      } catch (err) {
        results.database = { ok: false, message: err instanceof Error ? err.message : "Connection failed" };
      }
    }

    return Response.json(results);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Test failed" },
      { status: 500 }
    );
  }
}
