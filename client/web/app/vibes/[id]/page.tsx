"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconClock,
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
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "../../_sections/wrapper";
import { useAuth } from "../../_contexts/AuthContext";
import { getVibeById } from "../../_apis/common/vibes";
import {
  getCommentsByVibeId,
  createComment,
} from "../../_apis/common/comments";
import { Star } from "lucide-react";
import Cookies from "js-cookie";
import {
  addVibeToWishlist,
  getVibeByIdWithWishlist,
  removeVibeFromWishlist,
} from "../../_apis/common/wishlist";

// Media Carousel Component
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
      <div className="h-96 w-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <IconPhoto size={48} className="text-gruvbox-gray mx-auto mb-2" />
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
      <div className="relative h-96 w-full rounded-xl overflow-hidden bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg2">
        {currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-cover"
            poster={currentMedia.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={currentMedia.url}
            alt={`${itemName} - Media ${currentIndex + 1}`}
            fill
            className="object-cover"
          />
        )}

        {/* Navigation Arrows */}
        {mediaFiles.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
            >
              <IconChevronRight size={20} />
            </button>
          </>
        )}

        {/* Media Type Indicator */}
        {currentMedia.type === "video" && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-full flex items-center gap-1">
            <IconPlayerPlay size={16} />
            <span className="text-xs">Video</span>
          </div>
        )}

        {/* Counter */}
        {mediaFiles.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
            {currentIndex + 1} / {mediaFiles.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {mediaFiles.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {mediaFiles.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-20 w-full rounded-lg overflow-hidden transition ${
                index === currentIndex
                  ? "ring-2 ring-gruvbox-orange"
                  : "hover:opacity-80"
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
                    <div className="w-full h-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
                      <IconPlayerPlay size={16} className="text-gruvbox-gray" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <IconPlayerPlay size={16} className="text-white" />
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

// Comment Component
function CommentCard({ comment }: { comment: any }) {
  return (
    <div className="flex gap-3 p-4">
      <div className="w-10 h-10 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
          {comment.user?.name?.charAt(0) || "U"}
        </span>
      </div>
      <div className="flex-1">
        <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
              {comment.user?.name || "Unknown"}
            </span>
            <span className="text-xs text-gruvbox-gray">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VibeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [vibe, setVibe] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false); // Thêm state cho wishlist

  const vibeId = params.id as string;
  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchVibeDetails = async () => {
      try {
        if (userId) {
          const response = await getVibeByIdWithWishlist(vibeId, userId);
          setIsLiked(response.vibe.isLiked || false);
          setLikesCount(response.vibe.likesCount || 0);
          setIsWishlist(response.vibe.isWishlist || false); // Set wishlist state
          setVibe(response.vibe);
        } else {
          const response = await getVibeById(vibeId);
          setIsLiked(response.vibe.isLiked || false);
          setLikesCount(response.vibe.likesCount || 0);
          setIsWishlist(false); // Default to false for non-authenticated users
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
        const response = await getCommentsByVibeId(vibeId);
        setComments(response.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (vibeId) {
      fetchVibeDetails();
      fetchComments();
    }
  }, [vibeId, userId]); // Thêm userId vào dependency

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Show login prompt
      router.push("/auth/login");
      return;
    }

    try {
      // TODO: Implement like/unlike API call
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking vibe:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await createComment(vibeId, newComment.trim());
      setComments((prev) => [response.comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
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
        return "text-gruvbox-green-light dark:text-gruvbox-green-dark bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10";
      case "like-new":
        return "text-gruvbox-blue-light dark:text-gruvbox-blue-dark bg-gruvbox-blue-light/10 dark:bg-gruvbox-blue-dark/10";
      case "good":
        return "text-gruvbox-yellow-light dark:text-gruvbox-yellow-dark bg-gruvbox-yellow-light/10 dark:bg-gruvbox-yellow-dark/10";
      case "fair":
        return "text-gruvbox-orange-light dark:text-gruvbox-orange-dark bg-gruvbox-orange-light/10 dark:bg-gruvbox-orange-dark/10";
      case "poor":
        return "text-gruvbox-red-light dark:text-gruvbox-red-dark bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10";
      default:
        return "text-gruvbox-gray bg-gruvbox-gray/10";
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      if (isWishlist) {
        // Nếu đã có trong wishlist, xóa khỏi wishlist
        await removeVibeFromWishlist(vibeId, userId);
        setIsWishlist(false);
        console.log("Removed from wishlist");
      } else {
        // Nếu chưa có trong wishlist, thêm vào wishlist
        await addVibeToWishlist(vibeId, userId);
        setIsWishlist(true);
        console.log("Added to wishlist");
      }
    } catch (error) {
      console.error("Error handling wishlist:", error);
      // Có thể thêm toast notification để thông báo lỗi
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-3/4"></div>
                <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-1/2"></div>
                <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-full"></div>
                <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  // if (!vibe) {
  //   return (
  //     <Wrapper>
  //       <div className="max-w-4xl mx-auto px-4 py-8 text-center">
  //         <h1 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
  //           Vibe Not Found
  //         </h1>
  //         <p className="text-gruvbox-gray mb-6">
  //           The vibe you're looking for doesn't exist or has been removed.
  //         </p>
  //         <Link
  //           href="/"
  //           className="inline-block px-6 py-3 bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition"
  //         >
  //           Back to Marketplace
  //         </Link>
  //       </div>
  //     </Wrapper>
  //   );
  // }

  return (
    <Wrapper>
      <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg2 border-b border-gruvbox-gray sticky top-0 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gruvbox-gray hover:text-gruvbox-orange transition mb-4 md:mb-6"
          >
            <IconArrowLeft size={20} />
            Back to Marketplace
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Media Gallery */}
            <MediaCarousel
              mediaFiles={vibe.mediaFiles || []}
              itemName={vibe.itemName}
            />

            {/* Vibe Details */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start justify-between">
                {/* Header */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    {vibe.itemName}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-gruvbox-orange">
                      {formatPrice(vibe.price)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(
                        vibe.condition
                      )}`}
                    >
                      {vibe.condition}
                    </span>
                  </div>
                </div>

                {/* Wishlist Star Icon */}
                <div className="cursor-pointer" onClick={handleWishlist}>
                  <Star
                    size={32}
                    fill={isWishlist ? "#ffd700" : "none"}
                    stroke={isWishlist ? "#ffd700" : "#6b7280"}
                    className="hover:scale-110 transition-transform"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Description
                </h3>
                <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 leading-relaxed">
                  {vibe.description}
                </p>
              </div>

              {/* Tags */}
              {vibe.tags && vibe.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vibe.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 rounded-full text-sm"
                      >
                        <IconTag size={14} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-3">
                  Seller Information
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
                    <span className="text-lg font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                      {vibe.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                        {vibe.user?.name || "Unknown"}
                      </span>
                      {vibe.user?.isVerified && (
                        <IconUser size={16} className="text-gruvbox-green" />
                      )}
                    </div>
                    <span className="text-sm text-gruvbox-gray">
                      @{vibe.user?.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-2 gap-4">
                {vibe.location && (
                  <div className="flex items-center gap-2 text-gruvbox-gray">
                    <IconMapPin size={16} />
                    <span className="text-sm">{vibe.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gruvbox-gray">
                  <IconCalendar size={16} />
                  <span className="text-sm">
                    {new Date(vibe.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-gruvbox-gray">
                <div className="flex items-center gap-1">
                  <IconEye size={16} />
                  <span className="text-sm">{vibe.views || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconMessageCircle size={16} />
                  <span className="text-sm">{comments.length} comments</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                    isLiked
                      ? "text-gruvbox-red bg-gruvbox-red/10"
                      : "text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2"
                  }`}
                >
                  <IconHeart
                    size={20}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                  {likesCount} Likes
                </button>

                <button className="flex items-center gap-2 px-6 py-3 text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 rounded-lg font-medium transition">
                  <IconShare size={20} />
                  Share
                </button>

                <button className="flex items-center gap-2 px-6 py-3 text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 rounded-lg font-medium transition">
                  <IconFlag size={20} />
                  Report
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12 max-w-4xl">
            <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="mb-8">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg resize-none focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                      rows={3}
                      required
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50"
                      >
                        <IconSend size={16} />
                        {commentLoading ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg text-center">
                <p className="text-gruvbox-gray mb-3">
                  Please login to leave a comment
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-2 bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <IconMessageCircle
                    size={48}
                    className="text-gruvbox-gray mx-auto mb-4"
                  />
                  <p className="text-gruvbox-gray text-lg mb-4">
                    No comments yet
                  </p>
                  <p className="text-gruvbox-gray">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
