import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(topics);
}
