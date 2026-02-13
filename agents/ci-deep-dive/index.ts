import { getAnthropicClient } from "../shared/model";
import { tavilySearch } from "../shared/web-search";
import type { CompetitorCard, DeepDiveResult, SSEEvent } from "../shared/types";
import { DEEP_DIVE_CONFIG } from "./config";
import { deepDiveSystemPrompt } from "./prompt";

export async function runDeepDive(
  competitors: CompetitorCard[],
  emit: (event: SSEEvent) => void
): Promise<DeepDiveResult> {
  const client = getAnthropicClient();

  emit({ type: "status", agent: "deep-dive", step: "Starting deep dive", detail: `Researching ${competitors.length} competitors` });

  // Gather search results for each competitor (max 3 searches each)
  const allSearchResults: string[] = [];

  for (const competitor of competitors) {
    const searches: string[] = [];

    emit({ type: "status", agent: "deep-dive", step: `Researching ${competitor.name}`, detail: "Company profile and funding" });
    const profileSearch = await tavilySearch(`${competitor.name} ${competitor.domain || ""} company profile funding`);
    searches.push(profileSearch.results.map(r => `- ${r.title}: ${r.content}`).join("\n"));

    emit({ type: "status", agent: "deep-dive", step: `Researching ${competitor.name}`, detail: "Leadership and recent news" });
    const leadershipSearch = await tavilySearch(`${competitor.name} CEO CTO leadership team recent news`);
    searches.push(leadershipSearch.results.map(r => `- ${r.title}: ${r.content}`).join("\n"));

    if (DEEP_DIVE_CONFIG.maxSearchesPerCompetitor >= 3) {
      emit({ type: "status", agent: "deep-dive", step: `Researching ${competitor.name}`, detail: "Product and market position" });
      const productSearch = await tavilySearch(`${competitor.name} product launch partnership SWOT`);
      searches.push(productSearch.results.map(r => `- ${r.title}: ${r.content}`).join("\n"));
    }

    allSearchResults.push(`### ${competitor.name} (${competitor.domain || "N/A"})\n${searches.join("\n\n")}`);
  }

  // Ask Claude to produce detailed cards
  emit({ type: "status", agent: "deep-dive", step: "Synthesizing deep dive", detail: "Building competitor cards with SWOT analysis" });

  const systemPrompt = deepDiveSystemPrompt(competitors);
  const searchContext = allSearchResults.join("\n\n---\n\n");

  const message = await client.messages.create({
    model: DEEP_DIVE_CONFIG.model,
    max_tokens: DEEP_DIVE_CONFIG.maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Based on the following research, produce detailed competitor cards.\n\n${searchContext}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let result: DeepDiveResult;
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    emit({ type: "error", agent: "deep-dive", detail: "Failed to parse deep dive results" });
    throw new Error(`Deep dive agent returned invalid JSON: ${text.slice(0, 200)}`);
  }

  emit({
    type: "deep-dive",
    agent: "deep-dive",
    step: "Deep dive complete",
    detail: `Detailed cards for ${result.competitors.length} competitors`,
    data: result,
  });

  return result;
}
