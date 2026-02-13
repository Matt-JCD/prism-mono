import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAttioPeople } from "@agents/org-import";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { accountId } = body as { accountId: string };

  if (!accountId) {
    return Response.json({ error: "accountId required" }, { status: 400 });
  }

  if (!process.env.ATTIO_API_KEY) {
    return Response.json({ error: "ATTIO_API_KEY not configured" }, { status: 500 });
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const attioPeople = await fetchAttioPeople(100);

    let imported = 0;
    for (const person of attioPeople) {
      await prisma.person.upsert({
        where: { attioId: person.attioId },
        update: {
          name: person.name,
          role: person.role,
          linkedinUrl: person.linkedinUrl,
          email: person.email,
        },
        create: {
          name: person.name,
          role: person.role,
          linkedinUrl: person.linkedinUrl,
          email: person.email,
          attioId: person.attioId,
          accountId,
          active: true,
          level: 0,
          tags: [],
        },
      });
      imported++;
    }

    return Response.json({ imported, total: attioPeople.length });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to import from Attio" },
      { status: 500 }
    );
  }
}
