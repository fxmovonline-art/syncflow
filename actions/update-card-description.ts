"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function updateCardDescription(
  cardId: string,
  description: string,
  slug: string
) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get card and verify access
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: { list: { select: { boardId: true } } },
    });

    if (!card) {
      return { error: "Card not found" };
    }

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

    // Update description
    const updated = await db.card.update({
      where: { id: cardId },
      data: { description: description.trim() || null },
    });

    // Create audit log for description update
    if (description !== card.description) {
      await createAuditLog({
        entityId: cardId,
        entityTitle: updated.title,
        entityType: ENTITY_TYPE.CARD,
        action: ACTION.UPDATE,
        boardId: card.list.boardId,
      });
    }

    revalidatePath(`/board/${slug}`);
    return { data: updated };
  } catch (error) {
    console.error("[UPDATE_DESCRIPTION_ERROR]", error);
    return { error: "Failed to update description" };
  }
}
