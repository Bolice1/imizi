"use client";

import { useState, useEffect } from "react";
import { X, Upload, ImageIcon, Video, Loader2, Link as LinkIcon } from "lucide-react";
import { api } from "@/lib/api";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: "photo" | "video" | "link";
}

type MemorySource = "upload" | "link";

export default function AddMemoryModal({ isOpen, onClose, onSuccess, initialType = "photo" }: AddMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"photo" | "video" | "link">(initialType);
  const [memorySource, setMemorySource] = useState<MemorySource>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    if (isOpen) {
      setType(initialType)
      setMemorySource("upload")
      setMediaUrl("")
    }
  }, [isOpen, initialType])

  useEffect(() => {
    if (memorySource === "link") {
      setType("link")
    } else if (memorySource === "upload") {
      setType(initialType)
    }
  }, [memorySource, initialType])

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setPreview(null)
    }
  }, [file])

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (memorySource === "upload" && !file) {
      setError("Please select a file");
      return;
    }

    if (memorySource === "link" && !mediaUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (memorySource === "upload" && file && file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    setLoading(true);
    try {
      let finalMediaUrl = mediaUrl;

      if (memorySource === "upload" && file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadData = await api.upload('/upload', formData)
        finalMediaUrl = uploadData.url
      }

      await api.post('/memories', {
        title,
        description,
        type,
        mediaUrl: finalMediaUrl,
        tags: tags ? tags.split(",").map(t => t.trim()) : undefined,
        location: location || undefined,
      })

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      const message = err?.message || ""
      if (message.toLowerCase().includes("file too large") || message.toLowerCase().includes("too large")) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setPreview(null);
    setMediaUrl("");
    setTags("");
    setLocation("");
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected && selected.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      setFile(null)
      setPreview(null)
      return
    }
    setError("")
    setFile(selected)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#3A2E22]">
            Add {type === "photo" ? "Photo" : type === "video" ? "Video" : "Link"}
          </h2>
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

          <form id="memory-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a title"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all resize-none"
              />
            </div>

            {memorySource === "upload" ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#3A2E22]">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("photo")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors ${
                      type === "photo"
                        ? "bg-[#4A3428] text-white border-[#4A3428]"
                        : "border-[#EDE3D3] text-[#3A2E22] hover:bg-[#F5EFE6]"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("video")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors ${
                      type === "video"
                        ? "bg-[#4A3428] text-white border-[#4A3428]"
                        : "border-[#EDE3D3] text-[#3A2E22] hover:bg-[#F5EFE6]"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#3A2E22]">Type</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#EDE3D3] bg-[#F5EFE6] text-sm text-[#3A2E22]">
                  <LinkIcon className="w-4 h-4" />
                  Link
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Source</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMemorySource("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors ${
                    memorySource === "upload"
                      ? "bg-[#4A3428] text-white border-[#4A3428]"
                      : "border-[#EDE3D3] text-[#3A2E22] hover:bg-[#F5EFE6]"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setMemorySource("link")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm transition-colors ${
                    memorySource === "link"
                      ? "bg-[#4A3428] text-white border-[#4A3428]"
                      : "border-[#EDE3D3] text-[#3A2E22] hover:bg-[#F5EFE6]"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Link
                </button>
              </div>
            </div>

            {memorySource === "upload" ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#3A2E22]">File *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept={type === "photo" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    required={memorySource === "upload"}
                    className="hidden"
                    id="memory-file-upload"
                  />
                  <label
                    htmlFor="memory-file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#EDE3D3] rounded-xl cursor-pointer hover:border-[#8B5E3C] transition-colors"
                  >
                    {preview ? (
                      type === "photo" ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <video src={preview} className="w-full h-full object-cover rounded-xl" controls />
                      )
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-[#A6987F] mb-1.5" />
                        <span className="text-sm text-[#8B5E3C]">Click to upload {type === "photo" ? "image" : "video"}</span>
                        <span className="text-xs text-[#A6987F] mt-1">PNG, JPG, GIF, MP4 up to 50MB</span>
                      </>
                    )}
                  </label>
                </div>
                {file && (
                  <p className="text-[11px] text-[#A6987F] mt-1">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#3A2E22]">Media URL *</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  required={memorySource === "link"}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                />
                <p className="text-[11px] text-[#A6987F] mt-1">Paste a direct link to an image or video</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="birthday, 2024, celebration"
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Location (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kigali, Rwanda"
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
            form="memory-form"
            disabled={loading}
            className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                {memorySource === "upload" ? "Uploading..." : "Adding..."}
              </span>
            ) : (
              `Add ${type === "photo" ? "Photo" : type === "video" ? "Video" : "Link"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
