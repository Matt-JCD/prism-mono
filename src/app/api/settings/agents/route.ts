import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configs = await prisma.agentConfig.findMany({
    orderBy: { agentName: "asc" },
  });

  // If no configs exist yet, return defaults
  if (configs.length === 0) {
    const defaults = [
      { agentName: "ci-discovery", model: "claude-haiku-4-5-20251001", maxTokens: 2000, enabled: true },
      { agentName: "ci-deep-dive", model: "claude-haiku-4-5-20251001", maxTokens: 3000, enabled: true },
      { agentName: "ci-report", model: "claude-sonnet-4-5-20250929", maxTokens: 4000, enabled: true },
      { agentName: "signal-scanner", model: "claude-haiku-4-5-20251001", maxTokens: 2000, enabled: false },
      { agentName: "org-import", model: "claude-haiku-4-5-20251001", maxTokens: 1000, enabled: true },
    ];
    return Response.json(defaults);
  }

  return Response.json(configs);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { agentName, model, maxTokens, enabled } = body as {
    agentName: string;
    model?: string;
    maxTokens?: number;
    enabled?: boolean;
  };

  if (!agentName) {
    return Response.json({ error: "agentName required" }, { status: 400 });
  }

  const config = await prisma.agentConfig.upsert({
    where: { agentName },
    update: {
      ...(model !== undefined && { model }),
      ...(maxTokens !== undefined && { maxTokens }),
      ...(enabled !== undefined && { enabled }),
    },
    create: {
      agentName,
      model: model || "claude-haiku-4-5-20251001",
      maxTokens: maxTokens || 2000,
      enabled: enabled ?? true,
    },
  });

  return Response.json(config);
}
