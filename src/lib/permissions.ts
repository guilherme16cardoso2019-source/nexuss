import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  status = 401;
}
export class ForbiddenError extends Error {
  status = 403;
}

/**
 * Loads the current authenticated user FRESH from the database.
 * This is the single source of truth for role — never trust a role
 * value coming from the client (headers, body, cookies).
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true, teacherProfile: true, schoolAdminProfile: true },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("Not authenticated");
  return user;
}

export async function requireRole(allowed: Role[]) {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    throw new ForbiddenError(`Requires one of: ${allowed.join(", ")}`);
  }
  return user;
}

/**
 * Ensures a SCHOOL_ADMIN can only act on data belonging to their own school.
 * SUPER_ADMIN bypasses the school restriction.
 */
export async function requireSchoolAccess(schoolId: string) {
  const user = await requireRole(["SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (user.role === "SCHOOL_ADMIN" && user.schoolId !== schoolId) {
    throw new ForbiddenError("Cannot access another school's data");
  }
  return user;
}

/**
 * For use directly inside Server Component pages (e.g. app/admin/page.tsx).
 * Unauthenticated → redirect to /login. Wrong role → redirect to /
 * ("You do not have permission to access this page." shown there via ?denied=1).
 * This is real server-side denial — it runs before any HTML is streamed,
 * not a client-side hide of the nav link.
 */
export async function requireRoleOrRedirect(allowed: Role[]) {
  try {
    return await requireRole(allowed);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/login");
    } else {
      redirect("/?denied=1");
    }
    // Unreachable: redirect() always throws internally. This line exists only
    // so TypeScript's control-flow analysis sees every path in this catch
    // block ending in a throw, and doesn't infer an implicit `undefined`
    // return for the function as a whole.
    throw err;
  }
}
