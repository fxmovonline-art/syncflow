"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

import db from "@/lib/db";

interface ShareBoardInput {
  boardId: string;
  email: string;
  redirectUrl: string;
}

export async function shareBoard({
  boardId,
  email,
  redirectUrl,
}: ShareBoardInput) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { error: "Email is required" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { error: "Enter a valid email address" };
    }

    const board = await db.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        title: true,
        userId: true,
        orgId: true,
      },
    });

    if (!board) {
      return { error: "Board not found" };
    }

    if (!board.orgId) {
      return {
        error:
          "Personal boards are private. Create this board inside an organization to invite other users.",
      };
    }

    const hasAccess = board.userId === userId || board.orgId === orgId;

    if (!hasAccess) {
      return { error: "You do not have permission to share this board" };
    }

    const clerk = await clerkClient();

    await clerk.organizations.createOrganizationInvitation({
      organizationId: board.orgId,
      inviterUserId: userId,
      emailAddress: trimmedEmail,
      role: "org:member",
      redirectUrl,
    });

    return {
      data: {
        email: trimmedEmail,
        boardTitle: board.title,
      },
    };
  } catch (error) {
    console.error("Failed to share board:", error);
    return { error: "Failed to send invitation" };
  }
}
