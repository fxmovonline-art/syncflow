import { useEffect, useState } from "react";
import { useSession, useUser, useOrganization, useAuth } from "@clerk/nextjs";

interface ActiveUser {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email?: string;
}

export const useBoardPresence = (boardId: string) => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { session, isLoaded: sessionLoaded } = useSession();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded, memberships } = useOrganization({
    memberships: true,
  });
  const { userId, orgId } = useAuth();

  useEffect(() => {
    if (!sessionLoaded || !userLoaded || !orgLoaded) {
      return;
    }

    setIsLoading(true);

    // Update presence tracking
    const updatePresence = () => {
      const usersToDisplay: ActiveUser[] = [];

      // Check if current user has an active session
      if (user && session) {
        usersToDisplay.push({
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "",
          email: user.emailAddresses?.[0]?.emailAddress || "",
        });
      }

      // If in an organization, add other members who have active sessions
      if (organization && memberships && memberships.data) {
        memberships.data.forEach((membership) => {
          const userData = membership.publicUserData;
          // Only add if they're not the current user and have valid userId
          if (userData && userData.userId && userData.userId !== user?.id) {
            // Check if this user appears to have an active session
            // by verifying they're part of the org
            if (userData.imageUrl || userData.firstName || userData.identifier) {
              usersToDisplay.push({
                id: userData.userId,
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                imageUrl: userData.imageUrl || "",
                email: userData.identifier || "",
              });
            }
          }
        });
      }

      setActiveUsers(usersToDisplay);
      setIsLoading(false);

      // Store presence in localStorage for cross-tab communication
      const presenceKey = `board-presence-${boardId}`;
      if (user && session) {
        const presenceData = {
          userId: user.id,
          timestamp: Date.now(),
          boardId: boardId,
        };
        sessionStorage.setItem(presenceKey, JSON.stringify(presenceData));
      }
    };

    // Initial update
    updatePresence();

    // Periodic refresh every 5 seconds to check for stale sessions
    const interval = setInterval(updatePresence, 5000);

    // Cleanup on unmount - remove user from presence
    return () => {
      clearInterval(interval);
      const presenceKey = `board-presence-${boardId}`;
      sessionStorage.removeItem(presenceKey);
    };
  }, [sessionLoaded, userLoaded, orgLoaded, session, user, organization, memberships, boardId]);

  return { activeUsers, isLoading };
};
