import type { SSEEvent } from "../shared/types";

export async function runSignalScanner(
  _accountDomain: string,
  emit: (event: SSEEvent) => void
): Promise<void> {
  emit({ type: "error", agent: "signal-scanner", detail: "Not yet implemented" });
  throw new Error("Signal scanner agent is not yet implemented");
}
