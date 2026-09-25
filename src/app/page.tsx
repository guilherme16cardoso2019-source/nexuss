import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-nexus-border sticky top-0 bg-nexus-bg/90 backdrop-blur z-50">
        <img src="/logo-icon.png" alt="Nexus" className="h-8 w-auto" />
        <div className="hidden md:flex gap-8 text-sm text-nexus-textMuted">
          <Link href="/" className="hover:text-nexus-text transition">Home</Link>
          <Link href="/about" className="hover:text-nexus-text transition">About</Link>
          <Link href="/how-it-works" className="hover:text-nexus-text transition">How It Works</Link>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm rounded-lg border border-nexus-border hover:border-nexus-primary transition">
            Login
          </Link>
          <Link href="#choose" className="px-4 py-2 text-sm rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-24 text-center max-w-4xl mx-auto">
        <img src="/logo-full.png" alt="Nexus — Learn. Connect. Compete. Evolve." className="mx-auto w-full max-w-md mb-6" />
        <p className="text-nexus-textMuted text-lg mb-10 max-w-2xl mx-auto">
          Nexus is an interactive educational platform designed to connect students, teachers
          and schools through learning, challenges and collaboration.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Link href="#choose" className="px-6 py-3 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium">
            Get Started
          </Link>
          <Link href="/about" className="px-6 py-3 rounded-lg border border-nexus-border hover:border-nexus-primary transition">
            Explore Nexus
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-nexus-textMuted">
          <span className="px-4 py-2 rounded-full border border-nexus-border">STUDENTS</span>
          <span>↕</span>
          <span className="px-4 py-2 rounded-full bg-nexus-primary flex items-center justify-center">
            <img src="/logo-icon.png" alt="Nexus" className="h-5 w-auto" />
          </span>
          <span>↕</span>
          <span className="px-4 py-2 rounded-full border border-nexus-border">TEACHERS</span>
          <span>↕</span>
          <span className="px-4 py-2 rounded-full border border-nexus-border">SCHOOLS</span>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 md:px-12 py-20 border-t border-nexus-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-semibold mb-3 text-nexus-accent">Students</h3>
            <p className="text-sm text-nexus-textMuted">
              Study subjects, complete activities, join challenges, compete with others, earn XP
              and track their progress.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-nexus-accent">Teachers</h3>
            <p className="text-sm text-nexus-textMuted">
              Manage learning experiences, create activities and challenges, and monitor student
              progress across subjects.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-nexus-accent">Schools</h3>
            <p className="text-sm text-nexus-textMuted">
              Manage their educational community — students, teachers and subjects — and monitor
              activity across the school.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-20 border-t border-nexus-border">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Connect", d: "Students, teachers and schools join Nexus." },
            { n: "02", t: "Learn", d: "Students access subjects, activities and challenges." },
            { n: "03", t: "Compete & Evolve", d: "Students battle, progress and grow their knowledge." },
          ].map((step) => (
            <div key={step.n} className="p-6 rounded-xl border border-nexus-border hover:border-nexus-primary transition">
              <span className="text-nexus-primaryLight text-sm font-mono">{step.n}</span>
              <h3 className="font-semibold mt-2 mb-2">{step.t}</h3>
              <p className="text-sm text-nexus-textMuted">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Choose your Nexus */}
      <section id="choose" className="px-6 md:px-12 py-20 border-t border-nexus-border">
        <h2 className="text-2xl font-bold text-center mb-12">Choose Your Nexus</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <RoleCard
            emoji="🎓"
            title="For Student"
            desc="Learn, compete and evolve through interactive educational experiences."
            href="/register/student"
            cta="Continue as Student"
          />
          <RoleCard
            emoji="👨‍🏫"
            title="For Teacher"
            desc="Create learning experiences, monitor students and make education more interactive."
            href="/register/teacher"
            cta="Continue as Teacher"
          />
          <RoleCard
            emoji="🏫"
            title="School Administrator"
            desc="Manage your school community and monitor educational activity."
            href="/register/school_admin"
            cta="Continue as School Administrator"
          />
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-nexus-border text-center text-sm text-nexus-textMuted">
        NEXUS — an interactive educational platform.
      </footer>
    </main>
  );
}

function RoleCard({
  emoji,
  title,
  desc,
  href,
  cta,
}: {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="p-8 rounded-2xl border border-nexus-border hover:border-nexus-primary hover:-translate-y-1 transition-all bg-nexus-surface flex flex-col">
      <span className="text-3xl mb-4">{emoji}</span>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-sm text-nexus-textMuted mb-6 flex-1">{desc}</p>
      <Link
        href={href}
        className="text-center px-4 py-2 rounded-lg bg-nexus-primary hover:bg-nexus-primaryLight transition font-medium text-sm"
      >
        {cta}
      </Link>
    </div>
  );
}
