import { useEffect, useMemo } from "react";
import { useOrganization, useSession, useUser } from "@clerk/nextjs";

interface ActiveUser {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email?: string;
}

export const useBoardPresence = (boardId: string) => {
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded, memberships } = useOrganization({
    memberships: true,
  });

  const activeUsers = useMemo(() => {
    if (!sessionLoaded || !userLoaded || !orgLoaded) {
      return [];
    }

    const usersToDisplay: ActiveUser[] = [];

    if (user && session) {
      usersToDisplay.push({
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "",
        email: user.emailAddresses?.[0]?.emailAddress || "",
      });
    }

    if (organization && memberships?.data) {
      memberships.data.forEach((membership) => {
        const userData = membership.publicUserData;

        if (userData?.userId && userData.userId !== user?.id) {
          usersToDisplay.push({
            id: userData.userId,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            imageUrl: userData.imageUrl || "",
            email: userData.identifier || "",
          });
        }
      });
    }

    return usersToDisplay;
  }, [sessionLoaded, userLoaded, orgLoaded, session, user, organization, memberships]);

  useEffect(() => {
    if (!sessionLoaded || !userLoaded || !orgLoaded || !user || !session) {
      return;
    }

    const presenceKey = `board-presence-${boardId}`;
    const writePresence = () => {
      sessionStorage.setItem(
        presenceKey,
        JSON.stringify({
          userId: user.id,
          timestamp: Date.now(),
          boardId,
        })
      );
    };

    writePresence();
    const interval = setInterval(writePresence, 5000);

    return () => {
      clearInterval(interval);
      sessionStorage.removeItem(presenceKey);
    };
  }, [sessionLoaded, userLoaded, orgLoaded, session, user, boardId]);

  return {
    activeUsers,
    isLoading: !sessionLoaded || !userLoaded || !orgLoaded,
  };
};
