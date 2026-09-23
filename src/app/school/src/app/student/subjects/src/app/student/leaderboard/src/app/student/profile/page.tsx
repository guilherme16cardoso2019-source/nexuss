import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function StudentProfilePage() {
  const user = await requireRoleOrRedirect(["STUDENT"]);
  const profile = user.studentProfile!;

  const [school, xpAgg] = await Promise.all([
    prisma.school.findUnique({ where: { id: user.schoolId! } }),
    prisma.xPTransaction.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
  ]);

  const totalXp = xpAgg._sum.amount ?? 0;

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      <div className="max-w-md bg-nexus-surface border border-nexus-border rounded-2xl p-6 flex flex-col gap-4">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="School" value={school?.name ?? "—"} />
        <Field label="Grade / Year" value={profile.gradeYear} />
        <Field label="Level" value={String(profile.level)} />
        <Field label="Total XP" value={String(totalXp)} />
        <Field label="Current Streak" value={`${profile.currentStreak} days`} />
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b border-nexus-border pb-3 last:border-0 last:pb-0">
      <span className="text-nexus-textMuted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
