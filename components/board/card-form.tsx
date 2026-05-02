"use client";

import { useState, useRef, useTransition, KeyboardEventHandler } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCard } from "@/actions/create-card";

interface CardFormProps {
  listId: string;
}

export const CardForm = ({ listId }: CardFormProps) => {
  const params = useParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      formRef.current?.querySelector("textarea")?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createCard(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Card "${result.data.title}" created`);
        formRef.current?.reset();
      }
    });
  };

  if (isEditing) {
    return (
      <form 
        action={onSubmit}
        ref={formRef}
        className="px-1 py-0.5 space-y-2"
      >
        <input hidden name="listId" value={listId} readOnly />
        <input hidden name="slug" value={params.slug} readOnly />
        <Textarea 
          name="title"
          onKeyDown={onKeyDown}
          placeholder="Enter a title for this card..."
          className="resize-none text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 min-h-[72px]"
          disabled={isPending}
          required
        />
        <div className="flex items-center gap-x-1">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Add card
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
    );
  }

  return (
    <div className="pt-2 px-1">
      <Button 
        onClick={enableEditing}
        variant="ghost"
        size="sm"
        className="h-auto px-2 py-1.5 w-full justify-start text-zinc-500 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a card
      </Button>
    </div>
  );
};
