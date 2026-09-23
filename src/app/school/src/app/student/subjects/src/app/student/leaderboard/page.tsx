import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  const user = await requireRoleOrRedirect(["STUDENT"]);

  const totals = await prisma.xPTransaction.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 50,
  });

  const userIds = totals.map((t) => t.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, schoolId: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const ranked = totals
    .map((t) => ({
      userId: t.userId,
      name: userMap.get(t.userId)?.name ?? "Unknown",
      xp: t._sum.amount ?? 0,
    }))
    .filter((r) => userMap.has(r.userId));

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
      <p className="text-nexus-textMuted mb-8">Global ranking by total XP.</p>

      {ranked.length === 0 ? (
        <p className="text-sm text-nexus-textMuted">No XP earned yet — complete a challenge to appear here.</p>
      ) : (
        <div className="border border-nexus-border rounded-xl overflow-hidden max-w-xl">
          {ranked.map((r, i) => (
            <div
              key={r.userId}
              className={`flex items-center justify-between px-5 py-3 text-sm border-t border-nexus-border first:border-t-0 ${
                r.userId === user.id ? "bg-nexus-primary/10" : "bg-nexus-surface"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-nexus-textMuted w-6">{i + 1}</span>
                <span className={r.userId === user.id ? "font-semibold" : ""}>
                  {r.name} {r.userId === user.id && "(you)"}
                </span>
              </span>
              <span className="text-nexus-accent font-semibold">{r.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
