import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const user = await requireRoleOrRedirect(["STUDENT"]);
  const profile = user.studentProfile!;

  const [subjects, xpAgg, recentXp] = await Promise.all([
    prisma.studentSubject.findMany({
      where: { studentId: profile.id },
      include: { subject: true, progress: true },
    }),
    prisma.xPTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    prisma.xPTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalXp = xpAgg._sum.amount ?? 0;

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name}!</h1>
      <p className="text-nexus-textMuted mb-8">Here&apos;s where you stand in Nexus.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="XP" value={totalXp} />
        <Stat label="Level" value={profile.level} />
        <Stat label="Current Streak" value={`${profile.currentStreak} days`} />
        <Stat label="Subjects" value={subjects.length} />
      </div>

      <section className="mb-10">
        <h2 className="font-semibold mb-4">My Subjects</h2>
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
      </section>

      <section>
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        {recentXp.length === 0 ? (
          <p className="text-sm text-nexus-textMuted">No activity yet — join a challenge or battle to start earning XP.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentXp.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between text-sm border border-nexus-border rounded-lg px-4 py-3 bg-nexus-surface"
              >
                <span className="text-nexus-textMuted">{tx.sourceType.replaceAll("_", " ")}</span>
                <span className="font-medium text-nexus-accent">+{tx.amount} XP</span>
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
