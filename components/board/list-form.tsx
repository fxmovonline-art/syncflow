"use client";

import { useState, useRef, useTransition } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createList } from "@/actions/create-list";

interface ListFormProps {
  boardId: string;
}

export const ListForm = ({ boardId }: ListFormProps) => {
  const params = useParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      formRef.current?.querySelector("input")?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createList(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`List "${result.data.title}" created`);
        disableEditing();
      }
    });
  };

  if (isEditing) {
    return (
      <div className="w-[272px] shrink-0 bg-[#f1f2f4] dark:bg-zinc-800 rounded-xl p-3 shadow-sm h-fit">
        <form 
          action={onSubmit}
          ref={formRef}
          className="space-y-3"
        >
          <input hidden name="boardId" value={boardId} readOnly />
          <input hidden name="slug" value={params.slug} readOnly />
          <Input 
            name="title"
            placeholder="Enter list title..."
            className="text-sm font-medium h-9 px-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
            disabled={isPending}
            required
          />
          <div className="flex items-center gap-x-1">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add list
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={disableEditing}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-[272px] shrink-0">
      <button 
        onClick={enableEditing}
        className="w-full bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition"
      >
        <Plus className="h-4 w-4" />
        Add another list
      </button>
    </div>
  );
};
