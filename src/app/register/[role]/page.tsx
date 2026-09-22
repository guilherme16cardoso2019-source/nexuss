"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Subject = { id: string; name: string };
type School = { id: string; name: string };

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School Administrator",
};

export default function RegisterPage({ params }: { params: { role: string } }) {
  const role = params.role;
  const router = useRouter();

  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
    gradeYear: "",
    position: "",
    subjectIds: [] as string[],
  });

  useEffect(() => {
    fetch("/api/schools").then((r) => r.json()).then(setSchools);
    fetch("/api/subjects").then((r) => r.json()).then(setSubjects);
  }, []);

  if (!ROLE_LABELS[role]) {
    return <main className="p-10 text-center">Unknown registration role.</main>;
  }

  function toggleSubject(id: string) {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds.includes(id)
        ? f.subjectIds.filter((s) => s !== id)
        : [...f.subjectIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/auth/register?role=${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-nexus-bg">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-xl font-bold mb-8">
          NEXUS
        </Link>
        <form
          onSubmit={handleSubmit}
          className="bg-nexus-surface border border-nexus-border rounded-2xl p-8 flex flex-col gap-4"
        >
          <h1 className="text-lg font-semibold mb-2">Register as {ROLE_LABELS[role]}</h1>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">
              Account created successfully. Redirecting to login…
            </p>
          )}

          <input
            placeholder="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
          />

          <select
            required
            value={form.schoolId}
            onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select School</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {role === "student" && (
            <input
              placeholder="Grade / Year"
              required
              value={form.gradeYear}
              onChange={(e) => setForm({ ...form, gradeYear: e.target.value })}
              className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
            />
          )}

          {role === "school_admin" && (
            <input
              placeholder="Position"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
            />
          )}

          {(role === "student" || role === "teacher") && (
            <div>
              <p className="text-xs text-nexus-textMuted mb-2">
                {role === "student" ? "Subjects / Interests" : "Subjects Taught"}
              </p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      form.subjectIds.includes(s.id)
                        ? "bg-nexus-primary border-nexus-primary"
                        : "border-nexus-border text-nexus-textMuted"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-2 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium text-sm disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
