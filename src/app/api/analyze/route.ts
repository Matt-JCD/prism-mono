import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { runDiscovery } from "@agents/ci-discovery";
import { runDeepDive } from "@agents/ci-deep-dive";
import { runReport } from "@agents/ci-report";
import { prisma } from "@/lib/prisma";
import type { SSEEvent } from "@agents/shared/types";

const AnalysisInputSchema = z.object({
  domain: z.string().min(1),
  industry: z.string().min(1),
  subIndustry: z.string().min(1),
  hq: z.string().optional(),
  targetGeography: z.array(z.string()).optional(),
  knownCompetitors: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = AnalysisInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: SSEEvent) {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      try {
        // Phase 1: Discovery
        emit({ type: "status", agent: "orchestrator", step: "Pipeline started", detail: `Analyzing ${input.domain}` });
        const discoveryResult = await runDiscovery(input, emit);

        // Phase 2: Deep Dive
        emit({ type: "status", agent: "orchestrator", step: "Handoff", detail: "Discovery -> Deep Dive" });
        const deepDiveResult = await runDeepDive(discoveryResult.competitors, emit);

        // Phase 3: Report
        emit({ type: "status", agent: "orchestrator", step: "Handoff", detail: "Deep Dive -> Report" });
        const reportResult = await runReport(discoveryResult.profile, deepDiveResult.competitors, emit);

        // Persist to database
        try {
          const account = await prisma.account.upsert({
            where: { domain: input.domain },
            update: {
              name: discoveryResult.profile.name,
              industry: input.industry,
              subIndustry: input.subIndustry,
              hq: input.hq || discoveryResult.profile.hq,
            },
            create: {
              domain: input.domain,
              name: discoveryResult.profile.name,
              industry: input.industry,
              subIndustry: input.subIndustry,
              hq: input.hq || discoveryResult.profile.hq,
              website: input.domain,
              tier: "Prospect",
            },
          });

          const report = await prisma.ciReport.create({
            data: {
              domain: input.domain,
              industry: input.industry,
              subIndustry: input.subIndustry,
              hq: input.hq,
              geography: input.targetGeography || [],
              status: "complete",
              summary: reportResult.summary as object,
              accountId: account.id,
              competitors: {
                create: reportResult.competitors.map(c => ({
                  name: c.name,
                  domain: c.domain,
                  description: c.description,
                  founded: c.founded,
                  hq: c.hq,
                  teamSize: c.teamSize,
                  fundingRound: c.funding?.round,
                  fundingAmount: c.funding?.amount,
                  fundingInvestors: c.funding?.investors || [],
                  fundingDate: c.funding?.date,
                  keyLeaders: c.keyLeaders as object[] || [],
                  whatTheyDo: c.whatTheyDo,
                  recentMoves: c.recentMoves as object[] || [],
                  swot: c.swot as object || {},
                  threatLevel: c.threatLevel,
                  confidenceScore: c.confidenceScore,
                })),
              },
            },
          });

          emit({ type: "status", agent: "orchestrator", step: "Saved", detail: `Report ${report.id} persisted` });
        } catch (dbErr) {
          // Don't fail the whole pipeline if persistence fails
          emit({ type: "status", agent: "orchestrator", step: "Warning", detail: `Failed to persist: ${dbErr instanceof Error ? dbErr.message : "unknown"}` });
        }

        // Done
        emit({
          type: "done",
          agent: "orchestrator",
          step: "Pipeline complete",
          data: {
            profile: discoveryResult.profile,
            competitors: reportResult.competitors,
            summary: reportResult.summary,
          },
        });
      } catch (error) {
        emit({
          type: "error",
          agent: "orchestrator",
          detail: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
