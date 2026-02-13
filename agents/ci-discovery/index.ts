import { getAnthropicClient } from "../shared/model";
import { tavilySearch } from "../shared/web-search";
import type { AnalysisInput, DiscoveryResult, SSEEvent, CompetitorCard } from "../shared/types";
import { DISCOVERY_CONFIG } from "./config";
import { discoverySystemPrompt } from "./prompt";

export async function runDiscovery(
  input: AnalysisInput,
  emit: (event: SSEEvent) => void
): Promise<DiscoveryResult> {
  const client = getAnthropicClient();

  emit({ type: "status", agent: "discovery", step: "Starting discovery", detail: `Profiling ${input.domain}` });

  // Step 1: Search for the target company
  emit({ type: "status", agent: "discovery", step: "Researching target", detail: `Searching for ${input.domain} company info` });
  const targetSearch = await tavilySearch(`${input.domain} company ${input.industry} ${input.subIndustry}`);

  // Step 2: Search for competitors
  emit({ type: "status", agent: "discovery", step: "Identifying competitors", detail: `Searching for competitors in ${input.subIndustry}` });
  const competitorSearch = await tavilySearch(`${input.domain} competitors alternatives ${input.subIndustry}`);

  // Step 3: Additional context search if known competitors provided
  let knownCompSearch = null;
  if (input.knownCompetitors) {
    emit({ type: "status", agent: "discovery", step: "Validating known competitors", detail: `Checking: ${input.knownCompetitors}` });
    knownCompSearch = await tavilySearch(`${input.knownCompetitors} vs ${input.domain} competitive landscape`);
  }

  // Step 4: Ask Claude to synthesize
  emit({ type: "status", agent: "discovery", step: "Analyzing results", detail: "Synthesizing competitive landscape" });

  const searchContext = [
    `Target company search results:\n${targetSearch.results.map(r => `- ${r.title}: ${r.content}`).join("\n")}`,
    `Competitor search results:\n${competitorSearch.results.map(r => `- ${r.title}: ${r.content}`).join("\n")}`,
    knownCompSearch ? `Known competitor context:\n${knownCompSearch.results.map(r => `- ${r.title}: ${r.content}`).join("\n")}` : "",
  ].filter(Boolean).join("\n\n---\n\n");

  const systemPrompt = discoverySystemPrompt(input);

  const message = await client.messages.create({
    model: DISCOVERY_CONFIG.model,
    max_tokens: DISCOVERY_CONFIG.maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Based on the following search results, profile the target and identify competitors.\n\n${searchContext}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let result: DiscoveryResult;
  try {
    // Try to parse the JSON from the response, stripping any markdown fences
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    emit({ type: "error", agent: "discovery", detail: "Failed to parse discovery results" });
    throw new Error(`Discovery agent returned invalid JSON: ${text.slice(0, 200)}`);
  }

  // Enforce max 5 competitors
  if (result.competitors.length > DISCOVERY_CONFIG.maxCompetitors) {
    result.competitors = result.competitors.slice(0, DISCOVERY_CONFIG.maxCompetitors);
  }

  // Ensure valid threatLevel values
  result.competitors = result.competitors.map((c: CompetitorCard) => ({
    ...c,
    threatLevel: (["Direct", "Adjacent", "Emerging"] as const).includes(c.threatLevel as "Direct" | "Adjacent" | "Emerging")
      ? c.threatLevel
      : "Direct",
  }));

  emit({
    type: "discovery",
    agent: "discovery",
    step: "Discovery complete",
    detail: `Found ${result.competitors.length} competitors`,
    data: result,
  });

  return result;
}
