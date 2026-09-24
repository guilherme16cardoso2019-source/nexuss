import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/permissions";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole(["STUDENT"]);

    const challenge = await prisma.challenge.findUnique({ where: { id: params.id } });
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    // Prevent double-claiming XP for the same challenge — we use sourceId
    // on the XP ledger as the uniqueness signal.
    const already = await prisma.xPTransaction.findFirst({
      where: { userId: user.id, sourceType: "CHALLENGE_COMPLETED", sourceId: challenge.id },
    });
    if (already) {
      return NextResponse.json({ error: "You already completed this challenge." }, { status: 409 });
    }

    await prisma.xPTransaction.create({
      data: {
        userId: user.id,
        amount: challenge.xpReward,
        sourceType: "CHALLENGE_COMPLETED",
        sourceId: challenge.id,
        note: challenge.title,
      },
    });

    return NextResponse.json({ message: "Challenge completed!", xpAwarded: challenge.xpReward });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json(
        { error: "You do not have permission to access this page." },
        { status: 403 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
