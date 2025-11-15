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
  IconSend,
  IconSparkles,
  IconBug,
  IconBulb,
  IconDots,
  IconCalendar,
  IconPaperclip,
} from "@tabler/icons-react";
import Image from "next/image";
import { useAuth } from "../_contexts/AuthContext";
import {
  feedbackAPI,
  type FeedbackInput,
  type FeedbackItem,
} from "../_apis/common/feedback";
import AuthGuard from "../_components/auth/AuthGuard";
import Link from "next/link";
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";

const FEEDBACK_TYPES = [
  { value: "bug", label: "Bug Report", icon: IconBug, color: "from-gruvbox-red to-gruvbox-red-dark" },
  { value: "feature", label: "Feature Request", icon: IconBulb, color: "from-gruvbox-blue to-gruvbox-aqua" },
  { value: "suggestion", label: "Suggestion", icon: IconSparkles, color: "from-gruvbox-green to-gruvbox-yellow" },
  { value: "other", label: "Other", icon: IconDots, color: "from-gruvbox-orange to-gruvbox-yellow" },
] as const;

const FEEDBACK_TYPE_META: Record<
  FeedbackInput["feedbackType"],
  { label: string; badgeClass: string; iconColor: string }
> = {
  bug: {
    label: "Bug Report",
    badgeClass: "bg-gruvbox-red/10 text-gruvbox-red border-gruvbox-red/30",
    iconColor: "text-gruvbox-red",
  },
  feature: {
    label: "Feature Request",
    badgeClass: "bg-gruvbox-blue/10 text-gruvbox-blue border-gruvbox-blue/30",
    iconColor: "text-gruvbox-blue",
  },
  suggestion: {
    label: "Suggestion",
    badgeClass: "bg-gruvbox-green/10 text-gruvbox-green border-gruvbox-green/30",
    iconColor: "text-gruvbox-green",
  },
  other: {
    label: "Other",
    badgeClass: "bg-gruvbox-yellow/10 text-gruvbox-yellow border-gruvbox-yellow/30",
    iconColor: "text-gruvbox-yellow",
  },
};

