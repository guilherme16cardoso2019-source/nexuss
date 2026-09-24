import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function SchoolAdminDashboard() {
  const user = await requireRoleOrRedirect(["SCHOOL_ADMIN"]);
  const schoolId = user.schoolId!;

  const [school, studentCount, teacherCount, subjects] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolId } }),
    prisma.user.count({ where: { schoolId, role: "STUDENT" } }),
    prisma.user.count({ where: { schoolId, role: "TEACHER" } }),
    prisma.schoolSubject.findMany({ where: { schoolId }, include: { subject: true } }),
  ]);

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">{school?.name}</h1>
      <p className="text-nexus-textMuted mb-8">School Overview</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Link href="/school/students">
          <Stat label="Students (click to view)" value={studentCount} />
        </Link>
        <Stat label="Teachers" value={teacherCount} />
        <Stat label="Subjects" value={subjects.length} />
      </div>

      <section>
        <h2 className="font-semibold mb-4">Subjects Offered</h2>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <span key={s.id} className="px-3 py-1 rounded-full text-xs border border-nexus-border">
              {s.subject.name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-5 rounded-xl border border-nexus-border bg-nexus-surface text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-nexus-textMuted mt-1">{label}</p>
    </div>
  );
}
