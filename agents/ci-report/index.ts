import { getAnthropicClient } from "../shared/model";
import type { CompanyProfile, CompetitorCard, ReportResult, ReportSummary, SSEEvent } from "../shared/types";
import { REPORT_CONFIG } from "./config";
import { reportSystemPrompt } from "./prompt";

export async function runReport(
  profile: CompanyProfile,
  competitors: CompetitorCard[],
  emit: (event: SSEEvent) => void
): Promise<ReportResult> {
  const client = getAnthropicClient();

  emit({ type: "status", agent: "report", step: "Starting report generation", detail: "Analyzing competitive landscape" });

  const systemPrompt = reportSystemPrompt(profile, competitors);

  // Provide the full competitor data as context
  const competitorContext = JSON.stringify(competitors, null, 2);

  emit({ type: "status", agent: "report", step: "Generating strategic analysis", detail: "Porter's Five Forces + Gartner positioning" });

  const message = await client.messages.create({
    model: REPORT_CONFIG.model,
    max_tokens: REPORT_CONFIG.maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Produce the competitive intelligence report based on this competitor data:\n\n${competitorContext}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: { summary: ReportSummary };
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    emit({ type: "error", agent: "report", detail: "Failed to parse report results" });
    throw new Error(`Report agent returned invalid JSON: ${text.slice(0, 200)}`);
  }

  const result: ReportResult = {
    summary: parsed.summary,
    competitors,
  };

  emit({
    type: "report",
    agent: "report",
    step: "Report complete",
    detail: "Strategic intelligence report generated",
    data: result,
  });

  return result;
}
