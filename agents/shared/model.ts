import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function createModel(config: { model: string; maxTokens: number }) {
  return {
    model: config.model,
    maxTokens: config.maxTokens,
    client: getAnthropicClient(),
  };
}

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
