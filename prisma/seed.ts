import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const agents = [
    { agentName: "ci-discovery", model: "claude-haiku-4-5-20251001", maxTokens: 2000 },
    { agentName: "ci-deep-dive", model: "claude-haiku-4-5-20251001", maxTokens: 3000 },
    { agentName: "ci-report", model: "claude-sonnet-4-5-20250929", maxTokens: 4000 },
    { agentName: "signal-scanner", model: "claude-haiku-4-5-20251001", maxTokens: 2000 },
    { agentName: "org-import", model: "claude-haiku-4-5-20251001", maxTokens: 1000 },
  ];

  for (const agent of agents) {
    await prisma.agentConfig.upsert({
      where: { agentName: agent.agentName },
      update: {},
      create: agent,
    });
  }

  console.log("Seeded agent configs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
