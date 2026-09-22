import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUBJECTS = [
  "Mathematics",
  "Portuguese",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Technology",
  "Programming",
];

async function seedSubjects() {
  for (const name of SUBJECTS) {
    const slug = name.toLowerCase();
    await prisma.subject.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
}

async function seedSuperAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Nexus Admin";

  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping SUPER_ADMIN creation."
    );
    return;
  }

  const existing = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (existing) {
    console.log("SUPER_ADMIN already exists — skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "SUPER_ADMIN" },
  });
  console.log(`SUPER_ADMIN created: ${email}`);
}

async function seedDevData() {
  const school = await prisma.school.upsert({
    where: { name: "Nexus Demo High School" },
    update: {},
    create: { name: "Nexus Demo High School" },
  });

  const math = await prisma.subject.findUniqueOrThrow({ where: { slug: "mathematics" } });
  const programming = await prisma.subject.findUniqueOrThrow({ where: { slug: "programming" } });

  await prisma.schoolSubject.upsert({
    where: { schoolId_subjectId: { schoolId: school.id, subjectId: math.id } },
    update: {},
    create: { schoolId: school.id, subjectId: math.id },
  });
  await prisma.schoolSubject.upsert({
    where: { schoolId_subjectId: { schoolId: school.id, subjectId: programming.id } },
    update: {},
    create: { schoolId: school.id, subjectId: programming.id },
  });

  const studentPasswordHash = await bcrypt.hash("Student123!", 12);
  const existingStudent = await prisma.user.findUnique({ where: { email: "student@nexus.dev" } });
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        name: "Alex Student",
        email: "student@nexus.dev",
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        schoolId: school.id,
        studentProfile: {
          create: {
            gradeYear: "10th Grade",
            subjects: { create: [{ subjectId: math.id }, { subjectId: programming.id }] },
          },
        },
      },
    });
  }

  const teacherPasswordHash = await bcrypt.hash("Teacher123!", 12);
  const existingTeacher = await prisma.user.findUnique({ where: { email: "teacher@nexus.dev" } });
  if (!existingTeacher) {
    await prisma.user.create({
      data: {
        name: "Jordan Teacher",
        email: "teacher@nexus.dev",
        passwordHash: teacherPasswordHash,
        role: "TEACHER",
        schoolId: school.id,
        teacherProfile: {
          create: { subjects: { create: [{ subjectId: math.id }] } },
        },
      },
    });
  }

  const adminPasswordHash = await bcrypt.hash("SchoolAdmin123!", 12);
  const existingSchoolAdmin = await prisma.user.findUnique({
    where: { email: "schooladmin@nexus.dev" },
  });
  if (!existingSchoolAdmin) {
    await prisma.user.create({
      data: {
        name: "Morgan Principal",
        email: "schooladmin@nexus.dev",
        passwordHash: adminPasswordHash,
        role: "SCHOOL_ADMIN",
        schoolId: school.id,
        schoolAdminProfile: { create: { position: "Principal" } },
      },
    });
  }

  console.log("Dev seed data ready:");
  console.log("  student@nexus.dev / Student123!");
  console.log("  teacher@nexus.dev / Teacher123!");
  console.log("  schooladmin@nexus.dev / SchoolAdmin123!");
}

async function main() {
  await seedSubjects();
  await seedSuperAdmin();
  await seedDevData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
