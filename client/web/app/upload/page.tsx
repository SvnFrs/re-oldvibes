"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconVideo,
  IconMapPin,
  IconTag,
  IconCurrencyDollar,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import { useAuth } from "../_contexts/AuthContext";
import { createVibe, uploadVibeMedia, type CreateVibeInput } from "../_apis/common/vibes";
import AuthGuard from "../_components/auth/AuthGuard";
import UploadSuccessModal from "../_components/upload/UploadSuccessModal";
import LocationPicker from "../_components/upload/LocationPicker";
import { PageShell } from "../_components/layout/PageShell";

// Constants
const CATEGORIES = [
  "electronics",
  "clothing",
  "books",
  "sports",
  "home",
  "automotive",
  "toys",
  "tools",
  "other",
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

// Media Preview Component
function MediaPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gruvbox-gray/20">
      {preview ? (
        <Image
          src={preview}
          alt="Preview"
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IconPhoto className="w-6 h-6 text-gruvbox-gray" />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-gruvbox-red text-gruvbox-dark-bg0 rounded-full flex items-center justify-center hover:bg-gruvbox-red/80 transition-colors"
      >
        <IconX className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateVibeInput>({
    itemName: "",
    description: "",
    price: 0,
    category: CATEGORIES[0],
    condition: CONDITIONS[0].value,
    tags: [],
    location: "",
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedVibeId, setUploadedVibeId] = useState("");

  const handleInputChange = (field: keyof CreateVibeInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
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

    if (validFiles.length + mediaFiles.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }

    setMediaFiles(prev => [...prev, ...validFiles]);
    setError("");
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    handleInputChange('tags', tags);
  };

  const validateForm = (): boolean => {
    if (!formData.itemName.trim()) {
      setError("Item name is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }

    if (formData.price <= 0) {
      setError("Price must be greater than 0");
      return false;
    }

    if (!formData.category) {
      setError("Category is required");
      return false;
    }

    if (!formData.condition) {
      setError("Condition is required");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 1. Create vibe (without media)
      const vibeResponse = await createVibe(formData);

      // 2. Upload media if any
      if (mediaFiles.length > 0) {
        await uploadVibeMedia(vibeResponse.vibe.id, mediaFiles);
      }

      // Success - show modal
      setUploadedVibeId(vibeResponse.vibe.id);
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to create vibe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
        <PageShell width="md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark rounded-xl flex items-center justify-center">
                <IconUpload className="w-6 h-6 text-gruvbox-dark-bg0" />
              </div>
              <h1 className="text-3xl font-bold text-gruvbox-dark-fg0">
                Upload Your Vibe
              </h1>
            </div>
            <p className="text-gruvbox-dark-fg2">
              Share your vintage finds with the community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-gruvbox-red/10 border border-gruvbox-red/20 rounded-lg p-4 flex items-center space-x-2">
                <IconAlertCircle className="w-5 h-5 text-gruvbox-red flex-shrink-0" />
                <span className="text-gruvbox-red">{error}</span>
              </div>
            )}

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                className="w-full px-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                placeholder="e.g., Vintage Leather Jacket"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0 resize-none"
                placeholder="Describe your item in detail..."
                required
              />
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                  Price (VND) *
                </label>
                <div className="relative">
                  <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gruvbox-gray" />
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                    placeholder="500000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                  required
                >
                  {CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                  Location
                </label>
                <LocationPicker
                  value={formData.location || ''}
                  onChange={(location) => handleInputChange('location', location)}
                  placeholder="Select your province/city..."
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                Tags
              </label>
              <div className="relative">
                <IconTag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gruvbox-gray" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                  placeholder="vintage, leather, jacket (comma separated)"
                />
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gruvbox-yellow/20 text-gruvbox-yellow text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                Photos/Videos (Max 5 files, 10MB each)
              </label>

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
                className="w-full border-2 border-dashed border-gruvbox-gray/30 rounded-lg p-8 text-center hover:border-gruvbox-yellow/50 hover:bg-gruvbox-yellow/5 transition-colors"
              >
                <IconUpload className="w-8 h-8 text-gruvbox-gray mx-auto mb-2" />
                <p className="text-gruvbox-dark-fg2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gruvbox-gray mt-1">
                  PNG, JPG, MP4 up to 10MB each
                </p>
              </button>

              {/* Media Previews */}
              {mediaFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-3">
                    {mediaFiles.map((file, index) => (
                      <MediaPreview
                        key={index}
                        file={file}
                        onRemove={() => handleRemoveMedia(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gruvbox-gray/30 text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-gray/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gruvbox-dark-bg0 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <IconCheck className="w-4 h-4" />
                    <span>Upload Vibe</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success Modal */}
          <UploadSuccessModal
            isOpen={showSuccessModal}
            vibeId={uploadedVibeId}
            onClose={() => setShowSuccessModal(false)}
          />
        </PageShell>
      </div>
    </AuthGuard>
  );
}