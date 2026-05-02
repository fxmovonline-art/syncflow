"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, AuditLog } from "@prisma/client";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Check, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { ActivityItem } from "@/components/activity-item";
import { deleteCard } from "@/actions/delete-card";
import { updateCard } from "@/actions/update-card";
import { updateCardDescription } from "@/actions/update-card-description";
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  ChecklistItem,
} from "@/actions/update-checklist";

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  boardLogs?: AuditLog[];
}

export const CardModal = ({ card, isOpen, onClose, boardLogs = [] }: CardModalProps) => {
  const params = useParams();
  const slug = params.slug as string;
  const [isPending, startTransition] = useTransition();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Update local state when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setChecklist((Array.isArray(card.checklistItems) ? card.checklistItems : []) as unknown as ChecklistItem[]);
      setIsEditingDesc(false);
    }
  }, [card?.id]);

  // Filter logs for this card
  const cardLogs = boardLogs.filter((log) => log.entityId === card?.id);

  // Handle description save
  const handleSaveDescription = () => {
    if (!card) return;

    startTransition(async () => {
      const result = await updateCardDescription(card.id, description, slug);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Description updated");
        setIsEditingDesc(false);
      }
    });
  };

  // Handle add checklist item
  const handleAddItem = () => {
    if (!card || !newItemText.trim()) {
      toast.error("Item text is required");
      return;
    }

    startTransition(async () => {
      const result = await addChecklistItem(card.id, newItemText, slug);

      if (result.error) {
        toast.error(result.error);
      } else {
        setNewItemText("");
        setIsAddingItem(false);
        setChecklist((Array.isArray(result.data) ? result.data : []) as unknown as ChecklistItem[]);
        toast.success("Item added");
      }
    });
  };

  // Handle toggle item
  const handleToggleItem = (itemId: string) => {
    if (!card) return;

    startTransition(async () => {
      const result = await toggleChecklistItem(card.id, itemId, slug);

      if (result.error) {
        toast.error(result.error);
      } else {
        setChecklist((Array.isArray(result.data) ? result.data : []) as unknown as ChecklistItem[]);
      }
    });
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    if (!card) return;

    startTransition(async () => {
      const result = await deleteChecklistItem(card.id, itemId, slug);

      if (result.error) {
        toast.error(result.error);
      } else {
        setChecklist((Array.isArray(result.data) ? result.data : []) as unknown as ChecklistItem[]);
        toast.success("Item removed");
      }
    });
  };

  const handleDelete = () => {
    if (!card) return;

    startTransition(async () => {
      const result = await deleteCard(card.id, slug);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Card deleted");
        setShowDeleteAlert(false);
        onClose();
      }
    });
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] w-[95vw] sm:w-full border-white/10 bg-zinc-950 text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold truncate">{card?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-200">Description</label>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isPending}
                    className="min-h-[120px] resize-none bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-white/20"
                    placeholder="Add a detailed description for this card..."
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveDescription}
                      disabled={isPending}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setDescription(card?.description || "");
                        setIsEditingDesc(false);
                      }}
                      disabled={isPending}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="min-h-[80px] bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors text-zinc-300"
                >
                  {description || (
                    <span className="text-zinc-500 italic">Click to add a description...</span>
                  )}
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-200">Checklist</label>
                {totalCount > 0 && (
                  <span className="text-xs text-zinc-400">
                    {completedCount}/{totalCount} completed
                  </span>
                )}
              </div>

              {/* Checklist Progress Bar */}
              {totalCount > 0 && (
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
              )}

              {/* Checklist Items */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-lg group"
                  >
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      disabled={isPending}
                      className={`flex-shrink-0 h-5 w-5 rounded border-2 transition-all flex items-center justify-center ${
                        item.completed
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      {item.completed && <Check className="h-3 w-3 text-emerald-400" />}
                    </button>
                    <span
                      className={`flex-1 text-sm transition-colors ${
                        item.completed
                          ? "text-zinc-500 line-through"
                          : "text-zinc-200"
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={isPending}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                      title="Delete item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Item */}
              {!isAddingItem ? (
                <Button
                  onClick={() => setIsAddingItem(true)}
                  disabled={isPending}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add item
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem();
                      if (e.key === "Escape") {
                        setIsAddingItem(false);
                        setNewItemText("");
                      }
                    }}
                    disabled={isPending}
                    placeholder="Item text..."
                    className="bg-white/5 border-white/10 text-white placeholder-zinc-500"
                  />
                  <Button
                    onClick={handleAddItem}
                    disabled={isPending || !newItemText.trim()}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Activity Feed */}
            {cardLogs.length > 0 && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <label className="text-sm font-semibold text-zinc-200">Activity</label>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {cardLogs.map((log) => (
                    <ActivityItem key={log.id} data={log} />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
              <Button
                onClick={() => setShowDeleteAlert(true)}
                disabled={isPending}
                variant="outline"
                className="ml-auto border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="border-white/10 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Card?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{card?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
