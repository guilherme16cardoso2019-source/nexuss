"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Class = { id: string; name: string; level: string };

export default function SchoolClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Ensino Médio");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  async function load() {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    setSchoolId(me.schoolId);
    if (me.schoolId) {
      const res = await fetch(`/api/classes?schoolId=${me.schoolId}`);
      if (res.ok) setClasses(await res.json());
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong.");
      return;
    }

    setMessage("Class added!");
    setName("");
    load();
  }

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-8">Classes</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md bg-nexus-surface border border-nexus-border rounded-2xl p-6 flex flex-col gap-3 mb-10"
      >
        <h2 className="font-semibold mb-1">Add Class</h2>
        {message && <p className="text-sm text-nexus-accent">{message}</p>}

        <input
          placeholder="Class name (e.g. 1º Ano C)"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
        >
          <option>Ensino Fundamental I</option>
          <option>Ensino Fundamental II</option>
          <option>Ensino Médio</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Class"}
        </button>
      </form>

      <h2 className="font-semibold mb-4">All Classes</h2>
      <ul className="flex flex-col gap-2 max-w-md">
        {classes.map((c) => (
          <li key={c.id} className="border border-nexus-border rounded-lg px-4 py-3 bg-nexus-surface text-sm flex justify-between">
            <span className="font-medium">{c.name}</span>
            <span className="text-nexus-textMuted">{c.level}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