// Enhanced Image Preview Component
function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 group">
      {preview ? (
        <Image
          src={preview}
          alt="Preview"
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <IconPhoto className="w-6 h-6 text-gruvbox-gray" />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-7 h-7 bg-gruvbox-red text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg z-10"
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
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
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
      const response = await feedbackAPI.getMyFeedbacks();
      const normalizedFeedbacks =
        response.feedbacks?.map((feedback) => ({
          ...feedback,
          feedbackImages: feedback.feedbackImages || [],
        })) || [];
      setFeedbacks(normalizedFeedbacks);
    } catch (fetchError: any) {
      setFeedbackListError(fetchError?.message || "Failed to load submitted feedback");
    } finally {
      setIsLoadingFeedbacks(false);
    }
  }, [user?.id]);

  const handleInputChange = (field: keyof FeedbackInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024;

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
      const feedbackData: FeedbackInput = {
        feedbackType: formData.feedbackType,
        feedbackDescription: formData.feedbackDescription,
      };

      await feedbackAPI.createFeedback(feedbackData, imageFiles);
      await fetchFeedbacks();

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
        <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
          <PageShell width="md">
            <FadeIn>
              <div className="bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8 border border-gruvbox-dark-bg2">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gruvbox-green to-gruvbox-green-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <IconCheck className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gruvbox-dark-fg0 mb-2">
                    Feedback Submitted! 🎉
                  </h2>
                  <p className="text-gruvbox-gray mb-8 max-w-md mx-auto">
                    Thank you for your feedback. We appreciate your input and will review it soon.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSuccess(false);
                        router.push("/");
                      }}
                      className="px-6 py-3 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 font-medium rounded-xl hover:bg-gruvbox-dark-bg3 transition-colors"
                    >
                      Go Home
                    </button>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white font-medium rounded-xl hover:shadow-lg transition-all"
                    >
                      Submit Another
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </PageShell>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
        <PageShell width="xl">
          <FadeIn>
            <SectionHeader
              title="Feedback"
              subtitle="Help us improve by sharing your thoughts, reporting bugs, or suggesting new features"
            />
          </FadeIn>

          {/* Changed from lg:grid-cols-3 to lg:grid-cols-[1fr_320px] for better proportions */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
            {/* Form Section - Now takes more space */}
            <SlideUp delay={0.1}>
              <div className="bg-gruvbox-dark-bg1 rounded-2xl shadow-xl border border-gruvbox-dark-bg2 p-6 md:p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gruvbox-orange/10 flex items-center justify-center">
                      <IconMessageCircle className="w-5 h-5 text-gruvbox-orange" />
                    </div>
                    <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
                      Submit Feedback
                    </h2>
                  </div>
                  <p className="text-sm text-gruvbox-gray">
                    Your feedback helps us build a better experience for everyone
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                      <IconAlertCircle className="w-5 h-5 text-gruvbox-red flex-shrink-0" />
                      <span className="text-gruvbox-red text-sm">{error}</span>
                    </div>
                  )}

                  {/* Feedback Type - Enhanced Cards */}
                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-3">
                      Feedback Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {FEEDBACK_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.feedbackType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleInputChange("feedbackType", type.value)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-gruvbox-orange bg-gruvbox-orange/10 shadow-lg"
                                : "border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2 hover:border-gruvbox-orange/50"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? "text-gruvbox-dark-fg0" : "text-gruvbox-gray"}`}>
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.feedbackDescription}
                      onChange={(e) => handleInputChange("feedbackDescription", e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-gruvbox-dark-bg2 border border-gruvbox-gray/20 rounded-xl focus:ring-2 focus:ring-gruvbox-orange/50 focus:border-gruvbox-orange text-gruvbox-dark-fg0 resize-none transition-colors"
                      placeholder="Please describe your feedback in detail..."
                      required
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gruvbox-gray">
                        Be as detailed as possible to help us understand better
                      </p>
                      <p className="text-xs text-gruvbox-gray">
                        {formData.feedbackDescription.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                      Attachments (Optional)
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
                      className="w-full border-2 border-dashed border-gruvbox-gray/30 rounded-xl p-8 text-center hover:border-gruvbox-orange/50 hover:bg-gruvbox-orange/5 transition-all duration-200 group"
                    >
                      <IconUpload className="w-10 h-10 text-gruvbox-gray mx-auto mb-3 group-hover:text-gruvbox-orange transition-colors" />
                      <p className="text-gruvbox-dark-fg2 font-medium mb-1">
                        Click to upload screenshots
                      </p>
                      <p className="text-sm text-gruvbox-gray">
                        PNG, JPG up to 10MB each (max 5 images)
                      </p>
                    </button>

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
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-3 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-xl hover:bg-gruvbox-dark-bg3 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <IconSend className="w-5 h-5" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </SlideUp>

            {/* Sidebar - Tips - Fixed width */}
            <SlideUp delay={0.2}>
              <div className="bg-gradient-to-br from-gruvbox-orange/10 to-gruvbox-yellow/10 border border-gruvbox-orange/20 rounded-2xl p-6 sticky top-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gruvbox-orange flex items-center justify-center">
                    <IconSparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gruvbox-dark-fg0">Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-gruvbox-dark-fg2">
                  <li className="flex gap-2">
                    <span className="text-gruvbox-orange mt-0.5">•</span>
                    <span>Be specific about the issue or suggestion</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gruvbox-orange mt-0.5">•</span>
                    <span>Include screenshots when reporting bugs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gruvbox-orange mt-0.5">•</span>
                    <span>Describe the expected vs actual behavior</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gruvbox-orange mt-0.5">•</span>
                    <span>Mention your device/browser if relevant</span>
                  </li>
                </ul>
              </div>
            </SlideUp>
          </div>

          {/* Submitted Feedback Section */}
          <SlideUp delay={0.3}>
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gruvbox-dark-fg0 flex items-center gap-2">
                    <IconMessageCircle className="w-6 h-6 text-gruvbox-orange" />
                    Your Feedback History
                  </h2>
                  <p className="text-sm text-gruvbox-gray mt-1">
                    Track your previous submissions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchFeedbacks}
                  disabled={isLoadingFeedbacks}
                  className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl text-sm text-gruvbox-dark-fg0 hover:bg-gruvbox-dark-bg2 transition-colors disabled:opacity-50"
                >
                  <IconRefresh className={`w-4 h-4 ${isLoadingFeedbacks ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {feedbackListError && (
                <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl p-4 flex items-center gap-3 mb-4">
                  <IconAlertCircle className="w-5 h-5 text-gruvbox-red flex-shrink-0" />
                  <span className="text-sm text-gruvbox-red">{feedbackListError}</span>
                </div>
              )}

              {isLoadingFeedbacks ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gruvbox-dark-bg1 rounded-xl p-6 border border-gruvbox-dark-bg2 animate-pulse"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-6 bg-gruvbox-dark-bg2 rounded-full"></div>
                        <div className="w-24 h-4 bg-gruvbox-dark-bg2 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gruvbox-dark-bg2 rounded w-full"></div>
                        <div className="h-4 bg-gruvbox-dark-bg2 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-gruvbox-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconMessageCircle className="w-8 h-8 text-gruvbox-orange" />
                  </div>
                  <p className="text-gruvbox-gray">
                    You haven't submitted any feedback yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feedbacks.map((feedback) => {
                    const meta = FEEDBACK_TYPE_META[feedback.feedbackType];
                    const TypeIcon = FEEDBACK_TYPES.find(t => t.value === feedback.feedbackType)?.icon || IconMessageCircle;

                    return (
                      <div
                        key={feedback.id}
                        className="group bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-xl p-6 hover:border-gruvbox-orange/50 transition-all hover:shadow-xl"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${FEEDBACK_TYPES.find(t => t.value === feedback.feedbackType)?.color} flex items-center justify-center`}>
                              <TypeIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${meta.badgeClass}`}>
                              {meta.label}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gruvbox-dark-fg2 line-clamp-3 mb-4 leading-relaxed">
                          {truncateDescription(feedback.feedbackDescription, 150)}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gruvbox-dark-bg2">
                          <div className="flex items-center gap-3 text-xs text-gruvbox-gray">
                            <div className="flex items-center gap-1">
                              <IconCalendar size={12} />
                              <span>{formatDateTime(feedback.createdAt)}</span>
                            </div>
                            {feedback.feedbackImages.length > 0 && (
                              <div className="flex items-center gap-1">
                                <IconPaperclip size={12} />
                                <span>{feedback.feedbackImages.length}</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(feedback)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gruvbox-orange/10 text-gruvbox-orange rounded-lg text-xs font-medium hover:bg-gruvbox-orange/20 transition-colors"
                          >
                            <IconEye size={14} />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </SlideUp>
        </PageShell>

        {/* Detail Modal */}
        {isDetailOpen && selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleCloseDetail}
            />
            <div className="relative w-full max-w-3xl bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 p-2 hover:bg-gruvbox-dark-bg2 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5 text-gruvbox-gray" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {FEEDBACK_TYPES.map((type) => {
                    if (type.value === selectedFeedback.feedbackType) {
                      const Icon = type.icon;
                      return (
                        <div key={type.value} className={`w-12 h-12 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div>
                    <h3 className="text-2xl font-bold text-gruvbox-dark-fg0">
                      {FEEDBACK_TYPE_META[selectedFeedback.feedbackType].label}
                    </h3>
                    <p className="text-sm text-gruvbox-gray">
                      Submitted {formatDateTime(selectedFeedback.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="bg-gruvbox-dark-bg2 rounded-xl p-6 border border-gruvbox-dark-bg3">
                  <h4 className="text-sm font-semibold text-gruvbox-dark-fg0 mb-3">Description</h4>
                  <p className="text-gruvbox-dark-fg2 whitespace-pre-wrap leading-relaxed">
                    {selectedFeedback.feedbackDescription}
                  </p>
                </div>

                {selectedFeedback.feedbackImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gruvbox-dark-fg0 mb-3 flex items-center gap-2">
                      <IconPaperclip size={16} className="text-gruvbox-orange" />
                      Attachments ({selectedFeedback.feedbackImages.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFeedback.feedbackImages.map((imageUrl, index) => (
                        <Link
                          key={`${selectedFeedback.id}-image-${index}`}
                          href={imageUrl}
                          target="_blank"
                          className="relative w-full h-48 overflow-hidden rounded-xl border border-gruvbox-dark-bg3 bg-gruvbox-dark-bg2 group"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Attachment ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCloseDetail}
                    className="px-6 py-3 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-xl hover:bg-gruvbox-dark-bg3 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
