"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type Challenge = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  subject: { name: string };
};

export default function StudentChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/me/available-challenges");
    if (res.ok) {
      const data = await res.json();
      setChallenges(data.challenges);
      setCompletedIds(data.completedIds);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function complete(id: string) {
    setMessage(null);
    const res = await fetch(`/api/challenges/${id}/complete`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? "Something went wrong.");
      return;
    }

    setMessage(`+${data.xpAwarded} XP earned!`);
    load();
  }

  return (
    <main className="min-h-screen bg-nexus-bg px-6 md:px-12 py-10">
      <h1 className="text-2xl font-bold mb-1">Challenges</h1>
      <p className="text-nexus-textMuted mb-8">Complete challenges from your subjects to earn XP.</p>

      {message && (
        <p className="text-sm text-nexus-accent bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2 mb-6 inline-block">
          {message}
        </p>
      )}

      {challenges.length === 0 ? (
        <p className="text-sm text-nexus-textMuted">
          No challenges available yet — your teachers haven&apos;t created any for your subjects.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.map((c) => {
            const done = completedIds.includes(c.id);
            return (
              <div key={c.id} className="p-5 rounded-xl border border-nexus-border bg-nexus-surface flex flex-col">
                <p className="text-xs text-nexus-textMuted mb-1">{c.subject.name}</p>
                <p className="font-medium mb-2">{c.title}</p>
                <p className="text-sm text-nexus-textMuted mb-4 flex-1">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-nexus-accent font-semibold text-sm">+{c.xpReward} XP</span>
                  <button
                    onClick={() => complete(c.id)}
                    disabled={done}
                    className="px-4 py-2 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {done ? "Completed ✓" : "Complete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
