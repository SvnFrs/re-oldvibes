"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconSend,
  IconShare,
  IconFlag,
  IconArrowLeft,
  IconUser,
  IconCalendar,
  IconTag,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
  IconPhoto,
  IconLoader2,
  IconStar,
  IconStarFilled,
  IconDots,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconBan,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../_contexts/AuthContext";
import { getVibeById, likeVibe, unlikeVibe } from "../../_apis/common/vibes";
import {
  getCommentsWithRepliesByVibeId,
  createComment,
  type ModerationError,
  type TempBanError,
  likeComment,
  unlikeComment,
  deleteComment,
  updateComment,
} from "../../_apis/common/comments";
import Cookies from "js-cookie";
import {
  addVibeToWishlist,
  getVibeByIdWithWishlist,
  removeVibeFromWishlist,
} from "../../_apis/common/wishlist";
import {
  trackView,
  trackLike,
  trackWishlist,
  trackComment,
  trackShare,
} from "../../_apis/common/tracking";
import ContactSellerButton from "../../_components/chat/ContactSellerButton";
import { ModerationAlert } from "../../_components/moderation/ModerationAlert";
import { PageShell } from "../../_components/layout/PageShell";
import { FadeIn, SlideUp } from "../../_motion/MotionWrappers";
import { VibeUpdate } from "../components/vibe-update";
import { VibeDelete } from "../components/vibe-delete";

