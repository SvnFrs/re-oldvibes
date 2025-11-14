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
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconEdit,
} from "@tabler/icons-react";
import Image from "next/image";
import { updateVibe } from "../../_apis/common/vibes";
import LocationPicker from "../upload/LocationPicker";
import { useAuth } from "../../_contexts/AuthContext";
import { uploadVibeMediaToBackend } from "../../_apis/common/upload";

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

// Enhanced Media Preview Component
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
    <div className="group relative w-28 h-28 rounded-xl overflow-hidden bg-gruvbox-dark-bg3 border-2 border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 transition-all">
      {isValidUrl ? (
        type === "image" ? (
          <Image src={url} alt="Preview" fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <video src={url} className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IconPhoto className="w-8 h-8 text-gruvbox-gray" />
        </div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-2 right-2 w-7 h-7 bg-gruvbox-red hover:bg-gruvbox-red-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
      >
        <IconX className="w-4 h-4" />
      </button>

      {/* Badge */}
      {isExisting && isValidUrl && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <span className="text-white text-xs font-medium">Existing</span>
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

  const [existingMedia, setExistingMedia] = useState<
    { type: "image" | "video"; url: string; _id?: string }[]
  >([]);
  const [originalMedia, setOriginalMedia] = useState<
    { type: "image" | "video"; url: string; _id?: string }[]
  >([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setOriginalMedia(mediaFiles);
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

    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 10 * 1024 * 1024;

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

      const remainingMediaIds = existingMedia
        .map((media) => media._id)
        .filter((id) => id !== undefined);
      const removedMediaIds = originalMedia
        .filter((media) => media._id && !remainingMediaIds.includes(media._id))
        .map((media) => media._id)
        .filter((id): id is string => id !== undefined);

      const mediaFilesToKeep = existingMedia.map((media) => ({
        type: media.type,
        url: media.url,
        _id: media._id,
      }));

      const updateData = {
        ...formData,
        tags,
        price: Number(formData.price),
        mediaFiles: mediaFilesToKeep,
        ...(removedMediaIds.length > 0 && {
          removedMediaIds: removedMediaIds,
        }),
      };

      const userId = vibe.userId || user?.id || "";
      if (!userId) {
        setError("User ID is required");
        setIsSubmitting(false);
        return;
      }

      await updateVibe(vibe.id, userId, updateData);

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gruvbox-dark-bg1 border-2 border-gruvbox-dark-bg3 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center">
                <IconEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Edit Vibe</DialogTitle>
                <DialogDescription className="text-gruvbox-gray">
                  Update your vibe details. Changes will be saved immediately.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 text-gruvbox-red px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
              <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid gap-6 py-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-gruvbox-dark-fg0 font-medium">
                Item Name *
              </Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter item name"
                className="bg-gruvbox-dark-bg0 border-gruvbox-gray/20 focus:border-gruvbox-orange focus:ring-gruvbox-orange/50"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gruvbox-dark-fg0 font-medium">
                Description *
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail..."
                className="flex min-h-[120px] w-full rounded-xl border border-gruvbox-gray/20 bg-gruvbox-dark-bg0 px-4 py-3 text-sm text-gruvbox-dark-fg0 placeholder:text-gruvbox-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-orange/50 focus-visible:border-gruvbox-orange disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gruvbox-dark-fg0 font-medium">
                Price (VND) *
              </Label>
              <div className="relative">
                <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gruvbox-gray" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="1000"
                  className="pl-10 bg-gruvbox-dark-bg0 border-gruvbox-gray/20 focus:border-gruvbox-orange focus:ring-gruvbox-orange/50"
                  required
                />
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gruvbox-dark-fg0 font-medium">
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-11 w-full rounded-xl border border-gruvbox-gray/20 bg-gruvbox-dark-bg0 px-3 py-2 text-sm text-gruvbox-dark-fg0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-orange/50 focus-visible:border-gruvbox-orange"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-gruvbox-dark-fg0 font-medium">
                  Condition *
                </Label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="flex h-11 w-full rounded-xl border border-gruvbox-gray/20 bg-gruvbox-dark-bg0 px-3 py-2 text-sm text-gruvbox-dark-fg0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-orange/50 focus-visible:border-gruvbox-orange"
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
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gruvbox-dark-fg0 font-medium">
                Location
              </Label>
              <LocationPicker
                value={formData.location}
                onChange={(location) =>
                  setFormData((prev) => ({ ...prev, location }))
                }
                placeholder="Select your city"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gruvbox-dark-fg0 font-medium">
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 bg-gruvbox-dark-bg0 border-gruvbox-gray/20 focus:border-gruvbox-orange focus:ring-gruvbox-orange/50"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 px-3 py-1.5 rounded-lg text-sm border border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 transition-colors group"
                    >
                      <IconTag size={14} className="text-gruvbox-gray" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gruvbox-gray hover:text-gruvbox-red transition-colors"
                      >
                        <IconX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Files */}
            <div className="space-y-3">
              <Label className="text-gruvbox-dark-fg0 font-medium">
                Media Files (Max 5 total)
              </Label>

              {/* Existing Media */}
              {existingMedia.length > 0 && (
                <div>
                  <p className="text-sm text-gruvbox-gray mb-3">Existing Media:</p>
                  <div className="flex flex-wrap gap-3">
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

              {/* Upload Area */}
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
                className="w-full border-2 border-dashed border-gruvbox-gray/30 hover:border-gruvbox-orange/50 rounded-xl p-8 text-center hover:bg-gruvbox-orange/5 transition-all group"
              >
                <IconUpload className="w-8 h-8 text-gruvbox-gray group-hover:text-gruvbox-orange mx-auto mb-3 transition-colors" />
                <p className="text-sm text-gruvbox-dark-fg2 font-medium mb-1">
                  Click to upload new media
                </p>
                <p className="text-xs text-gruvbox-gray">
                  PNG, JPG, MP4 up to 10MB each
                </p>
              </button>

              {/* New Media Previews */}
              {newMediaFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gruvbox-gray mb-3">New Media:</p>
                  <div className="flex flex-wrap gap-3">
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

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <button
                type="button"
                className="px-6 py-3 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-xl font-medium hover:bg-gruvbox-dark-bg3 transition-all"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}