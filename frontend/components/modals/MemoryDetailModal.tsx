"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Heart, MessageCircle, Send, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import Avatar from "@/components/Avatar";
import { displayName } from "@/lib/displayName";

interface Memory {
  _id: string;
  title: string;
  description?: string;
  type: "photo" | "video" | "link";
  mediaUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  location?: string;
  uploadedBy?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  likes?: string[];
  comments?: string[];
  views?: number;
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

interface MemoryDetailModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { _id?: string } | null;
  likedMemories: Set<string>;
  onToggleLike: (memoryId: string) => void;
  onCommentAdded?: () => void;
}

export default function MemoryDetailModal({
  memory,
  isOpen,
  onClose,
  currentUser,
  likedMemories,
  onToggleLike,
  onCommentAdded,
}: MemoryDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const isOwner = currentUser?._id && memory?.uploadedBy?._id === currentUser?._id;
  const memoryId = memory?._id;

  useEffect(() => {
    if (isOpen && memoryId) {
      setLoadingComments(true);
      setComments([]);
      setNewComment("");
      api
        .get(`/comments/memory/${memoryId}`)
        .then((result: any) => setComments(result.comments || []))
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [isOpen, memoryId]);

  const handleAddComment = async () => {
    if (!memoryId || !newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const result: any = await api.post("/comments", {
        content: newComment.trim(),
        targetType: "memory",
        targetId: memoryId,
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

  if (!isOpen || !memory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Left: Media */}
        <div className="md:w-3/5 bg-[#F5EFE6] flex items-center justify-center">
          {memory.type === "photo" ? (
            <img
              src={memory.mediaUrl}
              alt={memory.title}
              className="w-full h-64 md:h-full object-cover"
            />
          ) : memory.type === "video" ? (
            <video
              src={memory.mediaUrl}
              className="w-full h-64 md:h-full object-cover"
              controls
              playsInline
            />
          ) : (
            <div className="w-full h-64 md:h-full flex flex-col items-center justify-center p-6 text-center">
              <a
                href={memory.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#4A3428] underline break-all"
              >
                {memory.mediaUrl}
              </a>
              <span className="text-xs text-[#A6987F] mt-2">Link memory</span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="md:w-2/5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3]">
            <div>
              <h3 className="text-lg font-semibold text-[#3A2E22]">{memory.title}</h3>
              <p className="text-xs text-[#A6987F] mt-0.5">
                {new Date(memory.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
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

          {/* Author + Stats */}
          <div className="px-6 py-4 border-b border-[#EDE3D3] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={memory.uploadedBy?.profilePicture}
                name={memory.uploadedBy?.fullName}
                size="sm"
              />
              <span className="text-sm font-medium text-[#3A2E22]">
                {displayName(memory.uploadedBy, currentUser?._id)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#8B5E3C]">
              <button
                onClick={() => onToggleLike(memory._id)}
                className={`flex items-center gap-1 transition-colors ${
                  likedMemories.has(memory._id) ? "text-red-500" : "hover:text-red-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${likedMemories.has(memory._id) ? "fill-current" : ""}`} />
                {memory.likes?.length ?? 0}
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {memory.comments?.length ?? 0}
              </span>
            </div>
          </div>

          {/* Description */}
          {memory.description && (
            <div className="px-6 py-4 border-b border-[#EDE3D3]">
              <p className="text-sm text-[#3A2E22] leading-relaxed">{memory.description}</p>
            </div>
          )}

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-[#A6987F] text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar
                    src={comment.userId?.profilePicture}
                    name={comment.userId?.fullName}
                    size="sm"
                  />
                    <div className="flex-1 min-w-0">
                      <div className="bg-[#F5EFE6] rounded-2xl rounded-tl-none px-4 py-2.5">
                        <p className="text-sm font-medium text-[#3A2E22]">{displayName(comment.userId, currentUser?._id)}</p>
                        <p className="text-sm text-[#3A2E22] mt-0.5">{comment.content}</p>
                      </div>
                    <p className="text-[10px] text-[#A6987F] mt-1 px-1">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="px-6 py-4 border-t border-[#EDE3D3]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                className="px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
