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
      const { name, email, password, schoolId, gradeYear, subjectIds } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }

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
              gradeYear,
              subjects: {
                create: subjectIds.map((subjectId) => ({ subjectId })),
              },
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
      const { name, email, password, schoolId, subjectIds } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
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
              subjects: {
                create: subjectIds.map((subjectId) => ({ subjectId })),
              },
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
      const { name, email, password, schoolId, position } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "SCHOOL_ADMIN",
          schoolId,
          schoolAdminProfile: {
            create: { position },
          },
        },
      });

      return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown registration role." }, { status: 400 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
