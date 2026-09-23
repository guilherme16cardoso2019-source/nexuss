import Link from "next/link";

const LINKS = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/activities", label: "Activities" },
  { href: "/teacher/challenges", label: "Challenges" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="flex gap-1 px-6 md:px-12 pt-6 overflow-x-auto border-b border-nexus-border">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 text-sm text-nexus-textMuted hover:text-nexus-text border-b-2 border-transparent hover:border-nexus-primary transition whitespace-nowrap"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
