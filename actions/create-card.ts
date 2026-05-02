"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function createCard(formData: FormData) {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const listId = formData.get("listId") as string;
  const slug = formData.get("slug") as string;

  if (!title || title.trim() === "") {
    return { error: "Title is required" };
  }

  try {
    // Verify user has access to this list's board
    const list = await db.list.findUnique({
      where: { id: listId },
      select: { 
        boardId: true,
        board: { select: { userId: true, orgId: true } }
      },
    });

    if (!list) {
      return { error: "List not found" };
    }

    const hasAccess = list.board.userId === userId || (list.board.orgId && list.board.orgId === orgId);
    if (!hasAccess) {
      return { error: "Unauthorized" };
    }

    const lastCard = await db.card.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const card = await db.card.create({
      data: {
        title: title.trim(),
        listId,
        order: newOrder,
      },
    });

    await createAuditLog({
      entityId: card.id,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.CREATE,
      boardId: list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: JSON.parse(JSON.stringify(card)) };
  } catch (error) {
    console.error("CREATE_CARD_ERROR", error);
    return { error: "Internal Server Error" };
  }
}
