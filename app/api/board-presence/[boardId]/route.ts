import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { NextResponse } from "next/server";

const ACTIVE_WINDOW_MS = 45_000;

interface PresenceRequestBody {
  tabId?: string;
}

const getParams = async (params: Promise<{ boardId: string }>) => params;

async function canAccessBoard(boardId: string, userId: string, orgId?: string | null) {
  const board = await db.board.findUnique({
    where: { id: boardId },
    select: {
      userId: true,
      orgId: true,
    },
  });

  if (!board) {
    return false;
  }

  return board.userId === userId || Boolean(board.orgId && board.orgId === orgId);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boardId } = await getParams(params);
    const hasAccess = await canAccessBoard(boardId, userId, orgId);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS);

    const presences = await db.boardPresence.findMany({
      where: {
        boardId,
        lastSeen: {
          gte: activeSince,
        },
      },
      orderBy: [{ userId: "asc" }, { lastSeen: "desc" }],
    });

    const usersById = new Map<string, (typeof presences)[number]>();

    presences.forEach((presence) => {
      if (!usersById.has(presence.userId)) {
        usersById.set(presence.userId, presence);
      }
    });

    const users = Array.from(usersById.values())
      .sort((a, b) => {
        if (a.userId === userId) return -1;
        if (b.userId === userId) return 1;
        return b.lastSeen.getTime() - a.lastSeen.getTime();
      })
      .map((presence) => ({
        id: presence.userId,
        name: presence.name,
        email: presence.email,
        imageUrl: presence.imageUrl,
        isCurrentUser: presence.userId === userId,
      }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch board presence:", error);
    return NextResponse.json(
      { error: "Failed to fetch board presence" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { userId, orgId, sessionId } = await auth();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boardId } = await getParams(params);
    const hasAccess = await canAccessBoard(boardId, userId, orgId);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as PresenceRequestBody;
    const tabId = body.tabId;

    if (!tabId) {
      return NextResponse.json({ error: "Missing tabId" }, { status: 400 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
    const name =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      user?.username ||
      email ||
      "Team Member";

    await db.boardPresence.upsert({
      where: {
        boardId_userId_sessionId_tabId: {
          boardId,
          userId,
          sessionId,
          tabId,
        },
      },
      update: {
        name,
        email,
        imageUrl: user?.imageUrl || "",
      },
      create: {
        boardId,
        userId,
        sessionId,
        tabId,
        name,
        email,
        imageUrl: user?.imageUrl || "",
      },
    });

    await db.boardPresence.deleteMany({
      where: {
        boardId,
        lastSeen: {
          lt: new Date(Date.now() - ACTIVE_WINDOW_MS * 4),
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update board presence:", error);
    return NextResponse.json(
      { error: "Failed to update board presence" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { userId, sessionId } = await auth();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boardId } = await getParams(params);
    const body = (await request.json().catch(() => ({}))) as PresenceRequestBody;

    if (!body.tabId) {
      return NextResponse.json({ error: "Missing tabId" }, { status: 400 });
    }

    await db.boardPresence.deleteMany({
      where: {
        boardId,
        userId,
        sessionId,
        tabId: body.tabId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to clear board presence:", error);
    return NextResponse.json(
      { error: "Failed to clear board presence" },
      { status: 500 }
    );
  }
}
