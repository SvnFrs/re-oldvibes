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
import Wrapper from "../_sections/wrapper"; // legacy wrapper retained for gradual migration
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import { Card, CardContent } from "../_components/ui/card";
import { FadeIn } from "../_motion/MotionWrappers";
import { useAuth } from "../_contexts/AuthContext";
import { getVibes } from "../_apis/common/vibes";
import Cookies from "js-cookie";
import {
  getCommentsWithRepliesByVibeId,
  createComment,
  likeComment,
  unlikeComment,
  deleteComment,
  updateComment,
} from "../_apis/common/comments";

// Comment Component
function CommentCard({
  comment,
  vibeUserId,
  userId,
  liked,
  likesCount,
  onLike,
  onUnlike,
  onDelete,
  onUpdate,
  replyingToComment,
  setReplyingToComment,
  onReplySubmit,
}: {
  comment: any;
  vibeUserId: string;
  userId: string | undefined;
  liked: boolean;
  likesCount: number;
  onLike: (commentId: string) => void;
  onUnlike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  replyingToComment: string | null;
  setReplyingToComment: (id: string | null) => void;
  onReplySubmit: (parentCommentId: string, content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [localEditingReply, setLocalEditingReply] = useState<string | null>(
    null
  );
  const [replyEditContent, setReplyEditContent] = useState("");

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4">
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
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg resize-none focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditContent(comment.content);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 text-xs text-gruvbox-gray hover:text-gruvbox-light-fg0 dark:hover:text-gruvbox-dark-fg0 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!editContent.trim()) return;
                    onUpdate(comment.id, editContent.trim());
                    setIsEditing(false);
                  }}
                  disabled={!editContent.trim()}
                  className="px-3 py-1 text-xs bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded hover:bg-gruvbox-yellow transition disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
              {comment.content}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 w-full">
          {comment.replies.length <= 0 ? (
            userId === vibeUserId && (
              <button
                className="text-gruvbox-orange text-xs cursor-pointer"
                onClick={() =>
                  setReplyingToComment(
                    replyingToComment === comment.id ? null : comment.id
                  )
                }
              >
                {replyingToComment === comment.id ? "Cancel Reply" : "Reply"}
              </button>
            )
          ) : (
            <></>
          )}
          {liked ? (
            <button
              className="text-gruvbox-orange text-xs cursor-pointer"
              onClick={() => onUnlike(comment.id)}
            >
              Unlike ({likesCount})
            </button>
          ) : (
            <button
              className="text-gruvbox-orange text-xs cursor-pointer"
              onClick={() => onLike(comment.id)}
            >
              Like ({likesCount})
            </button>
          )}
        </div>
        {userId === comment.user?.id && !isEditing && (
          <div className="flex flex-row gap-4 ">
            <div
              className="text-xs text-blue-500 font-medium cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              Update
            </div>
            <div
              className="text-xs text-red-500 font-medium cursor-pointer"
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </div>
          </div>
        )}
      </div>

      {/* Replies Section */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 mt-3">
          <button
            onClick={() => toggleReplies(comment.id)}
            className="text-gruvbox-blue text-xs cursor-pointer hover:text-gruvbox-blue-light dark:hover:text-gruvbox-blue-dark mb-2"
          >
            {expandedReplies.has(comment.id) ? "Hide" : "Show"}{" "}
            {comment.replies.length}{" "}
            {comment.replies.length === 1 ? "reply" : "replies"}
          </button>

          {expandedReplies.has(comment.id) && (
            <div className="space-y-3">
              {comment.replies.map((reply: any) => {
                const checkLikedReply =
                  reply.likes &&
                  reply.likes.some(
                    (like: any) => String(like) === String(userId)
                  );

                return (
                  <div key={reply.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                        {reply.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg2 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                            {reply.user?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gruvbox-gray">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {localEditingReply === reply.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyEditContent}
                              onChange={(e) =>
                                setReplyEditContent(e.target.value)
                              }
                              className="w-full p-2 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded text-xs resize-none focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setLocalEditingReply(null);
                                  setReplyEditContent("");
                                }}
                                className="px-2 py-1 text-xs text-gruvbox-gray hover:text-gruvbox-light-fg0 dark:hover:text-gruvbox-dark-fg0 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (!replyEditContent.trim() || !userId)
                                    return;
                                  onUpdate(reply.id, replyEditContent.trim());
                                  setLocalEditingReply(null);
                                  setReplyEditContent("");
                                }}
                                disabled={!replyEditContent.trim()}
                                className="px-2 py-1 text-xs bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded hover:bg-gruvbox-yellow transition disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                            {reply.content}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row justify-between gap-3 mt-1">
                        {checkLikedReply ? (
                          <button
                            className="text-gruvbox-orange text-xs cursor-pointer"
                            onClick={() => onUnlike(reply.id)}
                          >
                            Unlike ({reply.likes?.length || 0})
                          </button>
                        ) : (
                          <button
                            className="text-gruvbox-orange text-xs cursor-pointer"
                            onClick={() => onLike(reply.id)}
                          >
                            Like ({reply.likes?.length || 0})
                          </button>
                        )}
                        {userId === reply.user.id && !localEditingReply && (
                          <div className="flex gap-3">
                            <div
                              className="text-xs text-blue-500 font-medium cursor-pointer"
                              onClick={() => {
                                setLocalEditingReply(reply.id);
                                setReplyEditContent(reply.content);
                              }}
                            >
                              Update
                            </div>
                            <div
                              className="text-xs text-red-500 font-medium cursor-pointer"
                              onClick={() => onDelete(reply.id)}
                            >
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reply Input Form */}
      {replyingToComment === comment.id && (
        <div className="ml-14 mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!replyContent.trim()) return;
              onReplySubmit(comment.id, replyContent.trim());
              setReplyContent("");
              setReplyingToComment(null);
            }}
            className="space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                  {comment.user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.user?.name || "Unknown"}...`}
                  className="w-full p-3 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg resize-none focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                  rows={2}
                  required
                />
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyContent("");
                      setReplyingToComment(null);
                    }}
                    className="px-3 py-1 text-xs text-gruvbox-gray hover:text-gruvbox-light-fg0 dark:hover:text-gruvbox-dark-fg0 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-3 py-1 text-xs bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded hover:bg-gruvbox-yellow transition disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
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
  const [replyingToComment, setReplyingToComment] = useState<string | null>(
    null
  );
  const userId = Cookies.get("userId");

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
      await createComment(vibe.id, newComment.trim());
      const updated = await getCommentsWithRepliesByVibeId(vibe.id);
      setComments(updated.comments || []);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (
    parentCommentId: string,
    replyContent: string
  ) => {
    if (!user || !replyContent.trim()) return;
    try {
      await createComment(vibe.id, replyContent.trim(), parentCommentId);
      const updated = await getCommentsWithRepliesByVibeId(vibe.id);
      setComments(updated.comments || []);
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!userId) return;
    try {
      await likeComment(commentId, userId);
      const updated = await getCommentsWithRepliesByVibeId(vibe.id);
      setComments(updated.comments || []);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleUnlikeComment = async (commentId: string) => {
    if (!userId) return;
    try {
      await unlikeComment(commentId, userId);
      const updated = await getCommentsWithRepliesByVibeId(vibe.id);
      setComments(updated.comments || []);
    } catch (error) {
      console.error("Error unliking comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userId) return;
    try {
      await deleteComment(commentId, userId);
      const updated = await getCommentsWithRepliesByVibeId(vibe.id);
      setComments(updated.comments || []);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!userId) return;
    try {
      await updateComment(commentId, userId, content);
      const updated = await getCommentsWithRepliesByVibeId(vibe.id);
      setComments(updated.comments || []);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getCommentsWithRepliesByVibeId(vibe.id);
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

  const handleFacebookShare = (link: string) => {
    window.open(`https://www.facebook.com/share.php?u=${link}`, "_blank");
  };

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

          <button
            onClick={() =>
              handleFacebookShare(`http://www.oldvibes.com/vibes/${vibe.id}`)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 transition"
          >
            <IconShare size={20} />
            <span className="font-medium">Share</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 transition ml-auto">
            <Link
              href={`/report?vibeId=${vibe.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gruvbox-gray hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg2 transition"
            >
              <IconFlag size={20} />
            </Link>
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
              {comments.map((comment) => {
                const checkLiked =
                  comment.likes &&
                  comment.likes.some(
                    (like: any) => String(like) === String(userId)
                  );
                return (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    vibeUserId={vibe.userId}
                    userId={userId}
                    liked={!!checkLiked}
                    likesCount={comment.likes?.length || 0}
                    onLike={(id) => handleLikeComment(id)}
                    onUnlike={(id) => handleUnlikeComment(id)}
                    onDelete={(id) => handleDeleteComment(id)}
                    onUpdate={(id, content) => handleUpdateComment(id, content)}
                    replyingToComment={replyingToComment}
                    setReplyingToComment={setReplyingToComment}
                    onReplySubmit={handleReplySubmit}
                  />
                );
              })}
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
    <div className="pt-4 pb-10 bg-gruvbox-dark-bg0 min-h-screen">
      <PageShell width="md">
        <SectionHeader
          title="Community Feed"
          subtitle="Discover and interact with the latest vibes from our community"
        />
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-1/3" />
                      <div className="h-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-6 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-3/4" />
                  <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-full" />
                  <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-2/3" />
                  <div className="h-48 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {vibes.map((vibe: any) => (
              <FadeIn key={vibe.id}>
                <FeedVibeCard vibe={vibe} />
              </FadeIn>
            ))}
            {vibes.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gruvbox-gray text-lg">
                    No vibes available at the moment.
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-4 px-6 py-3 bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition"
                  >
                    Browse Marketplace
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </PageShell>
    </div>
  );
}
