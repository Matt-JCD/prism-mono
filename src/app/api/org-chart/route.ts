import { prisma } from "@/lib/prisma";

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { people: true } },
    },
  });

  return Response.json(
    accounts.map(a => ({
      id: a.id,
      name: a.name,
      domain: a.domain,
      industry: a.industry,
      tier: a.tier,
      hq: a.hq,
      employees: a.employees,
      founded: a.founded,
      revenue: a.revenue,
      website: a.website,
      logo: a.logo,
      linkedinUrl: a.linkedinUrl,
      contactCount: a._count.people,
      updatedAt: a.updatedAt.toISOString(),
    }))
  );
}
