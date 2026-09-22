import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public on purpose: a visitor must be able to pick their school before
// they have an account. Only name/id are exposed — no student/teacher data.
export async function GET() {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(schools);
}
