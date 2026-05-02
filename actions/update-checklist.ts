"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export async function addChecklistItem(
  cardId: string,
  text: string,
  slug: string
) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  if (!text || text.trim() === "") {
    return { error: "Item text is required" };
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

    // Get current checklist items
    const currentItems = (Array.isArray(card.checklistItems) ? card.checklistItems : []) as unknown as ChecklistItem[];

    // Add new item
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
    };

    const updated = await db.card.update({
      where: { id: cardId },
      data: { checklistItems: [...currentItems, newItem] as unknown as any },
    });

    // Create audit log for checklist item addition
    await createAuditLog({
      entityId: cardId,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      boardId: card.list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: updated.checklistItems };
  } catch (error) {
    console.error("[ADD_CHECKLIST_ITEM_ERROR]", error);
    return { error: "Failed to add item" };
  }
}

export async function toggleChecklistItem(
  cardId: string,
  itemId: string,
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

    // Toggle item
    const currentItems = (Array.isArray(card.checklistItems) ? card.checklistItems : []) as unknown as ChecklistItem[];
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updated = await db.card.update({
      where: { id: cardId },
      data: { checklistItems: updatedItems as unknown as any },
    });

    // Create audit log for checklist item toggle
    await createAuditLog({
      entityId: cardId,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      boardId: card.list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: updated.checklistItems };
  } catch (error) {
    console.error("[TOGGLE_CHECKLIST_ITEM_ERROR]", error);
    return { error: "Failed to toggle item" };
  }
}

export async function deleteChecklistItem(
  cardId: string,
  itemId: string,
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

    // Delete item
    const currentItems = (Array.isArray(card.checklistItems) ? card.checklistItems : []) as unknown as ChecklistItem[];
    const updatedItems = currentItems.filter((item) => item.id !== itemId);

    const updated = await db.card.update({
      where: { id: cardId },
      data: { checklistItems: updatedItems as unknown as any },
    });

    // Create audit log for checklist item deletion
    await createAuditLog({
      entityId: cardId,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      boardId: card.list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: updated.checklistItems };
  } catch (error) {
    console.error("[DELETE_CHECKLIST_ITEM_ERROR]", error);
    return { error: "Failed to delete item" };
  }
}
