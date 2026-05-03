"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBoard } from "@/actions/create-board";
import { getBoardImages } from "@/actions/get-board-images";
import type { UnsplashImage } from "@/lib/unsplash";
import { Check, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CreateBoardModal = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [boardTitle, setBoardTitle] = useState("");

  const loadImages = () => {
    if (images.length > 0 || isLoadingImages) {
      return;
    }

    setIsLoadingImages(true);
    void getBoardImages(9)
      .then((result) => {
        if (result.data) {
          setImages(result.data);
          return;
        }

        toast.error(result.error ?? "Failed to load images");
        setImages([]);
      })
      .catch(() => {
        toast.error("Failed to load images");
        setImages([]);
      })
      .finally(() => setIsLoadingImages(false));
  };

  const onSubmit = (formData: FormData) => {
    if (!boardTitle.trim()) {
      toast.error("Board title is required");
      return;
    }

    formData.set("title", boardTitle);

    if (selectedImage) {
      formData.set("imageId", selectedImage.id);
      formData.set("imageThumbUrl", selectedImage.urls.thumb);
      formData.set("imageFullUrl", selectedImage.urls.full);
      formData.set("imageUserName", selectedImage.user.name);
      formData.set("imageLinkHTML", selectedImage.links.html);
    }

    startTransition(async () => {
      const result = await createBoard(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Board created successfully!");
        setIsOpen(false);
        setBoardTitle("");
        setSelectedImage(null);
        // Navigate to dashboard to trigger a fresh server-side render
        // so the new board is immediately visible
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadImages();
    }

    if (!open) {
      setBoardTitle("");
      setSelectedImage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Give your project a title and choose a beautiful background image.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-6 pt-4">
          {/* Board Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-white">
              Board Title
            </label>
            <Input
              id="title"
              placeholder="e.g. Website Redesign"
              required
              disabled={isPending}
              maxLength={60}
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-zinc-500"
            />
          </div>

          {/* Image Selection Grid */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Background Image
            </label>

            {isLoadingImages ? (
              <div className="grid grid-cols-3 gap-2 py-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-white/5 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-2">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    disabled={isPending}
                    className="relative group overflow-hidden rounded-lg aspect-video border-2 transition-all hover:border-indigo-500"
                    style={{
                      borderColor:
                        selectedImage?.id === image.id ? "rgb(99, 102, 241)" : "rgb(255, 255, 255, 0.1)",
                    }}
                  >
                    <img
                      src={image.urls.thumb}
                      alt={`Background by ${image.user.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Checkmark Overlay */}
                    {selectedImage?.id === image.id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-indigo-600 rounded-full p-1">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Photographer Name on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-xs text-white truncate">
                        By {image.user.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400">
                Unable to load images. You can still create the board without a cover.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Board"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
