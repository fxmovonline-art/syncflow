"use client";

import { useState, useTransition } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { List, Card, AuditLog } from "@prisma/client";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { CardItem } from "./card-item";
import { CardForm } from "./card-form";
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
import { deleteList } from "@/actions/delete-list";

interface ListItemProps {
  data: List & { cards: Card[] };
  index: number;
  boardLogs?: AuditLog[];
}

const GRADIENTS = [
  "from-rose-500 to-pink-500",
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-indigo-500",
  "from-violet-500 to-purple-500",
];

export const ListItem = ({ data, index, boardLogs = [] }: ListItemProps) => {
  const params = useParams();
  const slug = params.slug as string;
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isPending, startTransition] = useTransition();
  const headerGradient = GRADIENTS[index % GRADIENTS.length];

  const handleDeleteList = () => {
    startTransition(async () => {
      const result = await deleteList(data.id, slug);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("List deleted");
        setShowDeleteAlert(false);
      }
    });
  };

  return (
    <>
      <Draggable draggableId={data.id} index={index}>
        {(provided, snapshot) => (
          <div 
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="w-[280px] shrink-0 h-fit transition-transform duration-200"
          >
            <div 
              {...provided.dragHandleProps}
              className={`
                group backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-2xl flex flex-col max-h-full border border-white/10 shadow-2xl transition-all overflow-hidden
                ${snapshot.isDragging ? "rotate-[2deg] scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/20 border-white/20" : ""}
              `}
            >
              {/* Gradient Header Area */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${headerGradient}`} />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-white tracking-wide uppercase">
                      {data.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <div className="h-5 w-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-white/40">
                      {data.cards.length}
                    </div>
                    <button
                      onClick={() => setShowDeleteAlert(true)}
                      disabled={isPending}
                      className="h-5 w-5 rounded-md bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-300"
                      title="Delete list"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <Droppable droppableId={data.id} type="card">
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`
                        flex-1 flex flex-col gap-3 min-h-[10px] pb-2 transition-colors duration-200 rounded-xl
                        ${snapshot.isDraggingOver ? "bg-white/5" : ""}
                      `}
                    >
                      {data.cards.map((card, index) => (
                        <CardItem 
                          key={card.id}
                          index={index}
                          data={card}
                          boardLogs={boardLogs}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <div className="mt-2">
                  <CardForm listId={data.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="border-white/10 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete List?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{data.title}" and all its cards? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
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
