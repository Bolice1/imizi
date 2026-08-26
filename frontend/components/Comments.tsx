"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { api } from "@/lib/api";

interface CommentItem {
  _id: string;
  content: string;
  userId?: { _id: string; fullName: string };
  createdAt: string;
}

interface CommentsProps {
  targetType: "memory" | "story";
  targetId: string;
}

export default function Comments({ targetType, targetId }: CommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.get(`/comments/${targetType}/${targetId}`);
      setComments(data.comments || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/comments", { content, targetType, targetId });
      setContent("");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#3A2E22] flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#8B5E3C]" />
        Comments ({comments.length})
      </h3>

      <form onSubmit={submit} className="flex items-start gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 px-3 py-2 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          {submitting ? "..." : "Post"}
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {loading ? (
        <p className="text-xs text-[#A6987F]">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-[#A6987F]">No comments yet. Be the first to comment.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c._id} className="bg-[#F5EFE6] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#3A2E22]">
                  {c.userId?.fullName || "Family member"}
                </span>
                <span className="text-[10px] text-[#A6987F]">
                  {new Date(c.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-[#3A2E22]">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
