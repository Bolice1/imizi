"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ImageIcon } from "lucide-react";
import { api } from "@/lib/api";

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

interface EditStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  story: Story | null;
}

export default function EditStoryModal({ isOpen, onClose, onSuccess, story }: EditStoryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toldBy, setToldBy] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  useEffect(() => {
    if (story) {
      setTitle(story.title || "");
      setContent(story.content || "");
      setToldBy(story.toldBy || "");
      setCoverUrl(story.thumbnailUrl || "");
      setCoverPreview(story.thumbnailUrl || null);
      setCoverFile(null);
      setError("");
    }
  }, [story]);

  useEffect(() => {
    if (coverFile) {
      const objectUrl = URL.createObjectURL(coverFile);
      setCoverPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (story?.thumbnailUrl) {
      setCoverPreview(story.thumbnailUrl);
    } else {
      setCoverPreview(null);
    }
  }, [coverFile, story?.thumbnailUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Story content is required");
      return;
    }

    setLoading(true);
    try {
      let thumbnailUrl = coverUrl;

      if (coverFile) {
        if (coverFile.size > MAX_FILE_SIZE) {
          setError(`Cover image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", coverFile);
        const uploadData = await api.upload("/upload", formData);
        thumbnailUrl = uploadData.url;
      }

      await api.put(`/stories/${story?._id}`, {
        title,
        content,
        toldBy,
        thumbnailUrl: thumbnailUrl || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err?.message || "";
      if (message.toLowerCase().includes("file too large") || message.toLowerCase().includes("too large")) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#3A2E22]">Edit Story</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8B5E3C]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="bg-red-50/80 text-red-700 text-sm p-3 rounded-xl border border-red-100 mb-5">
              {error}
            </div>
          )}

          <form id="story-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story a title"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Story *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story here..."
                rows={5}
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
                placeholder="Who told this story?"
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Cover Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="story-cover-edit"
                />
                <label
                  htmlFor="story-cover-edit"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#EDE3D3] rounded-xl cursor-pointer hover:border-[#8B5E3C] transition-colors"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <ImageIcon className="w-7 h-7 text-[#A6987F] mb-1.5" />
                      <span className="text-sm text-[#8B5E3C]">Click to upload cover image</span>
                      <span className="text-xs text-[#A6987F] mt-1">PNG, JPG up to 50MB</span>
                    </>
                  )}
                </label>
              </div>
              {coverFile && (
                <p className="text-[11px] text-[#A6987F] mt-1">
                  {coverFile.name} ({(coverFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </form>
        </div>

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
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
