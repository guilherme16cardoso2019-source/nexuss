import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/permissions";

export async function GET() {
  try {
    const user = await requireRole(["TEACHER"]);
    const teacherId = user.teacherProfile!.id;

    const activities = await prisma.activity.findMany({
      where: { teacherId },
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
