"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteBoard } from "@/actions/delete-board";

interface BoardSettingsProps {
  boardId: string;
  boardTitle: string;
}

export const BoardSettings = ({ boardId, boardTitle }: BoardSettingsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteBoard = () => {
    startTransition(async () => {
      const result = await deleteBoard(boardId);

      if (result?.error) {
        toast.error(result.error);
        setShowDeleteAlert(false);
      }
      // If successful, deleteBoard redirects to /dashboard
    });
  };

  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isPending}
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white hover:bg-white/10"
          title="Board settings"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-zinc-900 border border-white/10 shadow-lg z-50">
            <button
              onClick={() => {
                setShowDeleteAlert(true);
                setShowMenu(false);
              }}
              disabled={isPending}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Board
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="border-white/10 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Board?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{boardTitle}"? This will permanently delete the board, all lists, and all cards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};
