import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/boards/[slug]
 * Returns the current state of a board (lists and cards)
 * Used for real-time polling on the board page
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Fetch board with all lists and cards
    const board = await db.board.findUnique({
      where: { slug },
      include: {
        lists: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Verify access
    const hasAccess = board.userId === userId || (board.orgId && board.orgId === orgId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Failed to fetch board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}
