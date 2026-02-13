import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.ciReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      account: { select: { name: true } },
      _count: { select: { competitors: true } },
    },
  });

  return Response.json(
    reports.map(r => ({
      id: r.id,
      domain: r.domain,
      accountName: r.account.name,
      industry: r.industry,
      subIndustry: r.subIndustry,
      status: r.status,
      competitorCount: r._count.competitors,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}
