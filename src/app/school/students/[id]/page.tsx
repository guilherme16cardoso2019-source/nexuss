import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireRoleOrRedirect(["SCHOOL_ADMIN"]);

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      studentProfile: {
        include: {
          class: true,
          subjects: { include: { subject: true, progress: true } },
        },
      },
    },
  });

  if (!student || student.role !== "STUDENT") notFound();

  // Structural school-scoping: a School Admin can only ever see a student
  // who belongs to their own school. This is not optional UI hiding — it's
  // enforced here, server-side, before any data is returned.
  if (student.schoolId !== admin.schoolId) notFound();

  const subjects = student.studentProfile?.subjects ?? [];

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <Link href="/school/students" className="text-sm text-nexus-textMuted hover:text-nexus-text">
        ← Back to Students
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-1">{student.name}</h1>
      <p className="text-nexus-textMuted mb-8">
        {student.email} · {student.studentProfile?.class?.name ?? "No class assigned"}
      </p>

      <h2 className="font-semibold mb-4">Grades by Subject</h2>
      {subjects.length === 0 ? (
        <p className="text-sm text-nexus-textMuted">This student isn&apos;t enrolled in any subjects yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="p-5 rounded-xl border border-nexus-border bg-nexus-surface">
              <p className="font-medium mb-2">{s.subject.name}</p>
              <div className="w-full h-2 rounded-full bg-nexus-border overflow-hidden">
                <div
                  className="h-full bg-nexus-accent"
                  style={{ width: `${s.progress?.percentComplete ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-nexus-textMuted mt-2">
                {s.progress?.percentComplete ?? 0}% complete
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
