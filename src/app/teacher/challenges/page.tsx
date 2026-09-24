"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Subject = { id: string; name: string };
type Topic = { id: string; name: string };
type Class = { id: string; name: string };

export default function TeacherChallengesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [classId, setClassId] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadChallenges() {
    const res = await fetch("/api/me/challenges");
    if (res.ok) setMyChallenges(await res.json());
  }

  useEffect(() => {
    fetch("/api/me/subjects").then((r) => r.json()).then(setSubjects);
    fetch("/api/me/classes").then((r) => r.json()).then(setClasses);
    loadChallenges();
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setTopicId("");
      return;
    }
    fetch(`/api/topics?subjectId=${subjectId}`).then((r) => r.json()).then(setTopics);
  }, [subjectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, subjectId, topicId, classId, xpReward: Number(xpReward) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong.");
      return;
    }

    setMessage("Challenge created!");
    setTitle("");
    setDescription("");
    loadChallenges();
  }

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-8">Challenges</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg bg-nexus-surface border border-nexus-border rounded-2xl p-6 flex flex-col gap-3 mb-10"
      >
        <h2 className="font-semibold mb-1">Create Challenge</h2>
        {message && <p className="text-sm text-nexus-accent">{message}</p>}

        <input
          placeholder="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Description / Question"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm min-h-[80px]"
        />
        <select
          required
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          disabled={!subjectId}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="">Select Topic (optional)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select Class (optional — visible to all your classes if left blank)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="text-xs text-nexus-textMuted">
          XP Reward
          <input
            type="number"
            min={1}
            max={1000}
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="mt-1 w-full bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium text-sm disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Challenge"}
        </button>
      </form>

      <h2 className="font-semibold mb-4">My Challenges</h2>
      <ul className="flex flex-col gap-2 max-w-lg">
        {myChallenges.map((c) => (
          <li key={c.id} className="border border-nexus-border rounded-lg px-4 py-3 bg-nexus-surface text-sm flex justify-between">
            <span>
              <span className="font-medium">{c.title}</span>
              <span className="text-nexus-textMuted"> — {c.subject.name}</span>
            </span>
            <span className="text-nexus-accent font-semibold">+{c.xpReward} XP</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
