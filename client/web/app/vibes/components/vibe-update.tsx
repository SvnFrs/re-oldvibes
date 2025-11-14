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
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  IconTag,
  IconUpload,
  IconX,
  IconPhoto,
  IconCurrencyDollar,
  IconAlertCircle,
  IconLoader2,
  IconPencil,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import { updateVibe } from "../../_apis/common/vibes";
import LocationPicker from "../../_components/upload/LocationPicker";
import { useAuth } from "../../_contexts/AuthContext";
import { uploadVibeMediaToBackend } from "../../_apis/common/upload";

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
    <div className="group relative w-24 h-24 rounded-xl overflow-hidden bg-gruvbox-dark-bg3 border-2 border-gruvbox-dark-bg3 hover:border-gruvbox-orange transition-all">
      {isValidUrl ? (
        type === "image" ? (
          <Image
            src={url}
            alt="Preview"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <video src={url} className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IconPhoto className="w-6 h-6 text-gruvbox-gray" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          className="p-2 bg-gruvbox-red rounded-full hover:scale-110 transition-transform"
        >
          <IconX className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Badge */}
      {isExisting && isValidUrl && (
        <div className="absolute top-1 right-1 bg-gruvbox-blue/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Existing
        </div>
      )}
    </div>
  );
}

export function VibeUpdate({ data }: { data: any }) {
  const { user } = useAuth();
  const [tags, setTags] = useState<string[]>(data?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    itemName: data?.itemName || "",
    description: data?.description || "",
    price: data?.price || "",
    category: data?.category || "",
    condition: data?.condition || "",
    location: data?.location || "",
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
    if (data) {
      setFormData({
        itemName: data.itemName || "",
        description: data.description || "",
        price: data.price?.toString() || "",
        category: data.category || "",
        condition: data.condition || "",
        location: data.location || "",
      });
      setTags(data.tags || []);
      const mediaFiles = data.mediaFiles || [];
      setExistingMedia(mediaFiles);
      setOriginalMedia(mediaFiles);
      setNewMediaFiles([]);
      setNewMediaPreviews([]);
      setError("");
    }
  }, [data]);

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

    if (!data) return;

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
      const vibeId = data.id || data._id || "";
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
          setError(
            `Failed to upload media: ${
              uploadError instanceof Error ? uploadError.message : "Unknown error"
            }`
          );
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

      const userId = data.userId || user?.id || "";

      if (!userId) {
        setError("User ID is required");
        setIsSubmitting(false);
        return;
      }

      await updateVibe(vibeId, userId, updateData);
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating vibe:", error);
      setError(error.message || "Failed to update vibe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
          <IconPencil size={18} />
          <span>Edit</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gruvbox-dark-bg1 border-gruvbox-dark-bg3">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow rounded-full flex items-center justify-center">
                <IconPencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-gruvbox-dark-fg0">
                  Edit Vibe
                </DialogTitle>
                <DialogDescription className="text-gruvbox-gray">
                  Update your vibe details and media
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="my-4 bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
              <p className="text-gruvbox-red text-sm flex items-center gap-2">
                <IconAlertCircle size={16} />
                {error}
              </p>
            </div>
          )}

          <div className="grid gap-6 py-4">
            {/* Item Name */}
            <div className="grid gap-2">
              <Label htmlFor="itemName" className="text-gruvbox-dark-fg0">
                Item Name *
              </Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter item name"
                className="bg-gruvbox-dark-bg2 border-gruvbox-dark-bg3 text-gruvbox-dark-fg0"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gruvbox-dark-fg0">
                Description *
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item..."
                className="flex min-h-[100px] w-full rounded-md border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2 px-3 py-2 text-sm text-gruvbox-dark-fg0 ring-offset-background placeholder:text-gruvbox-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-orange/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-gruvbox-dark-fg0">
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
                  className="pl-10 bg-gruvbox-dark-bg2 border-gruvbox-dark-bg3 text-gruvbox-dark-fg0"
                  required
                />
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-gruvbox-dark-fg0">
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2 px-3 py-2 text-sm text-gruvbox-dark-fg0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-orange/50 focus-visible:ring-offset-2"
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

              <div className="grid gap-2">
                <Label htmlFor="condition" className="text-gruvbox-dark-fg0">
                  Condition *
                </Label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2 px-3 py-2 text-sm text-gruvbox-dark-fg0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-orange/50 focus-visible:ring-offset-2"
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
              <Label htmlFor="location" className="text-gruvbox-dark-fg0">
                Location
              </Label>
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
              <Label htmlFor="tags" className="text-gruvbox-dark-fg0">
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter"
                  className="bg-gruvbox-dark-bg2 border-gruvbox-dark-bg3 text-gruvbox-dark-fg0"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gruvbox-orange text-white rounded-lg text-sm font-medium hover:bg-gruvbox-yellow transition-colors"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="group flex items-center gap-1.5 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 px-3 py-1.5 rounded-lg text-sm border border-gruvbox-dark-bg3 hover:border-gruvbox-orange transition-colors"
                    >
                      <IconTag size={14} className="text-gruvbox-orange" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gruvbox-gray hover:text-gruvbox-red transition-colors"
                      >
                        <IconX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Files */}
            <div className="grid gap-3">
              <Label className="text-gruvbox-dark-fg0">
                Media Files (Max 5 total)
              </Label>

              {/* Existing Media */}
              {existingMedia.length > 0 && (
                <div>
                  <p className="text-sm text-gruvbox-gray mb-3">
                    Existing Media ({existingMedia.length})
                  </p>
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

              {/* Upload Button */}
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
                className="relative w-full border-2 border-dashed border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 rounded-xl p-6 text-center transition-all duration-200 group bg-gruvbox-dark-bg2 hover:bg-gruvbox-orange/5"
              >
                <IconUpload className="w-8 h-8 text-gruvbox-gray mx-auto mb-3 group-hover:text-gruvbox-orange transition-colors" />
                <p className="text-sm text-gruvbox-dark-fg0 font-medium mb-1">
                  Click to upload new media
                </p>
                <p className="text-xs text-gruvbox-gray">
                  PNG, JPG, MP4 up to 10MB each
                </p>
              </button>

              {/* New Media Previews */}
              {newMediaFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gruvbox-gray mb-3">
                    New Media ({newMediaFiles.length})
                  </p>
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

          <DialogFooter className="gap-2 pt-6 border-t border-gruvbox-dark-bg3">
            <DialogClose asChild>
              <button
                type="button"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-xl font-medium hover:bg-gruvbox-dark-bg3 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-xl font-medium hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="animate-spin h-5 w-5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-5 h-5" />
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