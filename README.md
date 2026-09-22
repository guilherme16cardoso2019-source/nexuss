# Nexus

An interactive educational platform connecting students, teachers and schools through
learning, challenges, competition and gamification.

**Learn. Connect. Compete. Evolve.**

---

## What's implemented in this MVP

- ✅ Real PostgreSQL schema (Prisma) covering users, schools, subjects, activities,
  challenges, battles, XP ledger, achievements
- ✅ Real authentication (NextAuth + bcrypt, no simulated frontend login)
- ✅ Role-based authorization enforced **server-side** (middleware + per-route/page guards
  that re-read the role from the database — a request can never elevate its own role)
- ✅ School-scoped data access (a School Admin's queries are structurally limited to their
  own school)
- ✅ Landing page, registration (student/teacher/school_admin), login
- ✅ Student, Teacher, School Admin and SUPER_ADMIN dashboards reading **real** data from
  the database (no hardcoded stats)
- ✅ Idempotent SUPER_ADMIN + dev seed data

## Not yet built (next priorities — see ARCHITECTURE.md §7)

- Battle gameplay UI (challenge → accept → answer → score) — schema and API route
  structure are in place (`Battle`, `BattleQuestion`, `BattleAnswer`), the actual
  matchmaking/answer-submission logic and screens still need to be written
- Full admin CRUD tables for Users/Schools/Subjects (search, filter, sort)
- Achievements/streak-triggering logic (models exist, nothing awards them yet)
- Leaderboard endpoint (computed from `XPTransaction`, not yet exposed as an API route)
- Automated test suite (§47 of the spec)

---

## Where to run this

This needs a real Node.js + PostgreSQL environment — it will **not** run inside a chat
sandbox. Two easy options:

### Option A — local machine
1. Install [Node.js 20+](https://nodejs.org) and [PostgreSQL](https://www.postgresql.org/download/)
   (or use `brew install postgresql` / `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres`)
2. Unzip this project, `cd nexus`
3. `npm install`

### Option B — free hosted Postgres (no local install)
Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) —
create a free Postgres instance and copy its connection string into `DATABASE_URL` below.
Then still run the app itself (`npm run dev`) somewhere with Node — locally, or in
**Claude Code**, which can install packages, run migrations, and start the dev server for you.

### Setup steps

The database tables and seed data are created **automatically every time Netlify
builds the site** — you never need to open a terminal. All you do is set the
environment variables below in Netlify's dashboard:

```
DATABASE_URL       → your Postgres connection string (from Neon/Supabase/Railway)
AUTH_SECRET        → any long random string
NEXTAUTH_URL       → the URL Netlify gives your site (e.g. nexus-yourname.netlify.app)
ADMIN_EMAIL        → your SUPER_ADMIN email
ADMIN_PASSWORD     → your SUPER_ADMIN password
```

Then trigger a deploy. The build itself runs, in order: `prisma generate` →
`prisma db push` (creates/updates all tables to match `schema.prisma`) →
the seed script (creates SUPER_ADMIN + dev data, safe to re-run — it checks
what already exists) → `next build`.

If you *do* have a terminal available (optional, for local development only):

```bash
cp .env.example .env   # fill in the same variables as above
npm install
npm run dev             # http://localhost:3000
```

### Dev login credentials (created by the seed)

| Role | Email | Password |
|---|---|---|
| Student | student@nexus.dev | Student123! |
| Teacher | teacher@nexus.dev | Teacher123! |
| School Admin | schooladmin@nexus.dev | SchoolAdmin123! |
| Super Admin | (your `ADMIN_EMAIL`) | (your `ADMIN_PASSWORD`) |

`npm run db:studio` opens Prisma Studio — a GUI to browse/edit the database directly.

---

## Project structure

See `ARCHITECTURE.md` for the full folder layout, auth flow diagram, and authorization
model explanation.

## Environment variables

See `.env.example`. `ADMIN_EMAIL`/`ADMIN_PASSWORD` are only ever read by `prisma/seed.ts`
— there is no public registration path that can create a SUPER_ADMIN account.

## Security notes

- Passwords are hashed with bcrypt (12 rounds) — never stored or logged in plain text.
- `role` is never trusted from a client request body. Registration hardcodes the role
  per endpoint variant; every subsequent authorization check re-reads the role from the
  `User` row in Postgres (`src/lib/permissions.ts`).
- `middleware.ts` blocks unauthenticated access to `/student`, `/teacher`, `/school`,
  `/admin`; the real authorization boundary is the per-page/per-route `requireRole` /
  `requireSchoolAccess` check, which also runs server-side.
