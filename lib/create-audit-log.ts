import { auth, currentUser } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import db from "@/lib/db";

interface Props {
  entityId: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  action: ACTION;
  boardId: string;
};

/**
 * Create an audit log entry
 * 
 * For production (Vercel):
 * - Non-blocking: Fires and forgets (doesn't await)
 * - Prevents serverless timeouts
 * - Graceful error handling
 * - If you need to wait for audit logs, use createAuditLogAsync instead
 * 
 * @param props - Audit log data
 */
export const createAuditLog = (props: Props) => {
  // Fire and forget: non-blocking for serverless environments
  // This prevents timeouts in Vercel's serverless functions
  createAuditLogAsync(props).catch((error) => {
    console.error("[AUDIT_LOG_ERROR]", error);
  });
};

/**
 * Async version of createAuditLog
 * Use this when you need to wait for the audit log to be created
 * 
 * @param props - Audit log data
 * @throws Error if audit log creation fails
 */
export const createAuditLogAsync = async (props: Props) => {
  try {
    const { orgId } = await auth();
    const user = await currentUser();

    if (!user) {
      console.warn("[AUDIT_LOG_WARN] User not found");
      return;
    }

    const { entityId, entityType, entityTitle, action, boardId } = props;

    // Build user name with proper fallback logic
    let userName = "";
    
    // Try firstName + lastName first
    if (user.firstName || user.lastName) {
      userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    // Fall back to username
    else if (user.username) {
      userName = user.username;
    }
    // Fall back to email prefix
    else if (user.emailAddresses?.[0]?.emailAddress) {
      userName = user.emailAddresses[0].emailAddress.split("@")[0];
    }
    // Last resort fallback
    else {
      userName = "Unknown User";
    }

    // Get user image, default to empty string if not available
    const userImage = user.imageUrl || "";

    await db.auditLog.create({
      data: {
        orgId,
        entityId,
        entityType,
        entityTitle,
        action,
        boardId,
        userId: user.id,
        userImage,
        userName,
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
    // Re-throw for caller if they use createAuditLogAsync
    throw error;
  }
};
