"use client";

import { useEffect, useState } from "react";
import { X, Heart, MessageCircle, Send, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import Avatar from "@/components/Avatar";
import { displayName } from "@/lib/displayName";

interface Story {
  _id: string;
  title: string;
  content?: string;
  toldBy?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  author?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  likes?: string[];
  comments?: string[];
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  createdAt: string;
}

interface StoryDetailModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { _id?: string } | null;
  likedStories: Set<string>;
  onToggleLike: (storyId: string) => void;
  onCommentAdded?: () => void;
}

export default function StoryDetailModal({
  story,
  isOpen,
  onClose,
  currentUser,
  likedStories,
  onToggleLike,
  onCommentAdded,
}: StoryDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const storyId = story?._id;

  useEffect(() => {
    if (isOpen && storyId) {
      setLoadingComments(true);
      setComments([]);
      setNewComment("");
      api
        .get(`/comments/story/${storyId}`)
        .then((result: any) => setComments(result.comments || []))
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [isOpen, storyId]);

  const handleAddComment = async () => {
    if (!storyId || !newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const result: any = await api.post("/comments", {
        content: newComment.trim(),
        targetType: "story",
        targetId: storyId,
      });
      setComments((prev) => [result.comment, ...prev]);
      onCommentAdded?.();
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Left Panel */}
        <div className="md:w-3/5 bg-white flex flex-col">
          {story.thumbnailUrl && (
            <div className="w-full h-64 sm:h-80 bg-[#F5EFE6] flex-shrink-0">
              <img src={story.thumbnailUrl} alt={story.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8">
            <h2 className="text-2xl font-serif text-[#3A2E22] mb-6 break-words">{story.title}</h2>
            <div className="text-sm text-[#3A2E22] leading-[1.8] whitespace-pre-line break-words">
              {story.content}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:w-2/5 border-t md:border-t-0 md:border-l border-[#EDE3D3] flex flex-col bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3]">
            <div className="flex items-center gap-3">
              <Avatar
                src={story.author?.profilePicture}
                name={story.author?.fullName}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold text-[#3A2E22] break-words">{displayName(story.author, currentUser?._id)}</p>
                <p className="text-[10px] text-[#A6987F]">The summer of 1924</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-[#8B5E3C]" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-[#EDE3D3] flex items-center gap-5">
            <button
              onClick={() => onToggleLike(story._id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                likedStories.has(story._id) ? "text-red-500" : "text-[#8B5E3C] hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${likedStories.has(story._id) ? "fill-current" : ""}`} />
              {story.likes?.length || 0} likes
            </button>
            <span className="flex items-center gap-1.5 text-xs text-[#8B5E3C]">
              <MessageCircle className="w-4 h-4" />
              {comments.length} comments
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-[#A6987F] text-center py-6">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => {
                const timeAgo = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
                return (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar
                      src={comment.userId?.profilePicture}
                      name={comment.userId?.fullName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#3A2E22]">{displayName(comment.userId, currentUser?._id)}</p>
                        <span className="text-[10px] text-[#A6987F]">{timeAgo}</span>
                      </div>
                      <p className="text-xs text-[#3A2E22] mt-0.5 leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#EDE3D3] flex-shrink-0">
            <div className="flex gap-2">
              <Avatar
                src={story.author?.profilePicture}
                name={story.author?.fullName}
                size="sm"
              />
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] break-words"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                className="px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
