import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ForbiddenError } from "@/lib/permissions";
import { z } from "zod";

// Public on purpose: a visitor picking their class during registration
// needs this before they have an account.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  if (!schoolId) {
    return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
  }

  const classes = await prisma.class.findMany({
    where: { schoolId },
    select: { id: true, name: true, level: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(classes);
}

const createSchema = z.object({
  name: z.string().min(1),
  level: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    // A school admin may only add classes to their own school —
    // requireSchoolAccess (called with their own schoolId) proves that
    // server-side from the database, never from anything the client sends.
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { requireRole } = await import("@/lib/permissions");
    const admin = await requireRole(["SCHOOL_ADMIN"]);
    const schoolId = admin.schoolId!;

    const created = await prisma.class.create({
      data: { schoolId, name: parsed.data.name, level: parsed.data.level },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: "You do not have permission to access this page." }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
