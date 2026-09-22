"use client";

import { useState } from "react";
export const dynamic = "force-dynamic";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    // Ask the server which dashboard this session belongs to —
    // the client never decides the role.
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    const role = data?.role as string | undefined;

    if (role === "STUDENT") router.push("/student/dashboard");
    else if (role === "TEACHER") router.push("/teacher/dashboard");
    else if (role === "SCHOOL_ADMIN") router.push("/school/dashboard");
    else if (role === "SUPER_ADMIN") router.push("/admin");
    else router.push("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-nexus-bg">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-xl font-bold mb-8">
          NEXUS
        </Link>
        <form
          onSubmit={handleSubmit}
          className="bg-nexus-surface border border-nexus-border rounded-2xl p-8 flex flex-col gap-4"
        >
          <h1 className="text-lg font-semibold mb-2">Log in</h1>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nexus-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-nexus-bg border border-nexus-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nexus-primary"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-2 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium text-sm disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>

          <p className="text-xs text-nexus-textMuted text-center mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/#choose" className="text-nexus-primaryLight">
              Choose your Nexus
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
