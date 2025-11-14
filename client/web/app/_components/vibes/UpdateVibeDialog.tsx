"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  IconTag,
  IconUpload,
  IconX,
  IconPhoto,
  IconVideo,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import Image from "next/image";
import { updateVibe } from "../../_apis/common/vibes";
import LocationPicker from "../upload/LocationPicker";
import { useAuth } from "../../_contexts/AuthContext";
import { uploadVibeMediaToBackend } from "../../_apis/common/upload";
import { v4 as uuidv4 } from "uuid";

interface Vibe {
  id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags: string[];
  location?: string;
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
    _id?: string;
  }[];
  userId: string;
  status: string;
}

interface UpdateVibeDialogProps {
  open: boolean;
  onClose: () => void;
  vibe: Vibe | null;
  onUpdateSuccess?: () => void;
}

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Books",
  "Toys",
  "Home",
  "Sports",
  "Beauty",
  "Other",
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

// Media Preview Component
function MediaPreview({
  url,
  type,
  onRemove,
  isExisting = false,
}: {
  url: string;
  type: "image" | "video";
  onRemove: () => void;
  isExisting?: boolean;
}) {
  const isValidUrl = url && url.trim() !== "";

  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gruvbox-gray/20">
      {isValidUrl ? (
        type === "image" ? (
          <Image src={url} alt="Preview" fill className="object-cover" />
        ) : (
          <video src={url} className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IconPhoto className="w-6 h-6 text-gruvbox-gray" />
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-1 right-1 w-6 h-6 bg-gruvbox-red text-white rounded-full flex items-center justify-center hover:bg-gruvbox-red/80 transition-colors z-10"
      >
        <IconX className="w-4 h-4" />
      </button>
      {isExisting && isValidUrl && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5">
          Existing
        </div>
      )}
    </div>
  );
}

export function UpdateVibeDialog({
  open,
  onClose,
  vibe,
  onUpdateSuccess,
}: UpdateVibeDialogProps) {
  const { user } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
  });

  // Existing media files from the vibe
  const [existingMedia, setExistingMedia] = useState<
    { type: "image" | "video"; url: string; _id?: string }[]
  >([]);
  // Original media files to track what was removed
  const [originalMedia, setOriginalMedia] = useState<
    { type: "image" | "video"; url: string; _id?: string }[]
  >([]);
  // New media files to upload
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when vibe prop changes
  useEffect(() => {
    if (vibe) {
      setFormData({
        itemName: vibe.itemName || "",
        description: vibe.description || "",
        price: vibe.price?.toString() || "",
        category: vibe.category || "",
        condition: vibe.condition || "",
        location: vibe.location || "",
      });
      setTags(vibe.tags || []);
      const mediaFiles = vibe.mediaFiles || [];
      setExistingMedia(mediaFiles);
      setOriginalMedia(mediaFiles); // Store original to track deletions
      setNewMediaFiles([]);
      setNewMediaPreviews([]);
      setError("");
    }
  }, [vibe, open]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max

      if (!isValidType) {
        setError(`File ${file.name} is not a valid image or video`);
        return false;
      }

      if (!isValidSize) {
        setError(`File ${file.name} is too large (max 10MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length + existingMedia.length + newMediaFiles.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }

    // Create previews for new files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setNewMediaPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setNewMediaFiles((prev) => [...prev, ...validFiles]);
    setError("");
  };

  const handleRemoveExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewMedia = (index: number) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setNewMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!vibe) return;

    // Validate form
    if (!formData.itemName.trim()) {
      setError("Item name is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const vibeId = vibe.id || "";
      if (!vibeId) {
        setError("Vibe ID is required");
        setIsSubmitting(false);
        return;
      }

      // Upload new media files to backend (AWS S3) if any
      const newMediaFilesToUpload = newMediaFiles.filter((file) =>
        file instanceof File
      );
      
      if (newMediaFilesToUpload.length > 0) {
        try {
          await uploadVibeMediaToBackend(vibeId, newMediaFilesToUpload);
        } catch (uploadError) {
          setError(`Failed to upload media: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Calculate which media files were removed
      const remainingMediaIds = existingMedia
        .map((media) => media._id)
        .filter((id) => id !== undefined);
      const removedMediaIds = originalMedia
        .filter((media) => media._id && !remainingMediaIds.includes(media._id))
        .map((media) => media._id)
        .filter((id): id is string => id !== undefined);

      // Prepare remaining existing media (to keep) - these will be preserved
      const mediaFilesToKeep = existingMedia.map((media) => ({
        type: media.type,
        url: media.url,
        _id: media._id,
      }));

      const updateData = {
        ...formData,
        tags,
        price: Number(formData.price),
        // Include remaining media files (existing media that are kept)
        mediaFiles: mediaFilesToKeep,
        // Include IDs of media files to remove
        ...(removedMediaIds.length > 0 && {
          removedMediaIds: removedMediaIds,
        }),
      };

      // Update vibe basic info (includes media file updates)
      const userId = vibe.userId || user?.id || "";
      if (!userId) {
        setError("User ID is required");
        setIsSubmitting(false);
        return;
      }

      // console.log("CHECK updateData", updateData);

      await updateVibe(vibe.id, userId, updateData);

      // Call success callback
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error("Error updating vibe:", error);
      setError(error.message || "Failed to update vibe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vibe) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Vibe</DialogTitle>
            <DialogDescription>
              Update your vibe details. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            {/* Item Name */}
            <div className="grid gap-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter item name"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price">Price (VND)</Label>
              <div className="relative">
                <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="1000"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Category and Condition Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <LocationPicker
                value={formData.location}
                onChange={(location) =>
                  setFormData((prev) => ({ ...prev, location }))
                }
                placeholder="Select a city"
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gruvbox-orange text-white px-4 py-2 rounded-md text-sm hover:bg-gruvbox-orange/90"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center gap-1 "
                    >
                      <IconTag size={14} /> {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Files */}
            <div className="grid gap-2">
              <Label>Media Files (Max 5 total)</Label>

              {/* Existing Media */}
              {existingMedia.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-2">Existing Media:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingMedia.map((media, index) => (
                      <MediaPreview
                        key={index}
                        url={media.url}
                        type={media.type}
                        onRemove={() => handleRemoveExistingMedia(index)}
                        isExisting={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New Media Upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gruvbox-orange/50 hover:bg-gruvbox-orange/5 transition-colors"
              >
                <IconUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload new media or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, MP4 up to 10MB each
                </p>
              </button>

              {/* New Media Previews */}
              {newMediaFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">New Media:</p>
                  <div className="flex flex-wrap gap-2">
                    {newMediaFiles.map((file, index) => {
                      const fileType = file.type.startsWith("image/")
                        ? "image"
                        : "video";
                      return (
                        <MediaPreview
                          key={index}
                          url={newMediaPreviews[index] || ""}
                          type={fileType}
                          onRemove={() => handleRemoveNewMedia(index)}
                          isExisting={false}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="bg-gray-500 text-white text-base cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gruvbox-orange text-white text-base cursor-pointer px-4 py-2 rounded-lg hover:bg-gruvbox-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
