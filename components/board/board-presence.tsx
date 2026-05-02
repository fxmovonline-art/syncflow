"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoardPresence } from "@/lib/hooks/use-board-presence";

interface UserPresence {
  id: string;
  name: string;
  imageUrl?: string;
  email?: string;
}

interface BoardPresenceProps {
  // Board ID to track active viewers
  boardId: string;
  // Optional: server-side fallback users (for SSR compatibility)
  fallbackUsers?: UserPresence[];
}

const FALLBACK_COLORS = [
  "bg-blue-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-orange-600",
  "bg-rose-600",
  "bg-amber-600",
];

const getFallbackColor = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

const getInitials = (name: string, email?: string) => {
  if (name) {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "?";
};

const DISPLAY_LIMIT = 4;

export const BoardPresence = ({ boardId, fallbackUsers = [] }: BoardPresenceProps) => {
  const { activeUsers, isLoading } = useBoardPresence(boardId);
  const [displayUsers, setDisplayUsers] = useState<UserPresence[]>([]);

  // Convert active users to display format
  useEffect(() => {
    const users: UserPresence[] = activeUsers.map((user) => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Team Member",
      imageUrl: user.imageUrl,
      email: user.email,
    }));

    // If no active users detected, show at least the current user (fallback)
    if (users.length === 0 && fallbackUsers.length > 0) {
      setDisplayUsers(fallbackUsers);
    } else {
      setDisplayUsers(users);
    }
  }, [activeUsers, fallbackUsers]);

  // Show nothing while loading
  if (isLoading && displayUsers.length === 0) {
    return null;
  }

  // Show nothing if no users
  if (displayUsers.length === 0) {
    return null;
  }

  // Get users to display and count of additional users
  const displayedUsers = displayUsers.slice(0, DISPLAY_LIMIT);
  const additionalCount = Math.max(0, displayUsers.length - DISPLAY_LIMIT);

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {displayedUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative hover:z-50 transition-all">
                <Avatar className="h-8 w-8 border-2 border-zinc-950 ring-1 ring-zinc-800 hover:scale-110 transition-all cursor-pointer">
                  {user.imageUrl && (
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.name || user.email || "User"}
                    />
                  )}
                  <AvatarFallback
                    className={cn(
                      "text-white text-xs font-semibold",
                      getFallbackColor(user.id)
                    )}
                  >
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-zinc-900 text-white border-zinc-700 font-medium text-xs"
            >
              {user.name || user.email || "Team Member"}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* +X Indicator for additional members */}
        {additionalCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative hover:z-50 transition-all">
                <Avatar className="h-8 w-8 border-2 border-zinc-950 ring-1 ring-zinc-800 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                  <span className="text-white text-xs font-bold">
                    +{additionalCount}
                  </span>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-zinc-900 text-white border-zinc-700 font-medium text-xs"
            >
              {additionalCount} more member{additionalCount > 1 ? "s" : ""}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
