"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function updateCard(
  cardId: string,
  data: { title?: string; description?: string },
  slug: string
) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get card details to verify access
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

    // Update the card
    const updatedCard = await db.card.update({
      where: { id: cardId },
      data: {
        title: data.title || card.title,
        description: data.description !== undefined ? data.description : card.description,
      },
    });

    // Create audit log for update (if anything changed)
    if (data.title !== card.title || data.description !== card.description) {
      await createAuditLog({
        entityId: cardId,
        entityTitle: updatedCard.title,
        entityType: ENTITY_TYPE.CARD,
        action: ACTION.UPDATE,
        boardId: card.list.boardId,
      });
    }

    revalidatePath(`/board/${slug}`);
    return { data: updatedCard };
  } catch (error) {
    console.error("[UPDATE_CARD_ERROR]", error);
    return { error: "Failed to update card" };
  }
}
