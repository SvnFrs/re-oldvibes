"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconBan,
  IconMail,
  IconBug,
  IconQuestionMark,
  IconSend,
  IconClock,
  IconCheck,
  IconX,
  IconEye,
} from "@tabler/icons-react";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import { createAppeal, getMyAppeals, Appeal } from "../api/appeals";

const appealTypes = [
  {
    value: "ban_appeal",
    label: "Ban Appeal",
    icon: IconBan,
    description: "Appeal a temporary or permanent ban",
    color: "text-gruvbox-red-light dark:text-gruvbox-red-dark",
  },
  {
    value: "general_inquiry",
    label: "General Inquiry",
    icon: IconMail,
    description: "Ask a question or get help",
    color: "text-gruvbox-blue-light dark:text-gruvbox-blue-dark",
  },
  {
    value: "bug_report",
    label: "Bug Report",
    icon: IconBug,
    description: "Report a technical issue",
    color: "text-gruvbox-orange",
  },
  {
    value: "other",
    label: "Other",
    icon: IconQuestionMark,
    description: "Something else",
    color: "text-gruvbox-gray",
  },
];

const statusColors = {
  pending: "bg-gruvbox-yellow-light/10 text-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark/10 dark:text-gruvbox-yellow-dark",
  reviewed: "bg-gruvbox-blue-light/10 text-gruvbox-blue-light dark:bg-gruvbox-blue-dark/10 dark:text-gruvbox-blue-dark",
  resolved: "bg-gruvbox-green-light/10 text-gruvbox-green-light dark:bg-gruvbox-green-dark/10 dark:text-gruvbox-green-dark",
  rejected: "bg-gruvbox-red-light/10 text-gruvbox-red-light dark:bg-gruvbox-red-dark/10 dark:text-gruvbox-red-dark",
};

const statusIcons = {
  pending: IconClock,
  reviewed: IconEye,
  resolved: IconCheck,
  rejected: IconX,
};

export default function ContactAdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [myAppeals, setMyAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      fetchMyAppeals();
      // Pre-select ban appeal if user is banned
      if (user.isTempBanned) {
        setType("ban_appeal");
      }
    }
  }, [user, isAuthenticated, authLoading, router]);

  const fetchMyAppeals = async () => {
    try {
      const data = await getMyAppeals();
      setMyAppeals(data.appeals);
    } catch (err) {
      console.error("Error fetching appeals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!type || !subject || !message) {
      setError("Please fill in all fields");
      return;
    }

    if (subject.length < 5) {
      setError("Subject must be at least 5 characters");
      return;
    }

    if (message.length < 20) {
      setError("Message must be at least 20 characters");
      return;
    }

    setSubmitting(true);

    try {
      await createAppeal({
        type: type as any,
        subject,
        message,
        relatedBanId: user?.isTempBanned ? user.id : undefined,
      });

      setSuccess(true);
      setType("");
      setSubject("");
      setMessage("");
      
      // Refresh appeals list
      await fetchMyAppeals();

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit appeal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Wrapper>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg mb-4"></div>
            <div className="h-64 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg"></div>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Wrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
            Contact Admin
          </h1>
          <p className="text-gruvbox-gray">
            Submit an appeal, report a bug, or send us a message
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10 border-2 border-gruvbox-green-light dark:border-gruvbox-green-dark rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <IconCheck className="text-gruvbox-green-light dark:text-gruvbox-green-dark flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-gruvbox-green-light dark:text-gruvbox-green-dark mb-1">
                  Appeal Submitted Successfully!
                </h3>
                <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                  Your message has been sent to the admin team. We'll review it and get back to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border-2 border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <IconX className="text-gruvbox-red-light dark:text-gruvbox-red-dark flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-gruvbox-red-light dark:text-gruvbox-red-dark mb-1">
                  Error
                </h3>
                <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ban Status Alert */}
        {user.isTempBanned && (
          <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border-2 border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <IconBan className="text-gruvbox-red-light dark:text-gruvbox-red-dark flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-gruvbox-red-light dark:text-gruvbox-red-dark mb-1">
                  Your Account is Temporarily Banned
                </h3>
                <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-2">
                  Reason: {user.tempBanReason || "Violation of community guidelines"}
                </p>
                <p className="text-xs text-gruvbox-gray">
                  Violations: {user.badBehaviorCount}/3 • Banned: {user.tempBanAt ? new Date(user.tempBanAt).toLocaleString() : "Recently"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl shadow-lg border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 p-6 mb-8">
          <h2 className="text-xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-6">
            New Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-3">
                Message Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {appealTypes.map((appealType) => {
                  const Icon = appealType.icon;
                  return (
                    <button
                      key={appealType.value}
                      type="button"
                      onClick={() => setType(appealType.value)}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                        type === appealType.value
                          ? "border-gruvbox-orange bg-gruvbox-orange/10"
                          : "border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50"
                      }`}
                    >
                      <Icon className={`${appealType.color} flex-shrink-0 mt-0.5`} size={24} />
                      <div className="flex-1">
                        <div className="font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-1">
                          {appealType.label}
                        </div>
                        <div className="text-xs text-gruvbox-gray">
                          {appealType.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                Subject * (5-200 characters)
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your message"
                maxLength={200}
                className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
              />
              <div className="text-xs text-gruvbox-gray mt-1">
                {subject.length}/200 characters
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                Message * (20-2000 characters)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details about your appeal, question, or report..."
                rows={8}
                maxLength={2000}
                className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange resize-none"
              />
              <div className="text-xs text-gruvbox-gray mt-1">
                {message.length}/2000 characters
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !type || !subject || !message}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg font-medium hover:bg-gruvbox-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <IconSend size={20} />
                  Submit Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* My Appeals History */}
        <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl shadow-lg border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 p-6">
          <h2 className="text-xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
            My Submissions ({myAppeals.length})
          </h2>

          {myAppeals.length === 0 ? (
            <p className="text-gruvbox-gray text-center py-8">
              No submissions yet. Submit your first message above.
            </p>
          ) : (
            <div className="space-y-4">
              {myAppeals.map((appeal) => {
                const StatusIcon = statusIcons[appeal.status];
                return (
                  <div
                    key={appeal._id}
                    className="border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg p-4 hover:border-gruvbox-orange/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-1">
                          {appeal.subject}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gruvbox-gray">
                          <span className="capitalize">{appeal.type.replace("_", " ")}</span>
                          <span>•</span>
                          <span>{new Date(appeal.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[appeal.status]}`}>
                        <StatusIcon size={14} />
                        {appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 line-clamp-2 mb-3">
                      {appeal.message}
                    </p>

                    {appeal.adminResponse && (
                      <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg p-3 mt-3">
                        <div className="text-xs font-medium text-gruvbox-gray mb-1">
                          Admin Response:
                        </div>
                        <p className="text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                          {appeal.adminResponse}
                        </p>
                        {appeal.reviewedAt && (
                          <div className="text-xs text-gruvbox-gray mt-2">
                            Reviewed {new Date(appeal.reviewedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
