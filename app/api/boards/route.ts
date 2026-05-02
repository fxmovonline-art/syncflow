import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/boards
 * Returns boards for the current user's active organization or personal boards
 * Used for real-time polling on the dashboard
 */
export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let boards = [];

    if (orgId) {
      // Fetch organization boards
      boards = await db.board.findMany({
        where: {
          orgId: orgId,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      });
    } else {
      // Fetch personal boards
      boards = await db.board.findMany({
        where: {
          userId: userId,
          orgId: null,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
