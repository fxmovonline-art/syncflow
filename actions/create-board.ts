"use server";

import { auth } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/create-audit-log";

export async function createBoard(formData: FormData) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const imageId = formData.get("imageId") as string | null;
    const imageThumbUrl = formData.get("imageThumbUrl") as string | null;
    const imageFullUrl = formData.get("imageFullUrl") as string | null;
    const imageUserName = formData.get("imageUserName") as string | null;
    const imageLinkHTML = formData.get("imageLinkHTML") as string | null;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return { error: "Title is required" };
    }

    const baseSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
      
    const randomString = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomString}`;

    const board = await db.board.create({
      data: {
        title: title.trim(),
        slug,
        userId: userId,
        orgId: orgId || null, // Set to active organization if in org context
        imageId: imageId || null,
        imageThumbUrl: imageThumbUrl || null,
        imageFullUrl: imageFullUrl || null,
        imageUserName: imageUserName || null,
        imageLinkHTML: imageLinkHTML || null,
      },
    });

    await createAuditLog({
      entityId: board.id,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
      boardId: board.id,
    });

    revalidatePath("/dashboard");
    
    return { data: JSON.parse(JSON.stringify(board)) };
  } catch (error) {
    console.error("Failed to create board:", error);
    return { error: "Failed to create board" };
  }
}
