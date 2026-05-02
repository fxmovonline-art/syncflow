"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreateBoardModal } from "@/components/create-board-modal";

interface Board {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
}

interface BoardGridProps {
  initialBoards: Board[];
  boardContext: string;
  orgName: string | null;
}

export function BoardGrid({ initialBoards, boardContext, orgName }: BoardGridProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for board changes every 3 seconds for real-time updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch("/api/boards", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const freshBoards = await response.json();
          setBoards(freshBoards);
        }
      } catch (error) {
        console.error("Failed to fetch boards:", error);
      } finally {
        setIsRefreshing(false);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <>
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl h-[400px]">
          <svg
            className="w-32 h-32 mb-6 text-zinc-300 dark:text-zinc-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
          <p className="text-zinc-500 mb-6 max-w-sm">
            {boardContext === "organization"
              ? `No boards in ${orgName} yet. Create your first board to get started.`
              : "You don't have any personal boards. Create your first board to organize your tasks."
            }
          </p>
          <CreateBoardModal>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
              Create your first board
            </button>
          </CreateBoardModal>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreateBoardModal>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col items-center justify-center text-center h-[180px]">
              <h3 className="font-semibold text-lg text-primary">Create New Board</h3>
              <p className="text-sm text-zinc-500 mt-1">Start a new project</p>
            </div>
          </CreateBoardModal>
          {boards.map((board) => (
            <Link key={board.id} href={`/board/${board.slug}`}>
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between h-[180px]">
                <h3 className="font-semibold text-lg truncate">{board.title}</h3>
                <p className="text-xs text-zinc-400">
                  Created{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(board.createdAt))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
