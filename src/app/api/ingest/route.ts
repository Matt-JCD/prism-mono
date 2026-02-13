import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface PersonInput {
  name: string;
  role?: string;
  department?: string;
  tags?: string[];
  active?: boolean;
  level?: number;
  linkedinUrl?: string;
  email?: string;
  parentId?: string | null;
  attioId?: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { accountId, people } = body as { accountId: string; people: PersonInput[] };

  if (!accountId || !Array.isArray(people)) {
    return Response.json({ error: "accountId and people[] required" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  const results = [];
  for (const person of people) {
    if (person.attioId) {
      // Upsert by attioId
      const result = await prisma.person.upsert({
        where: { attioId: person.attioId },
        update: {
          name: person.name,
          role: person.role,
          department: person.department,
          tags: person.tags || [],
          active: person.active ?? true,
          level: person.level ?? 0,
          linkedinUrl: person.linkedinUrl,
          email: person.email,
        },
        create: {
          name: person.name,
          role: person.role,
          department: person.department,
          tags: person.tags || [],
          active: person.active ?? true,
          level: person.level ?? 0,
          linkedinUrl: person.linkedinUrl,
          email: person.email,
          attioId: person.attioId,
          accountId,
        },
      });
      results.push(result);
    } else {
      // Create new
      const result = await prisma.person.create({
        data: {
          name: person.name,
          role: person.role,
          department: person.department,
          tags: person.tags || [],
          active: person.active ?? true,
          level: person.level ?? 0,
          linkedinUrl: person.linkedinUrl,
          email: person.email,
          accountId,
          reportsToId: person.parentId || null,
        },
      });
      results.push(result);
    }
  }

  return Response.json({ imported: results.length, people: results });
}
