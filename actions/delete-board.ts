"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function deleteBoard(boardId: string) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get board details before deletion
    const board = await db.board.findUnique({
      where: { id: boardId },
      select: { userId: true, orgId: true, title: true, id: true },
    });

    if (!board) {
      return { error: "Board not found" };
    }

    // Verify user has access to the board
    const hasAccess = board.userId === userId || (board.orgId && board.orgId === orgId);
    if (!hasAccess) {
      return { error: "Unauthorized" };
    }

    // Create audit log BEFORE deleting (so we can still access board data)
    await createAuditLog({
      entityId: boardId,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.DELETE,
      boardId: boardId,
    });

    // Delete the board (lists and cards will cascade delete due to Prisma relations)
    await db.board.delete({
      where: { id: boardId },
    });

    redirect("/dashboard");
  } catch (error) {
    console.error("[DELETE_BOARD_ERROR]", error);
    return { error: "Failed to delete board" };
  }
}
