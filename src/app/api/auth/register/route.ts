import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  studentRegisterSchema,
  teacherRegisterSchema,
  schoolAdminRegisterSchema,
} from "@/lib/validation/auth";

// SECURITY NOTE: `role` is never read from the request body. It is
// determined solely by which `role` query param / form this endpoint
// was called for, and hardcoded into the create call below.

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const formRole = url.searchParams.get("role"); // "student" | "teacher" | "school_admin"
    const body = await req.json();

    if (formRole === "student") {
      const parsed = studentRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const { name, email, password, schoolId, classId } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }

      // The chosen class must actually belong to the chosen school —
      // otherwise a student could get assigned to another school's class.
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (!cls || cls.schoolId !== schoolId) {
        return NextResponse.json({ error: "That class does not belong to the selected school." }, { status: 400 });
      }

      // Auto-enroll in every subject the school offers — the student never
      // manually picks subjects; content visibility is driven by class + subject.
      const schoolSubjects = await prisma.schoolSubject.findMany({ where: { schoolId } });

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STUDENT",
          schoolId,
          studentProfile: {
            create: {
              classId,
              subjects: { create: schoolSubjects.map((s) => ({ subjectId: s.subjectId })) },
            },
          },
        },
      });

      return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
    }

    if (formRole === "teacher") {
      const parsed = teacherRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const { name, email, password, schoolId, subjectId, classIds } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }

      // Every selected class must belong to the chosen school.
      const classes = await prisma.class.findMany({ where: { id: { in: classIds } } });
      if (classes.length !== classIds.length || classes.some((c) => c.schoolId !== schoolId)) {
        return NextResponse.json({ error: "One or more classes do not belong to the selected school." }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "TEACHER",
          schoolId,
          teacherProfile: {
            create: {
              subjects: { create: [{ subjectId }] },
              classes: { create: classIds.map((classId) => ({ classId })) },
            },
          },
        },
      });

      return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
    }

    if (formRole === "school_admin") {
      const parsed = schoolAdminRegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      const { name, email, password, schoolName, schoolCode, position } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }

      // The admin CREATES their own school here — this is the only place a
      // school gets created. Teachers/students only ever SELECT one.
      const school = await prisma.school.upsert({
        where: { name: schoolName },
        update: {},
        create: { name: schoolName, code: schoolCode || undefined },
      });

      // Give every new school a default set of classes so teachers and
      // students can register right away; the admin can add more later.
      const existingClasses = await prisma.class.count({ where: { schoolId: school.id } });
      if (existingClasses === 0) {
        const defaults = [
          { name: "1º Ano A", level: "Ensino Médio" },
          { name: "1º Ano B", level: "Ensino Médio" },
          { name: "2º Ano A", level: "Ensino Médio" },
          { name: "2º Ano B", level: "Ensino Médio" },
          { name: "3º Ano A", level: "Ensino Médio" },
        ];
        await prisma.class.createMany({
          data: defaults.map((c) => ({ ...c, schoolId: school.id })),
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "SCHOOL_ADMIN",
          schoolId: school.id,
          schoolAdminProfile: { create: { position } },
        },
      });

      return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown registration role." }, { status: 400 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
