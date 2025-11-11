"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconAlertCircle,
  IconCheck,
  IconMessageCircle,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import Image from "next/image";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import {
  feedbackAPI,
  type FeedbackInput,
  type FeedbackItem,
} from "../_apis/common/feedback";
import { uploadToCloudinaryImage } from "../_apis/common/upload";
import AuthGuard from "../_components/auth/AuthGuard";
import Link from "next/link";

const FEEDBACK_TYPES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "suggestion", label: "Suggestion" },
  { value: "other", label: "Other" },
] as const;

const FEEDBACK_TYPE_META: Record<
  FeedbackInput["feedbackType"],
  { label: string; badgeClass: string }
> = {
  bug: {
    label: "Bug Report",
    badgeClass: "bg-gruvbox-red/10 text-gruvbox-red",
  },
  feature: {
    label: "Feature Request",
    badgeClass: "bg-gruvbox-blue/10 text-gruvbox-blue",
  },
  suggestion: {
    label: "Suggestion",
    badgeClass: "bg-gruvbox-green/10 text-gruvbox-green",
  },
  other: {
    label: "Other",
    badgeClass: "bg-gruvbox-yellow/10 text-gruvbox-yellow",
  },
};

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

export default function FeedbackPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FeedbackInput>({
    feedbackType: "bug",
    feedbackDescription: "",
    feedbackImages: [],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const [feedbackListError, setFeedbackListError] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatDateTime = (dateValue: string | Date) => {
    if (!dateValue) return "";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateValue));
  };

  const truncateDescription = (description: string, length = 160) => {
    if (!description) return "";
    return description.length > length
      ? `${description.slice(0, length - 3)}...`
      : description;
  };

  const fetchFeedbacks = useCallback(async () => {
    if (!user?.id) {
      setFeedbacks([]);
      setIsLoadingFeedbacks(false);
      return;
    }

    setIsLoadingFeedbacks(true);
    setFeedbackListError("");

    try {
      const response = await feedbackAPI.getFeedbacks({ userId: user.id });
      const normalizedFeedbacks =
        response.feedbacks?.map((feedback) => ({
          ...feedback,
          feedbackImages: feedback.feedbackImages || [],
        })) || [];
      setFeedbacks(normalizedFeedbacks);
    } catch (fetchError: any) {
      setFeedbackListError(
        fetchError?.message || "Failed to load submitted feedback"
      );
    } finally {
      setIsLoadingFeedbacks(false);
    }
  }, [user?.id]);

  const handleInputChange = (field: keyof FeedbackInput, value: any) => {
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
    if (!formData.feedbackType) {
      setError("Feedback type is required");
      return false;
    }

    if (!formData.feedbackDescription.trim()) {
      setError("Feedback description is required");
      return false;
    }

    if (formData.feedbackDescription.trim().length > 1000) {
      setError("Feedback description must be 1000 characters or less");
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

      const feedbackData: FeedbackInput = {
        feedbackType: formData.feedbackType,
        feedbackDescription: formData.feedbackDescription,
        feedbackImages: uploadedImageUrls,
      };

      await feedbackAPI.createFeedback(feedbackData);
      await fetchFeedbacks();

      // Success
      setSuccess(true);
      setFormData({
        feedbackType: "bug",
        feedbackDescription: "",
        feedbackImages: [],
      });
      setImageFiles([]);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedFeedback(null);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

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
                    Feedback Submitted Successfully! 🎉
                  </h2>
                  <p className="text-gruvbox-gray mb-6">
                    Thank you for your feedback. We appreciate your input and
                    will review it soon.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setSuccess(false);
                        router.push("/");
                      }}
                      className="px-6 py-3 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                    >
                      Go Home
                    </button>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 border border-gruvbox-gray/30 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-gray/10 transition-colors"
                    >
                      Submit Another
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

  return (
    <AuthGuard requireAuth={true}>
      <Wrapper>
        <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0">
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gruvbox-orange-light dark:bg-gruvbox-orange-dark rounded-xl flex items-center justify-center">
                  <IconMessageCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Submit Feedback
                </h1>
              </div>
              <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                Help us improve by sharing your thoughts, reporting bugs, or
                suggesting new features
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

              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Feedback Type *
                </label>
                <select
                  value={formData.feedbackType}
                  onChange={(e) =>
                    handleInputChange(
                      "feedbackType",
                      e.target.value as FeedbackInput["feedbackType"]
                    )
                  }
                  className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
                  required
                >
                  {FEEDBACK_TYPES.map((type) => (
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
                  value={formData.feedbackDescription}
                  onChange={(e) =>
                    handleInputChange("feedbackDescription", e.target.value)
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 resize-none"
                  placeholder="Please describe your feedback in detail..."
                  required
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gruvbox-gray">
                  {formData.feedbackDescription.length}/1000 characters
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
                  className="px-6 py-3 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gruvbox-dark-bg0 border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck className="w-4 h-4" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                    Submitted Feedback
                  </h2>
                  <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                    Review your previous submissions and track updates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchFeedbacks}
                  disabled={isLoadingFeedbacks}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gruvbox-gray/20 rounded-lg text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:bg-gruvbox-gray/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <IconRefresh
                    className={`w-4 h-4 ${
                      isLoadingFeedbacks ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {isLoadingFeedbacks ? "Refreshing..." : "Refresh"}
                  </span>
                </button>
              </div>

              {feedbackListError && (
                <div className="bg-gruvbox-red/10 border border-gruvbox-red/20 rounded-lg p-4 flex items-center space-x-3 mb-4">
                  <IconAlertCircle className="w-5 h-5 text-gruvbox-red flex-shrink-0" />
                  <span className="text-sm text-gruvbox-red">
                    {feedbackListError}
                  </span>
                </div>
              )}

              {isLoadingFeedbacks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-gruvbox-yellow border-t-transparent rounded-full animate-spin" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-2xl p-8 text-center">
                  <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                    You have not submitted any feedback yet. Share your thoughts
                    using the form below!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => {
                    const meta = FEEDBACK_TYPE_META[feedback.feedbackType];
                    return (
                      <div
                        key={feedback.id}
                        className="bg-gruvbox-light-bg1/30 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${meta.badgeClass}`}
                              >
                                {meta.label}
                              </span>
                              <span className="text-xs text-gruvbox-gray">
                                {formatDateTime(feedback.createdAt)}
                              </span>
                              {feedback.feedbackImages.length > 0 && (
                                <span className="text-xs text-gruvbox-blue">
                                  {feedback.feedbackImages.length} attachment
                                  {feedback.feedbackImages.length > 1
                                    ? "s"
                                    : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                              {truncateDescription(
                                feedback.feedbackDescription,
                                180
                              )}
                            </p>
                          </div>
                          <div className="flex items-center justify-end lg:justify-start gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(feedback)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-gruvbox-yellow text-gruvbox-dark-bg0 text-sm font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                            >
                              <IconEye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
        {isDetailOpen && selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-2xl bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/30 rounded-2xl shadow-2xl p-6">
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 hover:text-gruvbox-light-fg0 dark:hover:text-gruvbox-dark-fg0 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <span
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${
                      FEEDBACK_TYPE_META[selectedFeedback.feedbackType]
                        .badgeClass
                    }`}
                  >
                    {FEEDBACK_TYPE_META[selectedFeedback.feedbackType].label}
                  </span>
                  <span className="text-xs text-gruvbox-gray">
                    Created {formatDateTime(selectedFeedback.createdAt)}
                  </span>
                  <span className="text-xs text-gruvbox-gray">
                    Updated {formatDateTime(selectedFeedback.updatedAt)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                    Feedback Details
                  </h3>
                  <p className="mt-2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 whitespace-pre-wrap">
                    {selectedFeedback.feedbackDescription}
                  </p>
                </div>
                {selectedFeedback.feedbackImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                      Attachments
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedFeedback.feedbackImages.map(
                        (imageUrl, index) => (
                          <div
                            key={`${selectedFeedback.id}-image-${index}`}
                            className="relative w-full h-60 overflow-hidden rounded-lg border border-gruvbox-gray/20 bg-gruvbox-gray/10"
                          >
                            <Link href={imageUrl} target="_blank">
                              <Image
                                src={imageUrl}
                                alt={`Feedback attachment ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                              />
                            </Link>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="inline-flex items-center px-4 py-2 border border-gruvbox-gray/30 rounded-lg text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:bg-gruvbox-gray/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Wrapper>
    </AuthGuard>
  );
}
