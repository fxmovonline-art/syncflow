"use client";

import { useEffect, useState } from "react";
import { ListContainer } from "@/components/board/list-container";
import type { Board, List, Card, AuditLog } from "@prisma/client";

interface BoardWithRelations extends Board {
  lists: (List & { cards: Card[] })[];
  logs: AuditLog[];
}

interface RealtimeBoardContainerProps {
  initialBoard: BoardWithRelations;
  slug: string;
}

export function RealtimeBoardContainer({ 
  initialBoard, 
  slug 
}: RealtimeBoardContainerProps) {
  const [board, setBoard] = useState<BoardWithRelations>(initialBoard);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for board changes every 2 seconds for real-time updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch(`/api/boards/${slug}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const freshBoard = await response.json();
          setBoard(freshBoard);
        }
      } catch (error) {
        console.error("Failed to fetch board updates:", error);
      } finally {
        setIsRefreshing(false);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [slug]);

  return (
    <ListContainer 
      boardId={board.id}
      data={board.lists}
      boardLogs={board.logs}
    />
  );
}
