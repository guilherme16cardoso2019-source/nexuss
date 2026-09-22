import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError, UnauthorizedError } from "@/lib/permissions";
import { z } from "zod";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

const createSchema = z.object({
  name: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, "-");
    const subject = await prisma.subject.create({
      data: { name: parsed.data.name, slug },
    });
    return NextResponse.json(subject, { status: 201 });
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
