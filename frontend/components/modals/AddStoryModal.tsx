"use client";

import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import { api } from "@/lib/api";

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStoryModal({ isOpen, onClose, onSuccess }: AddStoryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toldBy, setToldBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post("/stories", {
        title,
        content,
        toldBy: toldBy || undefined,
      });

      if (!data?.story) {
        setError(data?.message || "Failed to add story");
        return;
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setToldBy("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#3A2E22]">Add Story</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#8B5E3C]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="bg-red-50/80 text-red-700 text-sm p-3 rounded-xl border border-red-100 mb-5">
              {error}
            </div>
          )}

          <form id="story-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Story Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Day We Met"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Story Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story here..."
                rows={6}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Told By (optional)</label>
              <input
                type="text"
                value={toldBy}
                onChange={(e) => setToldBy(e.target.value)}
                placeholder="e.g. Grandma Sarah"
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-[#EDE3D3] flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#EDE3D3] text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="story-form"
            disabled={loading}
            className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? "Adding..." : "Add Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
