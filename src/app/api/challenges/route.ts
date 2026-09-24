import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/permissions";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  subjectId: z.string().cuid(),
  topicId: z.string().cuid().optional().or(z.literal("")),
  classId: z.string().cuid().optional().or(z.literal("")),
  xpReward: z.number().int().min(1).max(1000).default(10),
});

export async function POST(req: Request) {
  try {
    const user = await requireRole(["TEACHER"]);
    const teacherId = user.teacherProfile!.id;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { title, description, subjectId, topicId, classId, xpReward } = parsed.data;

    const teaches = await prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId: { teacherId, subjectId } },
    });
    if (!teaches) {
      return NextResponse.json({ error: "You are not assigned to teach this subject." }, { status: 403 });
    }

    if (topicId) {
      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (!topic || topic.subjectId !== subjectId) {
        return NextResponse.json({ error: "That topic does not belong to this subject." }, { status: 400 });
      }
    }

    if (classId) {
      const teachesClass = await prisma.teacherClass.findUnique({
        where: { teacherId_classId: { teacherId, classId } },
      });
      if (!teachesClass) {
        return NextResponse.json({ error: "You do not teach that class." }, { status: 403 });
      }
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        subjectId,
        teacherId,
        xpReward,
        topicId: topicId || null,
        classId: classId || null,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
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
