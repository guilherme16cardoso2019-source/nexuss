import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY — visit /api/debug in the browser to see what's broken.
// Delete this file (and the src/app/api/debug folder) once login works.

export async function GET() {
  const result: Record<string, any> = {
    envVarsPresent: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(empty)",
      URL: process.env.URL || "(empty)",
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    },
  };

  try {
    const userCount = await prisma.user.count();
    result.databaseConnection = "OK";
    result.userCount = userCount;
  } catch (err: any) {
    result.databaseConnection = "FAILED";
    result.databaseError = err?.message ?? String(err);
  }

  try {
    const { authOptions } = await import("@/lib/auth");
    result.authOptionsLoaded = "OK";
    result.providerCount = authOptions.providers.length;
  } catch (err: any) {
    result.authOptionsLoaded = "FAILED";
    result.authOptionsError = err?.message ?? String(err);
    result.authOptionsStack = err?.stack ?? null;
  }

  return NextResponse.json(result, { status: 200 });
}
