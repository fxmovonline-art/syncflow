"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";

export async function updateListOrder(
  items: { id: string; order: number }[],
  boardId: string,
  slug: string
) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Verify user has access to this board
    const board = await db.board.findUnique({
      where: { id: boardId },
      select: { userId: true, orgId: true, title: true },
    });

    if (!board) {
      return { error: "Board not found" };
    }

    // Check access: personal ownership OR organization membership
    let hasAccess = board.userId === userId;
    
    if (!hasAccess && board.orgId) {
      // Check if user has orgId set in their current context
      if (board.orgId === orgId) {
        hasAccess = true;
      } else {
        // Also check if user is a member of this organization (even if not currently active context)
        try {
          const clerk = await clerkClient();
          const memberships = await clerk.organizations.getOrganizationMembershipList({
            organizationId: board.orgId,
          });
          hasAccess = memberships.data.some((m) => m.publicUserData?.userId === userId);
        } catch (error) {
          // User is not a member of this organization
          hasAccess = false;
        }
      }
    }

    if (!hasAccess) {
      return { error: "Unauthorized" };
    }

    const transaction = items.map((list) =>
      db.list.update({
        where: {
          id: list.id,
          boardId: boardId,
        },
        data: {
          order: list.order,
        },
      })
    );

    await db.$transaction(transaction);

    await createAuditLog({
      entityId: boardId,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.UPDATE,
      boardId: boardId,
    });

    revalidatePath(`/board/${slug}`);
    return { data: "Success" };
  } catch (error) {
    console.error("[UPDATE_LIST_ORDER_ERROR]", error);
    return { error: "Failed to reorder lists." };
  }
}
