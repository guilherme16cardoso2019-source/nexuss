import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function SchoolStudentsPage() {
  const user = await requireRoleOrRedirect(["SCHOOL_ADMIN"]);
  const schoolId = user.schoolId!;

  const students = await prisma.user.findMany({
    where: { schoolId, role: "STUDENT" },
    include: {
      studentProfile: {
        include: { class: true, subjects: { include: { subject: true, progress: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">Students</h1>
      <p className="text-nexus-textMuted mb-8">Click a student to see their grades.</p>

      {students.length === 0 ? (
        <p className="text-sm text-nexus-textMuted">No students registered yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {students.map((s) => {
            const subjects = s.studentProfile?.subjects ?? [];
            const avg =
              subjects.length > 0
                ? Math.round(
                    subjects.reduce((sum, sub) => sum + (sub.progress?.percentComplete ?? 0), 0) /
                      subjects.length
                  )
                : 0;
            return (
              <Link
                key={s.id}
                href={`/school/students/${s.id}`}
                className="flex items-center justify-between border border-nexus-border rounded-lg px-5 py-4 bg-nexus-surface hover:border-nexus-primary transition"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-nexus-textMuted">
                    {s.studentProfile?.class?.name ?? "No class"} · {subjects.length} subject
                    {subjects.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-sm text-nexus-accent font-semibold">{avg}% avg</span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
