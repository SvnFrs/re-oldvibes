"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconAlertCircle,
  IconCheck,
  IconFlag,
  IconLoader2,
} from "@tabler/icons-react";
import Image from "next/image";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import { reportAPI, type ReportInput } from "../_apis/common/feedback";
import { uploadToCloudinaryImage } from "../_apis/common/upload";
import { getVibeById } from "../_apis/common/vibes";
import AuthGuard from "../_components/auth/AuthGuard";

const REPORT_TYPES = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "abusive", label: "Abusive Content" },
  { value: "other", label: "Other" },
] as const;

// Image Preview Component
function ImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gruvbox-gray/20">
      {preview ? (
        <Image src={preview} alt="Preview" fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IconPhoto className="w-6 h-6 text-gruvbox-gray" />
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 bg-gruvbox-red text-gruvbox-light-bg0 rounded-full flex items-center justify-center hover:bg-gruvbox-red/80 transition-colors"
      >
        <IconX className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vibeId = searchParams.get("vibeId");
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vibe data state
  const [vibe, setVibe] = useState<any>(null);
  const [loadingVibe, setLoadingVibe] = useState(true);

  // Form state
  const [formData, setFormData] = useState<ReportInput>({
    vibeId: vibeId || "",
    reportType: "spam",
    reportDescription: "",
    reportImages: [],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch vibe data
  useEffect(() => {
    const fetchVibe = async () => {
      if (!vibeId) {
        setError("Vibe ID is required");
        setLoadingVibe(false);
        return;
      }

      try {
        const vibeData = await getVibeById(vibeId);
        setVibe(vibeData.vibe);
        setFormData((prev) => ({ ...prev, vibeId: vibeId }));
      } catch (err: any) {
        setError(err.message || "Failed to load vibe information");
      } finally {
        setLoadingVibe(false);
      }
    };

    fetchVibe();
  }, [vibeId]);

  const handleInputChange = (field: keyof ReportInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max

      if (!isValidType) {
        setError(`File ${file.name} is not a valid image`);
        return false;
      }

      if (!isValidSize) {
        setError(`File ${file.name} is too large (max 10MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    setError("");
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.vibeId) {
      setError("Vibe ID is required");
      return false;
    }

    if (!formData.reportType) {
      setError("Report type is required");
      return false;
    }

    if (!formData.reportDescription.trim()) {
      setError("Report description is required");
      return false;
    }

    if (formData.reportDescription.trim().length > 1000) {
      setError("Report description must be 1000 characters or less");
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
      let uploadedImageUrls: string[] = [];

      // Upload images to Cloudinary if any
      if (imageFiles.length > 0) {
        const cloudinaryResults = await uploadToCloudinaryImage(imageFiles);
        if (cloudinaryResults === false) {
          setError("Failed to upload images to Cloudinary");
          setIsSubmitting(false);
          return;
        }
        // Extract secure URLs from Cloudinary results
        uploadedImageUrls = cloudinaryResults.map(
          (result) => result.secure_url
        );
      }

      const reportData: ReportInput = {
        vibeId: formData.vibeId,
        reportType: formData.reportType,
        reportDescription: formData.reportDescription,
        reportImages: uploadedImageUrls,
      };

      await reportAPI.createReport(reportData);

      // Success
      setSuccess(true);
      setFormData({
        vibeId: vibeId || "",
        reportType: "spam",
        reportDescription: "",
        reportImages: [],
      });
      setImageFiles([]);
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingVibe) {
    return (
      <AuthGuard requireAuth={true}>
        <Wrapper>
          <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center">
            <div className="text-center">
              <IconLoader2 className="w-8 h-8 text-gruvbox-orange animate-spin mx-auto mb-4" />
              <p className="text-gruvbox-gray">Loading vibe information...</p>
            </div>
          </div>
        </Wrapper>
      </AuthGuard>
    );
  }

  if (success) {
    return (
      <AuthGuard requireAuth={true}>
        <Wrapper>
          <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0">
            <div className="max-w-2xl mx-auto px-4 py-8">
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gruvbox-green-light dark:bg-gruvbox-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconCheck className="w-8 h-8 text-gruvbox-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
                    Report Submitted Successfully! 🎉
                  </h2>
                  <p className="text-gruvbox-gray mb-6">
                    Thank you for your report. We will review it and take
                    appropriate action.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setSuccess(false);
                        router.push(vibeId ? `/vibes/${vibeId}` : "/");
                      }}
                      className="px-6 py-3 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 border border-gruvbox-gray/30 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-gray/10 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Wrapper>
      </AuthGuard>
    );
  }

  if (!vibe) {
    return (
      <AuthGuard requireAuth={true}>
        <Wrapper>
          <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0">
            <div className="max-w-2xl mx-auto px-4 py-8">
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8">
                <div className="text-center">
                  <IconAlertCircle className="w-12 h-12 text-gruvbox-red mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
                    Vibe Not Found
                  </h2>
                  <p className="text-gruvbox-gray mb-6">
                    {error || "The vibe you're trying to report could not be found."}
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Wrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <Wrapper>
        <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0">
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gruvbox-red-light dark:bg-gruvbox-red-dark rounded-xl flex items-center justify-center">
                  <IconFlag className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Report Vibe
                </h1>
              </div>
              <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                Report inappropriate content or behavior
              </p>
            </div>

            {/* Vibe Information */}
            <div className="mb-6 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg p-4 border border-gruvbox-gray/20">
              <h3 className="text-sm font-medium text-gruvbox-gray mb-2">
                Reporting Vibe:
              </h3>
              <p className="text-lg font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-1">
                {vibe.itemName}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gruvbox-gray">
                <span>by</span>
                <span className="font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                  {vibe.user?.name || "Unknown User"}
                </span>
                {vibe.user?.username && (
                  <span className="text-gruvbox-gray">
                    (@{vibe.user.username})
                  </span>
                )}
              </div>
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

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Report Type *
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) =>
                    handleInputChange(
                      "reportType",
                      e.target.value as ReportInput["reportType"]
                    )
                  }
                  className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
                  required
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.reportDescription}
                  onChange={(e) =>
                    handleInputChange("reportDescription", e.target.value)
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 resize-none"
                  placeholder="Please describe the issue in detail..."
                  required
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gruvbox-gray">
                  {formData.reportDescription.length}/1000 characters
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Images (Optional)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gruvbox-gray/30 rounded-lg p-8 text-center hover:border-gruvbox-yellow/50 hover:bg-gruvbox-yellow/5 transition-colors"
                >
                  <IconUpload className="w-8 h-8 text-gruvbox-gray mx-auto mb-2" />
                  <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gruvbox-gray mt-1">
                    PNG, JPG up to 10MB each (max 5 images)
                  </p>
                </button>

                {/* Image Previews */}
                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-3">
                      {imageFiles.map((file, index) => (
                        <ImagePreview
                          key={index}
                          file={file}
                          onRemove={() => handleRemoveImage(index)}
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
                  className="px-6 py-3 border border-gruvbox-gray/30 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-gray/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gruvbox-red text-gruvbox-light-bg0 font-medium rounded-lg hover:bg-gruvbox-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gruvbox-light-bg0 border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <IconFlag className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Wrapper>
    </AuthGuard>
  );
}

