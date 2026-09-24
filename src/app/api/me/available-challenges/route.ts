import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/permissions";

export async function GET() {
  try {
    const user = await requireRole(["STUDENT"]);
    const studentId = user.studentProfile!.id;
    const classId = user.studentProfile!.classId;

    const enrolled = await prisma.studentSubject.findMany({
      where: { studentId },
      select: { subjectId: true },
    });
    const subjectIds = enrolled.map((e) => e.subjectId);

    const [challenges, completions] = await Promise.all([
      prisma.challenge.findMany({
        where: {
          subjectId: { in: subjectIds },
          // A challenge is visible if the teacher didn't scope it to a
          // specific class (open to the whole subject) OR it matches this
          // student's own class exactly — per the School -> Class ->
          // content visibility rule.
          OR: [{ classId: null }, { classId: classId ?? "__none__" }],
        },
        include: { subject: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.xPTransaction.findMany({
        where: { userId: user.id, sourceType: "CHALLENGE_COMPLETED" },
        select: { sourceId: true },
      }),
    ]);

    return NextResponse.json({
      challenges,
      completedIds: completions.map((c) => c.sourceId).filter(Boolean),
    });
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
