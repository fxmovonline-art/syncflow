import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrganization, useSession, useUser } from "@clerk/nextjs";

interface ActiveUser {
  id: string;
  name?: string;
  imageUrl?: string;
  email?: string;
  isCurrentUser?: boolean;
}

type MembershipWithActivity = {
  lastActiveAt?: Date | string | number | null;
  publicUserData?: {
    userId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    identifier?: string | null;
  };
};

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;
const REFRESH_INTERVAL_MS = 10_000;

interface PresenceResponse {
  users?: ActiveUser[];
}

const createTabId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getTime = (value?: Date | string | number | null) => {
  if (!value) {
    return 0;
  }

  return new Date(value).getTime();
};

const getCurrentUserPresence = (
  user: NonNullable<ReturnType<typeof useUser>["user"]>
): ActiveUser => {
  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const name =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    email ||
    "Team Member";

  return {
    id: user.id,
    name,
    imageUrl: user.imageUrl || "",
    email,
    isCurrentUser: true,
  };
};

const getMembershipPresence = (
  membership: MembershipWithActivity,
  currentUserId?: string
): ActiveUser | null => {
  const userData = membership.publicUserData;
  const userId = userData?.userId;

  if (!userId) {
    return null;
  }

  const email = userData.identifier || "";
  const name =
    `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
    email ||
    "Team Member";

  return {
    id: userId,
    name,
    imageUrl: userData.imageUrl || "",
    email,
    isCurrentUser: userId === currentUserId,
  };
};

const areUsersEqual = (currentUsers: ActiveUser[], nextUsers: ActiveUser[]) =>
  JSON.stringify(currentUsers) === JSON.stringify(nextUsers);

export const useBoardPresence = (boardId: string) => {
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: organizationLoaded, memberships } = useOrganization({
    memberships: {
      keepPreviousData: true,
      pageSize: 100,
    },
  });
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const tabIdRef = useRef<string>(createTabId());
  const endpoint = `/api/board-presence/${boardId}`;

  const isLoading =
    !sessionLoaded ||
    !userLoaded ||
    !organizationLoaded ||
    Boolean(memberships?.isLoading);

  const buildMembershipUsers = useCallback(() => {
    if (!user || !session) {
      return [];
    }

    const activeSince = Date.now() - ACTIVE_WINDOW_MS;
    const usersById = new Map<string, ActiveUser>();

    memberships?.data?.forEach((membership) => {
      const membershipWithActivity = membership as MembershipWithActivity;
      const lastActiveAt = getTime(membershipWithActivity.lastActiveAt);

      if (lastActiveAt < activeSince) {
        return;
      }

      const activeUser = getMembershipPresence(membershipWithActivity, user.id);

      if (activeUser) {
        usersById.set(activeUser.id, activeUser);
      }
    });

    return Array.from(usersById.values());
  }, [memberships?.data, session, user]);

  const fetchBoardPresence = useCallback(async () => {
    if (!boardId || !user || !session) {
      return [];
    }

    const response = await fetch(`${endpoint}?t=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as PresenceResponse;
    return data.users ?? [];
  }, [boardId, endpoint, session, user]);

  const sendHeartbeat = useCallback(async () => {
    if (!boardId || !user || !session) {
      return;
    }

    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tabId: tabIdRef.current }),
      cache: "no-store",
    });
  }, [boardId, endpoint, session, user]);

  const mergeUsers = useCallback(
    (users: ActiveUser[]) => {
      if (!user || !session) {
        return [];
      }

      const usersById = new Map<string, ActiveUser>();

      usersById.set(user.id, getCurrentUserPresence(user));
      users.forEach((activeUser) => {
        usersById.set(activeUser.id, {
          ...activeUser,
          isCurrentUser: activeUser.id === user.id,
        });
      });

      return Array.from(usersById.values()).sort((a, b) => {
        if (a.id === user.id) return -1;
        if (b.id === user.id) return 1;
        return a.name?.localeCompare(b.name || "") ?? 0;
      });
    },
    [session, user]
  );

  useEffect(() => {
    if (!organizationLoaded || !memberships) {
      return;
    }

    const refreshPresence = async () => {
      await sendHeartbeat();
      await memberships.revalidate?.();

      const [boardUsers] = await Promise.all([fetchBoardPresence()]);
      const nextUsers = mergeUsers([...buildMembershipUsers(), ...boardUsers]);

      setActiveUsers((currentUsers) =>
        areUsersEqual(currentUsers, nextUsers) ? currentUsers : nextUsers
      );
    };

    const timeoutId = window.setTimeout(() => {
      void refreshPresence();
    }, 0);
    const intervalId = window.setInterval(
      () => {
        void refreshPresence();
      },
      REFRESH_INTERVAL_MS
    );

    const clearPresence = () => {
      if (!boardId) {
        return;
      }

      void fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tabId: tabIdRef.current }),
        keepalive: true,
      });
    };

    window.addEventListener("pagehide", clearPresence);
    window.addEventListener("beforeunload", clearPresence);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", clearPresence);
      window.removeEventListener("beforeunload", clearPresence);
      clearPresence();
    };
  }, [
    boardId,
    buildMembershipUsers,
    endpoint,
    fetchBoardPresence,
    memberships,
    mergeUsers,
    organizationLoaded,
    sendHeartbeat,
  ]);

  const displayUsers = useMemo(() => {
    if (!user || !session) {
      return [];
    }

    const hasCurrentUser = activeUsers.some(
      (activeUser) => activeUser.id === user.id
    );

    if (hasCurrentUser) {
      return activeUsers;
    }

    return [getCurrentUserPresence(user), ...activeUsers];
  }, [activeUsers, session, user]);

  return {
    activeUsers: displayUsers,
    isLoading,
  };
};
