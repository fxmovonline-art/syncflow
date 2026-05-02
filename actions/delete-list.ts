"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function deleteList(listId: string, slug: string) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get list details before deletion
    const list = await db.list.findUnique({
      where: { id: listId },
      include: { board: { select: { userId: true, orgId: true, id: true } } },
    });

    if (!list) {
      return { error: "List not found" };
    }

    // Verify user has access to the board
    const hasAccess = list.board.userId === userId || (list.board.orgId && list.board.orgId === orgId);
    if (!hasAccess) {
      return { error: "Unauthorized" };
    }

    // Delete the list (cards will cascade delete due to Prisma relations)
    await db.list.delete({
      where: { id: listId },
    });

    // Create audit log for deletion
    await createAuditLog({
      entityId: listId,
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.DELETE,
      boardId: list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: "List deleted successfully" };
  } catch (error) {
    console.error("[DELETE_LIST_ERROR]", error);
    return { error: "Failed to delete list" };
  }
}
