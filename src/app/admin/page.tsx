import { requireRoleOrRedirect } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  await requireRoleOrRedirect(["SUPER_ADMIN"]);

  const [totalUsers, totalStudents, totalTeachers, totalSchools] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.school.count(),
  ]);

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">Nexus Administration</h1>
      <p className="text-nexus-textMuted mb-8">Platform-wide overview.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Users" value={totalUsers} />
        <Stat label="Total Students" value={totalStudents} />
        <Stat label="Total Teachers" value={totalTeachers} />
        <Stat label="Total Schools" value={totalSchools} />
      </div>
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
