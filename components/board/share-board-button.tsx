"use client";

import { FormEvent, useState, useTransition } from "react";
import { Check, Copy, Loader2, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";

import { shareBoard } from "@/actions/share-board";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ShareBoardButtonProps {
  boardId: string;
  boardTitle: string;
  orgId: string | null;
  boardUrl: string;
  className?: string;
}

export function ShareBoardButton({
  boardId,
  boardTitle,
  orgId,
  boardUrl,
  className,
}: ShareBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canInvite = Boolean(orgId);

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(boardUrl);
      setCopied(true);
      toast.success("Board link copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canInvite) {
      toast.error("Personal boards cannot be shared with other users yet");
      return;
    }

    startTransition(async () => {
      const result = await shareBoard({
        boardId,
        email,
        redirectUrl: boardUrl,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Invitation sent to ${result.data?.email ?? email}`);
      setEmail("");
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "hidden h-8 border-none bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700 sm:flex",
            className
          )}
        >
          <Share2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Invite someone to collaborate on {boardTitle}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {canInvite ? (
            <div className="space-y-2">
              <label htmlFor="share-email" className="text-sm font-medium text-white">
                Email address
              </label>
              <div className="flex gap-2">
                <Input
                  id="share-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="teammate@example.com"
                  disabled={isPending}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                />
                <Button type="submit" disabled={isPending} className="h-8 bg-indigo-600 text-white hover:bg-indigo-700">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send invite</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
              This is a personal board, so only you can access it. To share work
              with another user, create the board while an organization is active.
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="board-link" className="text-sm font-medium text-white">
              Board link
            </label>
            <div className="flex gap-2">
              <Input
                id="board-link"
                value={boardUrl}
                readOnly
                className="bg-white/5 border-white/10 text-zinc-300"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onCopyLink}
                className="h-8 border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Done
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
