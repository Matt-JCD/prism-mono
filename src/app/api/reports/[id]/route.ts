import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.ciReport.findUnique({
    where: { id },
    include: {
      account: true,
      competitors: true,
    },
  });

  if (!report) {
    return Response.json({ error: "Report not found" }, { status: 404 });
  }

  return Response.json(report);
}
