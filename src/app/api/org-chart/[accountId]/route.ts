import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      people: {
        orderBy: { level: "asc" },
      },
    },
  });

  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json({
    id: account.id,
    name: account.name,
    domain: account.domain,
    industry: account.industry,
    tier: account.tier,
    hq: account.hq,
    employees: account.employees,
    founded: account.founded,
    revenue: account.revenue,
    website: account.website,
    logo: account.logo,
    linkedinUrl: account.linkedinUrl,
    people: account.people.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      department: p.department,
      tags: p.tags,
      active: p.active,
      level: p.level,
      linkedinUrl: p.linkedinUrl,
      parentId: p.reportsToId,
    })),
  });
}