// Enhanced Media Carousel Component
function MediaCarousel({
  mediaFiles,
  itemName,
}: {
  mediaFiles: any[];
  itemName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="h-[500px] w-full bg-gruvbox-dark-bg2 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <IconPhoto size={64} className="text-gruvbox-gray mx-auto mb-4" />
          <span className="text-gruvbox-gray text-lg">No media available</span>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaFiles.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaFiles.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = mediaFiles[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-gruvbox-dark-bg2 shadow-xl">
        {currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-contain bg-black"
            poster={currentMedia.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={currentMedia.url}
            alt={`${itemName} - Media ${currentIndex + 1}`}
            fill
            className="object-contain"
          />
        )}

        {/* Navigation Arrows */}
        {mediaFiles.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all hover:scale-110 backdrop-blur-sm"
            >
              <IconChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all hover:scale-110 backdrop-blur-sm"
            >
              <IconChevronRight size={24} />
            </button>
          </>
        )}

        {/* Media Type Indicator */}
        {currentMedia.type === "video" && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2">
            <IconPlayerPlay size={18} />
            <span className="text-sm font-medium">Video</span>
          </div>
        )}

        {/* Counter */}
        {mediaFiles.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {currentIndex + 1} / {mediaFiles.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {mediaFiles.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {mediaFiles.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-24 w-full rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? "ring-3 ring-gruvbox-orange scale-105"
                  : "hover:opacity-80 hover:scale-105"
              }`}
            >
              {media.type === "video" ? (
                <div className="relative w-full h-full">
                  {media.thumbnail ? (
                    <Image
                      src={media.thumbnail}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gruvbox-dark-bg2 flex items-center justify-center">
                      <IconPlayerPlay size={20} className="text-gruvbox-gray" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <IconPlayerPlay size={20} className="text-white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={media.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Enhanced Comment Card Component
function CommentCard({
  comment,
  vibeUserId,
  userId,
  liked,
  likesCount,
  commentOwner,
  onLike,
  onUnlike,
  onUpdate,
  onDelete,
  onReply,
  isReplying,
}: {
  comment: any;
  vibeUserId: string;
  userId: string;
  liked: boolean;
  likesCount: number;
  commentOwner: string;
  onLike: () => void;
  onUnlike: () => void;
  onUpdate: (content: string) => Promise<void>;
  onDelete: () => void;
  onReply: () => void;
  isReplying: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleSaveUpdate = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdate(editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="group">
      <div className="flex gap-4 p-4 hover:bg-gruvbox-dark-bg2/50 rounded-xl transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">
            {comment.user?.name?.charAt(0) || "U"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gruvbox-dark-fg0">
                {comment.user?.name || "Unknown"}
              </span>
              <span className="text-xs text-gruvbox-gray">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>

            {userId === commentOwner && !isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-gruvbox-dark-bg1 rounded-lg transition-colors"
                >
                  <IconPencil size={14} className="text-gruvbox-blue" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-gruvbox-dark-bg1 rounded-lg transition-colors"
                >
                  <IconTrash size={14} className="text-gruvbox-red" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg text-gruvbox-dark-fg0 resize-none focus:ring-2 focus:ring-gruvbox-orange/50 focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveUpdate}
                  disabled={isUpdating || !editContent.trim()}
                  className="px-3 py-1.5 text-sm bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50 flex items-center gap-1"
                >
                  {isUpdating ? <IconLoader2 size={14} className="animate-spin" /> : <IconCheck size={14} />}
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setEditContent(comment.content);
                    setIsEditing(false);
                  }}
                  disabled={isUpdating}
                  className="px-3 py-1.5 text-sm text-gruvbox-gray hover:text-gruvbox-dark-fg0 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gruvbox-dark-fg2 leading-relaxed">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={liked ? onUnlike : onLike}
                className={`flex items-center gap-1.5 text-sm transition ${
                  liked
                    ? "text-gruvbox-red"
                    : "text-gruvbox-gray hover:text-gruvbox-red"
                }`}
              >
                <IconHeart
                  size={16}
                  fill={liked ? "currentColor" : "none"}
                />
                <span>{likesCount}</span>
              </button>

              {userId === vibeUserId && (
                <button
                  onClick={onReply}
                  className="text-sm text-gruvbox-gray hover:text-gruvbox-orange transition"
                >
                  {isReplying ? "Cancel Reply" : "Reply"}
                </button>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm text-gruvbox-blue hover:text-gruvbox-blue-light transition"
                >
                  {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          )}

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-6 space-y-3 border-l-2 border-gruvbox-dark-bg2 pl-4">
              {comment.replies.map((reply: any) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gruvbox-aqua to-gruvbox-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {reply.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gruvbox-dark-fg0">
                        {reply.user?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-gruvbox-gray">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gruvbox-dark-fg2">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VibeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isBanned } = useAuth();
  const [vibe, setVibe] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [moderationAlert, setModerationAlert] = useState<any>(null);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);
  const viewStartTime = useRef<number>(Date.now());

  const vibeId = params.id as string;
  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchVibeDetails = async () => {
      try {
        if (userId) {
          const response = await getVibeByIdWithWishlist(vibeId, userId);
          setIsLiked(response.vibe.isLiked || false);
          setLikesCount(response.vibe.likesCount || 0);
          setIsWishlist(response.vibe.isWishlist || false);
          setVibe(response.vibe);
        } else {
          const response = await getVibeById(vibeId);
          setIsLiked(response.vibe.isLiked || false);
          setLikesCount(response.vibe.likesCount || 0);
          setIsWishlist(false);
          setVibe(response.vibe);
        }
      } catch (error) {
        console.error("Error fetching vibe:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await getCommentsWithRepliesByVibeId(vibeId);
        setComments(response.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (vibeId) {
      fetchVibeDetails();
      fetchComments();

      // Track view interaction
      if (isAuthenticated) {
        viewStartTime.current = Date.now();
        trackView(vibeId).catch((err) => console.warn("View tracking failed:", err));
      }
    }

    // Track view duration on unmount
    return () => {
      if (isAuthenticated && vibeId) {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        if (duration > 0) {
          trackView(vibeId, duration).catch((err) => console.warn("View duration tracking failed:", err));
        }
      }
    };
  }, [vibeId, userId, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isBanned) {
      setModerationAlert({
        type: "error",
        message: "You are temporarily banned from interacting with content.",
        reason: user?.tempBanReason || "Violation of community guidelines",
      });
      return;
    }

    try {
      if (isLiked) {
        await unlikeVibe(vibeId);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeVibe(vibeId);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        // Track like interaction
        trackLike(vibeId).catch((err) => console.warn("Like tracking failed:", err));
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isBanned) {
      setModerationAlert({
        type: "error",
        message: "You are temporarily banned from interacting with content.",
        reason: user?.tempBanReason || "Violation of community guidelines",
      });
      return;
    }

    if (!userId) return;

    try {
      if (isWishlist) {
        await removeVibeFromWishlist(vibeId, userId);
        setIsWishlist(false);
      } else {
        await addVibeToWishlist(vibeId, userId);
        setIsWishlist(true);
        // Track wishlist interaction
        trackWishlist(vibeId).catch((err) => console.warn("Wishlist tracking failed:", err));
      }
    } catch (error) {
      console.error("Error handling wishlist:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isBanned) {
      setModerationAlert({
        type: "error",
        message: "You are temporarily banned from commenting.",
        reason: user?.tempBanReason || "Violation of community guidelines",
      });
      return;
    }

    if (!newComment.trim()) return;

    setModerationAlert(null);
    setCommentLoading(true);

    try {
      await createComment(vibeId, newComment.trim());
      const updatedCommentsResponse = await getCommentsWithRepliesByVibeId(vibeId);
      setComments(updatedCommentsResponse.comments || []);
      setNewComment("");
      // Track comment interaction
      trackComment(vibeId).catch((err) => console.warn("Comment tracking failed:", err));
    } catch (error: any) {
      if (error.moderationError) {
        setModerationAlert({
          type: "warning",
          message: error.moderationError.message,
          reason: error.moderationError.reason,
        });
      }
    } finally {
      setCommentLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-gruvbox-green/10 text-gruvbox-green border-gruvbox-green/30";
      case "like-new":
        return "bg-gruvbox-blue/10 text-gruvbox-blue border-gruvbox-blue/30";
      case "good":
        return "bg-gruvbox-yellow/10 text-gruvbox-yellow border-gruvbox-yellow/30";
      case "fair":
        return "bg-gruvbox-orange/10 text-gruvbox-orange border-gruvbox-orange/30";
      case "poor":
        return "bg-gruvbox-red/10 text-gruvbox-red border-gruvbox-red/30";
      default:
        return "bg-gruvbox-gray/10 text-gruvbox-gray border-gruvbox-gray/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
        <PageShell width="xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gruvbox-dark-bg1 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[500px] bg-gruvbox-dark-bg1 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-10 bg-gruvbox-dark-bg1 rounded w-3/4"></div>
                <div className="h-6 bg-gruvbox-dark-bg1 rounded w-1/2"></div>
                <div className="h-32 bg-gruvbox-dark-bg1 rounded"></div>
                <div className="h-20 bg-gruvbox-dark-bg1 rounded"></div>
              </div>
            </div>
          </div>
        </PageShell>
      </div>
    );
  }

  if (!vibe) {
    return (
      <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
        <PageShell width="md">
          <div className="text-center py-16">
            <IconAlertCircle className="w-16 h-16 text-gruvbox-red mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-2">
              Vibe Not Found
            </h1>
            <p className="text-gruvbox-gray mb-6">
              The vibe you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition"
            >
              <IconArrowLeft size={20} />
              Back to Marketplace
            </Link>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gruvbox-dark-bg0">
      {/* Breadcrumb Bar */}
      <div className="bg-gruvbox-dark-bg1 border-b border-gruvbox-dark-bg2 sticky top-0 z-10 backdrop-blur-md bg-gruvbox-dark-bg1/80">
        <PageShell width="xl">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gruvbox-gray hover:text-gruvbox-orange transition"
            >
              <IconArrowLeft size={20} />
              <span className="font-medium">Back to Marketplace</span>
            </Link>

            {userId === vibe.userId && (
              <div className="flex items-center gap-2">
                <VibeUpdate data={vibe} />
                <VibeDelete data={vibe} />
              </div>
            )}
          </div>
        </PageShell>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <PageShell width="xl">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Media Gallery */}
              <div>
                <MediaCarousel
                  mediaFiles={vibe.mediaFiles || []}
                  itemName={vibe.itemName}
                />
              </div>

              {/* Vibe Details */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gruvbox-dark-fg0 leading-tight flex-1">
                      {vibe.itemName}
                    </h1>

                    <button
                      onClick={handleWishlist}
                      disabled={isBanned}
                      className={`ml-4 p-3 hover:bg-gruvbox-dark-bg1 rounded-full transition ${
                        isBanned ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title={isBanned ? "You are temporarily banned" : "Add to wishlist"}
                    >
                      {isWishlist ? (
                        <IconStarFilled size={28} className="text-gruvbox-yellow" />
                      ) : (
                        <IconStar size={28} className="text-gruvbox-gray hover:text-gruvbox-yellow" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-3xl font-bold bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow bg-clip-text text-transparent">
                      {formatPrice(vibe.price)}
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getConditionColor(
                        vibe.condition
                      )}`}
                    >
                      {vibe.condition}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gruvbox-dark-bg1 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gruvbox-dark-fg0 mb-3 flex items-center gap-2">
                    <IconMessageCircle size={20} className="text-gruvbox-orange" />
                    Description
                  </h3>
                  <p className="text-gruvbox-dark-fg2 leading-relaxed">
                    {vibe.description}
                  </p>
                </div>

                {/* Tags */}
                {vibe.tags && vibe.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gruvbox-gray mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {vibe.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gruvbox-dark-bg1 text-gruvbox-dark-fg2 rounded-full text-sm hover:bg-gruvbox-dark-bg2 transition"
                        >
                          <IconTag size={14} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Info */}
                <div className="bg-gradient-to-br from-gruvbox-orange/10 to-gruvbox-yellow/10 border border-gruvbox-orange/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gruvbox-dark-fg0 mb-4">
                    Seller Information
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {vibe.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gruvbox-dark-fg0 text-lg">
                          {vibe.user?.name || "Unknown"}
                        </span>
                        {vibe.user?.isVerified && (
                          <IconCheck size={18} className="text-gruvbox-green" />
                        )}
                      </div>
                      <span className="text-sm text-gruvbox-gray">
                        @{vibe.user?.username}
                      </span>
                    </div>
                  </div>

                  <ContactSellerButton
                    vibeId={vibe.id}
                    sellerId={vibe.user?.id}
                    className="w-full"
                  />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {vibe.location && (
                    <div className="flex items-center gap-2 text-gruvbox-gray bg-gruvbox-dark-bg1 p-3 rounded-lg">
                      <IconMapPin size={18} className="text-gruvbox-aqua" />
                      <span className="text-sm">{vibe.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gruvbox-gray bg-gruvbox-dark-bg1 p-3 rounded-lg">
                    <IconCalendar size={18} className="text-gruvbox-blue" />
                    <span className="text-sm">
                      {new Date(vibe.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gruvbox-gray bg-gruvbox-dark-bg1 p-3 rounded-lg">
                    <IconEye size={18} className="text-gruvbox-green" />
                    <span className="text-sm">{vibe.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-gruvbox-gray bg-gruvbox-dark-bg1 p-3 rounded-lg">
                    <IconMessageCircle size={18} className="text-gruvbox-purple" />
                    <span className="text-sm">{comments.length} comments</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleLike}
                    disabled={isBanned}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
                      isLiked
                        ? "bg-gruvbox-red/10 text-gruvbox-red border border-gruvbox-red/30"
                        : "bg-gruvbox-dark-bg1 text-gruvbox-gray hover:bg-gruvbox-dark-bg2"
                    } ${isBanned ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isBanned ? "You are temporarily banned" : isLiked ? "Unlike" : "Like"}
                  >
                    <IconHeart size={20} fill={isLiked ? "currentColor" : "none"} />
                    {likesCount}
                  </button>

                  <button
                    onClick={() => {
                      window.open(
                        `https://www.facebook.com/share.php?u=${window.location.href}`,
                        "_blank"
                      );
                      // Track share interaction
                      if (isAuthenticated) {
                        trackShare(vibeId).catch((err) => console.warn("Share tracking failed:", err));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gruvbox-dark-bg1 text-gruvbox-gray hover:bg-gruvbox-dark-bg2 rounded-xl font-medium transition"
                  >
                    <IconShare size={20} />
                    Share
                  </button>

                  {userId !== vibe.userId && (
                    <Link
                      href={`/report?vibeId=${vibe.id}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gruvbox-dark-bg1 text-gruvbox-gray hover:bg-gruvbox-dark-bg2 rounded-xl font-medium transition"
                    >
                      <IconFlag size={20} />
                      Report
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Comments Section */}
          <SlideUp delay={0.2}>
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gruvbox-dark-fg0 flex items-center gap-3">
                  <IconMessageCircle className="text-gruvbox-orange" />
                  Comments
                  <span className="text-gruvbox-gray">({comments.length})</span>
                </h2>
              </div>

              {/* Moderation Alert */}
              {moderationAlert && (
                <ModerationAlert
                  {...moderationAlert}
                  onClose={() => setModerationAlert(null)}
                />
              )}

              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleComment} className="mb-8">
                  {isBanned && (
                    <div className="mb-4 p-4 bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl flex items-start gap-3">
                      <IconBan size={20} className="text-gruvbox-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gruvbox-red font-medium">You are temporarily banned</p>
                        <p className="text-gruvbox-dark-fg2 text-sm mt-1">
                          {user?.tempBanReason || "Violation of community guidelines"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isBanned ? "You are banned from commenting" : "Share your thoughts..."}
                        disabled={isBanned}
                        className={`w-full p-4 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-xl text-gruvbox-dark-fg0 resize-none focus:ring-2 focus:ring-gruvbox-orange/50 focus:border-transparent ${
                          isBanned ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        rows={3}
                        required
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          disabled={commentLoading || !newComment.trim() || isBanned}
                          className="flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {commentLoading ? (
                            <>
                              <IconLoader2 size={18} className="animate-spin" />
                              <span>Posting...</span>
                            </>
                          ) : (
                            <>
                              <IconSend size={18} />
                              <span>Post Comment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 bg-gruvbox-dark-bg1 rounded-xl text-center border border-gruvbox-gray/20">
                  <p className="text-gruvbox-gray mb-4">
                    Please login to leave a comment
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition"
                  >
                    Login to Comment
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-2 bg-gruvbox-dark-bg1 rounded-xl border border-gruvbox-dark-bg2">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      vibeUserId={vibe.userId}
                      userId={userId || ""}
                      liked={
                        comment.likes?.some(
                          (like: any) => String(like) === String(userId)
                        ) || false
                      }
                      likesCount={comment.likes?.length || 0}
                      commentOwner={comment.user.id}
                      onLike={() => likeComment(comment.id, userId || "")}
                      onUnlike={() => unlikeComment(comment.id, userId || "")}
                      onUpdate={async (content) =>
                        await updateComment(comment.id, userId || "", content)
                      }
                      onDelete={() => deleteComment(comment.id, userId || "")}
                      onReply={() =>
                        setReplyingToComment(
                          replyingToComment === comment.id ? null : comment.id
                        )
                      }
                      isReplying={replyingToComment === comment.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <IconMessageCircle
                      size={64}
                      className="text-gruvbox-gray mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
                      No comments yet
                    </h3>
                    <p className="text-gruvbox-gray">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SlideUp>
        </PageShell>
      </div>
    </div>
  );
}