"use client";

import { useState, useEffect } from "react";
import {
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconClock,
  IconSend,
  IconShare,
  IconFlag,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import { getVibes } from "../_apis/common/vibes";

// Comment Component
function CommentCard({ comment }: { comment: any }) {
  return (
    <div className="flex gap-3 p-3">
      <div className="w-8 h-8 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
          {comment.user?.name?.charAt(0) || "U"}
        </span>
      </div>
      <div className="flex-1">
        <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg2 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
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

// Vibe Card Component for Feed
function FeedVibeCard({ vibe }: { vibe: any }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(vibe.isLiked || false);
  const [likesCount, setLikesCount] = useState(vibe.likesCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/vibes/${vibe.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount((prev: number) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          vibeId: vibe.id,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments((prev) => [...prev, newCommentData.comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?vibeId=${vibe.id}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, vibe.id]);

  return (
    <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg1 rounded-xl shadow-md overflow-hidden border border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2">
      {/* Header */}
      <div className="p-4 border-b border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
            <span className="text-sm font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
              {vibe.user?.name?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
              {vibe.user?.name || "Unknown User"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gruvbox-gray">
              <span>{vibe.category}</span>
              <span>•</span>
              <span className={getConditionColor(vibe.condition)}>
                {vibe.condition}
              </span>
              {vibe.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <IconMapPin size={12} />
                    <span>{vibe.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gruvbox-orange">
              {formatPrice(vibe.price)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gruvbox-gray">
              <IconClock size={12} />
              <span>{new Date(vibe.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
          {vibe.itemName}
        </h2>
        <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-4">
          {vibe.description}
        </p>

        {/* Media */}
        {vibe.mediaFiles && vibe.mediaFiles.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vibe.mediaFiles.slice(0, 4).map((media: any, index: number) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={media.url}
                    alt={`${vibe.itemName} - ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {vibe.tags && vibe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {vibe.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-gruvbox-gray mb-4">
          <div className="flex items-center gap-1">
            <IconEye size={16} />
            <span className="text-sm">{vibe.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <IconMessageCircle size={16} />
            <span className="text-sm">{vibe.commentsCount} comments</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2 pt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isLiked
                ? "text-gruvbox-red bg-gruvbox-red/10"
                : "text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2"
            }`}
          >
            <IconHeart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="font-medium">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 transition"
          >
            <IconMessageCircle size={20} />
            <span className="font-medium">Comment</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 transition">
            <IconShare size={20} />
            <span className="font-medium">Share</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 transition ml-auto">
            <IconFlag size={20} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2 pt-4">
            {/* Comment Form */}
            {user && (
              <form onSubmit={handleSubmitComment} className="mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                      {user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 placeholder-gruvbox-gray focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                      disabled={submittingComment}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="px-4 py-2 bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IconSend size={16} />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-2">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
              {comments.length === 0 && (
                <p className="text-center text-gruvbox-gray py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Feed Component
export default function FeedPage() {
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const response = await getVibes();
        setVibes(response.data || []);
      } catch (error) {
        console.error("Error fetching vibes:", error);
        setVibes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();
  }, []);

  return (
    <Wrapper>
      <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg2 border-b border-gruvbox-gray sticky top-0 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
              Community Feed
            </h1>
            <p className="text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3">
              Discover and interact with the latest vibes from our community
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg1 rounded-xl p-6 animate-pulse border border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-2/3 mb-4"></div>
                  <div className="h-48 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {vibes.map((vibe: any) => (
                <FeedVibeCard key={vibe.id} vibe={vibe} />
              ))}
              {vibes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gruvbox-gray text-lg">
                    No vibes available at the moment.
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-4 px-6 py-3 bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
