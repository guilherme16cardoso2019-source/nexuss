import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function StudentSubjectsPage() {
  const user = await requireRoleOrRedirect(["STUDENT"]);
  const profile = user.studentProfile!;

  const subjects = await prisma.studentSubject.findMany({
    where: { studentId: profile.id },
    include: { subject: true, progress: true },
    orderBy: { subject: { name: "asc" } },
  });

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">My Subjects</h1>
      <p className="text-nexus-textMuted mb-8">Your enrolled subjects and progress.</p>

      {subjects.length === 0 ? (
        <p className="text-sm text-nexus-textMuted">No subjects enrolled yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
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
