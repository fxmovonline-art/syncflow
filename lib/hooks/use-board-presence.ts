import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";

interface ActiveUser {
  id: string;
  name?: string;
  imageUrl?: string;
  email?: string;
  isCurrentUser?: boolean;
}

interface PresenceResponse {
  users?: ActiveUser[];
}

const HEARTBEAT_INTERVAL_MS = 5_000;
const POLL_INTERVAL_MS = 5_000;

const createTabId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getCurrentUserPresence = (user: NonNullable<ReturnType<typeof useUser>["user"]>): ActiveUser => {
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

const areUsersEqual = (currentUsers: ActiveUser[], nextUsers: ActiveUser[]) =>
  JSON.stringify(currentUsers) === JSON.stringify(nextUsers);

export const useBoardPresence = (boardId: string) => {
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user, isLoaded: userLoaded } = useUser();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabIdRef = useRef<string>(createTabId());
  const endpoint = `/api/board-presence/${boardId}`;

  const sortCurrentUserFirst = useCallback(
    (users: ActiveUser[]) =>
      [...users].sort((a, b) => {
        if (a.id === user?.id) return -1;
        if (b.id === user?.id) return 1;
        return 0;
      }),
    [user?.id]
  );

  const fetchPresence = useCallback(async () => {
    if (!boardId || !user) {
      setActiveUsers([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${endpoint}?t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as PresenceResponse;
      const users = sortCurrentUserFirst(data.users ?? []);

      setActiveUsers((currentUsers) =>
        areUsersEqual(currentUsers, users) ? currentUsers : users
      );
    } finally {
      setIsLoading(false);
    }
  }, [boardId, endpoint, sortCurrentUserFirst, user]);

  const sendHeartbeat = useCallback(async () => {
    if (!boardId || !user || !session) {
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tabId: tabIdRef.current }),
      });

      if (response.ok) {
        await fetchPresence();
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [boardId, endpoint, fetchPresence, session, user]);

  useEffect(() => {
    if (!sessionLoaded || !userLoaded) {
      return;
    }

    if (!user || !session) {
      return;
    }

    void sendHeartbeat();
    const heartbeatInterval = window.setInterval(
      sendHeartbeat,
      HEARTBEAT_INTERVAL_MS
    );
    const pollInterval = window.setInterval(fetchPresence, POLL_INTERVAL_MS);

    const clearPresence = () => {
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
      window.clearInterval(heartbeatInterval);
      window.clearInterval(pollInterval);
      window.removeEventListener("pagehide", clearPresence);
      window.removeEventListener("beforeunload", clearPresence);
      clearPresence();
    };
  }, [
    endpoint,
    fetchPresence,
    sendHeartbeat,
    session,
    sessionLoaded,
    user,
    userLoaded,
  ]);

  const displayUsers = useMemo(() => {
    if (!user || !session) {
      return [];
    }

    return sortCurrentUserFirst([
      getCurrentUserPresence(user),
      ...activeUsers.filter((activeUser) => activeUser.id !== user.id),
    ]);
  }, [activeUsers, session, sortCurrentUserFirst, user]);

  return {
    activeUsers: displayUsers,
    isLoading:
      !sessionLoaded || !userLoaded ? true : Boolean(user && session && isLoading),
  };
};
