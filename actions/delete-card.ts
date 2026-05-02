"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function deleteCard(cardId: string, slug: string) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get card details before deletion
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: { list: { select: { boardId: true } } },
    });

    if (!card) {
      return { error: "Card not found" };
    }

    // Verify user has access to the board
    const board = await db.board.findUnique({
      where: { id: card.list.boardId },
      select: { userId: true, orgId: true },
    });

    if (!board) {
      return { error: "Board not found" };
    }

    const hasAccess = board.userId === userId || (board.orgId && board.orgId === orgId);
    if (!hasAccess) {
      return { error: "Unauthorized" };
    }

    // Delete the card
    await db.card.delete({
      where: { id: cardId },
    });

    // Create audit log for deletion
    await createAuditLog({
      entityId: cardId,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.DELETE,
      boardId: card.list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: "Card deleted successfully" };
  } catch (error) {
    console.error("[DELETE_CARD_ERROR]", error);
    return { error: "Failed to delete card" };
  }
}
