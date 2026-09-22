import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboard() {
  const user = await requireRoleOrRedirect(["TEACHER"]);
  const profile = user.teacherProfile!;

  const taughtSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId: profile.id },
    include: { subject: true },
  });
  const subjectIds = taughtSubjects.map((t) => t.subjectId);

  const [studentCount, activities, challenges] = await Promise.all([
    prisma.studentSubject.count({
      where: { subjectId: { in: subjectIds } },
    }),
    prisma.activity.findMany({ where: { teacherId: profile.id }, include: { subject: true } }),
    prisma.challenge.findMany({ where: { teacherId: profile.id }, include: { subject: true } }),
  ]);

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">Welcome, {user.name}!</h1>
      <p className="text-nexus-textMuted mb-8">Manage your subjects, activities and challenges.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Subjects Taught" value={taughtSubjects.length} />
        <Stat label="Students Reached" value={studentCount} />
        <Stat label="Activities" value={activities.length} />
        <Stat label="Challenges" value={challenges.length} />
      </div>

      <section className="mb-10">
        <h2 className="font-semibold mb-4">My Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {taughtSubjects.map((t) => (
            <span key={t.id} className="px-3 py-1 rounded-full text-xs border border-nexus-border">
              {t.subject.name}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-4">Recent Activities</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-nexus-textMuted">No activities created yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {activities.map((a) => (
              <li key={a.id} className="border border-nexus-border rounded-lg px-4 py-3 bg-nexus-surface text-sm">
                <span className="font-medium">{a.title}</span>
                <span className="text-nexus-textMuted"> — {a.subject.name}</span>
              </li>
            ))}
          </ul>
        )}
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
