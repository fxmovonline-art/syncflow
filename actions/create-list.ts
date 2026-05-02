"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function createList(formData: FormData) {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const boardId = formData.get("boardId") as string;
  const slug = formData.get("slug") as string;

  if (!title || title.trim() === "") {
    return { error: "Title is required" };
  }

  try {
    // Verify user has access to this board
    const board = await db.board.findUnique({
      where: { id: boardId },
      select: { userId: true, orgId: true },
    });

    if (!board) {
      return { error: "Board not found" };
    }

    const hasAccess = board.userId === userId || (board.orgId && board.orgId === orgId);
    if (!hasAccess) {
      return { error: "Unauthorized" };
    }

    const lastList = await db.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    const list = await db.list.create({
      data: {
        title: title.trim(),
        boardId,
        order: newOrder,
      },
    });

    await createAuditLog({
      entityId: list.id,
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.CREATE,
      boardId: list.boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: JSON.parse(JSON.stringify(list)) };
  } catch (error) {
    console.error("CREATE_LIST_ERROR", error);
    return { error: "Internal Server Error" };
  }
}
