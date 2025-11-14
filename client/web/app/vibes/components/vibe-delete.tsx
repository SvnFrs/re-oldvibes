"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import {
  IconTrash,
  IconAlertTriangle,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { deleteVibe } from "@/app/_apis/common/vibes";

export function VibeDelete({ data }: { data: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setError("");

    try {
      await deleteVibe(data.id);
      window.location.href = "/settings";
    } catch (error) {
      console.error("Error deleting vibe:", error);
      setError("Failed to delete vibe. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gruvbox-red to-gruvbox-red-dark text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
          <IconTrash size={18} />
          <span>Delete</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gruvbox-dark-bg1 border-gruvbox-dark-bg3">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gruvbox-red to-gruvbox-red-dark rounded-full flex items-center justify-center">
                  <IconAlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-gruvbox-dark-fg0">
                    Delete Vibe
                  </DialogTitle>
                  <DialogDescription className="text-gruvbox-gray">
                    This action cannot be undone
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Vibe Preview */}
            <div className="bg-gruvbox-dark-bg2 rounded-xl p-4 border border-gruvbox-dark-bg3">
              <h3 className="font-semibold text-gruvbox-dark-fg0 mb-2">
                {data.itemName}
              </h3>
              <p className="text-sm text-gruvbox-gray line-clamp-2">
                {data.description}
              </p>
            </div>

            {/* Warning Message */}
            <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl p-4">
              <div className="flex gap-3">
                <IconAlertTriangle className="w-5 h-5 text-gruvbox-red flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gruvbox-dark-fg2">
                  <p className="font-semibold text-gruvbox-red mb-2">
                    Warning: This will permanently delete:
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>The vibe and all its media files</li>
                    <li>All comments and interactions</li>
                    <li>View history and statistics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                <p className="text-gruvbox-red text-sm flex items-center gap-2">
                  <IconAlertTriangle size={16} />
                  {error}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button
                type="button"
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-xl font-medium hover:bg-gruvbox-dark-bg3 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gruvbox-red to-gruvbox-red-dark text-white rounded-xl font-medium hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="animate-spin h-5 w-5" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <IconTrash className="w-5 h-5" />
                  <span>Delete Vibe</span>
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
