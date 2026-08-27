"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Heart, MessageCircle, Play, Copy, Trash2, Search, Pencil, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import EditMemoryModal from "@/components/modals/EditMemoryModal";
import AddMemoryModal from "@/components/modals/AddMemoryModal";
import MemoryDetailModal from "@/components/modals/MemoryDetailModal";
import Avatar from "@/components/Avatar";
import { useUiFeedback } from "@/components/ui/UiFeedbackProvider";
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

interface MemoriesContentProps {
  memories: Memory[];
  activeTab: "all" | "photos" | "videos" | "links";
  searchQuery: string;
  currentUser: { _id?: string } | null;
  likedMemories: Set<string>;
  photoPage: number;
  videoPage: number;
  totalPhotoPages: number;
  totalVideoPages: number;
  onSetPhotoPage: (updater: (page: number) => number) => void;
  onSetVideoPage: (updater: (page: number) => number) => void;
  onEdit: (memory: Memory) => void;
  onDelete: (memoryId: string) => void;
  onToggleLike: (memoryId: string) => void;
  onOpenComments: (memoryId: string) => void;
  onSelectMemory: (memory: Memory) => void;
  onCopyLink: (url: string) => void;
  onDeleteLink: (memoryId: string) => void;
}

const PHOTOS_PER_PAGE = 8;
const VIDEOS_PER_PAGE = 6;

function MemoriesContent({
  memories,
  activeTab,
  searchQuery,
  currentUser,
  likedMemories,
  photoPage,
  videoPage,
  totalPhotoPages,
  totalVideoPages,
  onSetPhotoPage,
  onSetVideoPage,
  onEdit,
  onDelete,
  onToggleLike,
  onOpenComments,
  onSelectMemory,
  onCopyLink,
  onDeleteLink,
}: MemoriesContentProps) {
  const photos = useMemo(() => memories.filter((m) => m.type === "photo"), [memories]);
  const videos = useMemo(() => memories.filter((m) => m.type === "video"), [memories]);
  const links = useMemo(() => memories.filter((m) => m.type === "link"), [memories]);

  const paginatedPhotos = photos.slice((photoPage - 1) * PHOTOS_PER_PAGE, photoPage * PHOTOS_PER_PAGE);
  const paginatedVideos = videos.slice((videoPage - 1) * VIDEOS_PER_PAGE, videoPage * VIDEOS_PER_PAGE);

  const googleLinks = links.filter((link) => link.mediaUrl.toLowerCase().includes("google"));
  const youtubeLinks = links.filter((link) => link.mediaUrl.toLowerCase().includes("youtube"));
  const dropboxLinks = links.filter((link) => link.mediaUrl.toLowerCase().includes("dropbox"));
  const otherLinks = links.filter(
    (link) =>
      !link.mediaUrl.toLowerCase().includes("google") &&
      !link.mediaUrl.toLowerCase().includes("youtube") &&
      !link.mediaUrl.toLowerCase().includes("dropbox")
  );

  const renderLinkGroup = (title: string, items: Memory[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-[#3A2E22] mb-5">{title}</h2>
        <div className="space-y-3">
          {items.map((link) => (
            <div
              key={link._id}
              className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                {link.mediaUrl.toLowerCase().includes("google") && (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {link.mediaUrl.toLowerCase().includes("youtube") && (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                )}
                {link.mediaUrl.toLowerCase().includes("dropbox") && (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 18l6-4 6 4-6 4-6-4zm12 0l6-4 6 4-6 4-6-4z" />
                  </svg>
                )}
                {!link.mediaUrl.toLowerCase().includes("google") && !link.mediaUrl.toLowerCase().includes("youtube") && !link.mediaUrl.toLowerCase().includes("dropbox") && (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5E3C]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#3A2E22] font-medium truncate">{link.mediaUrl}</p>
                <p className="text-xs text-[#A6987F]">
                  Shared by {displayName(link.uploadedBy, currentUser?._id)} ·{" "}
                  {new Date(link.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onCopyLink(link.mediaUrl)}
                  className="p-2 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4 text-[#8B5E3C]" />
                </button>
                <button
                  onClick={() => onDeleteLink(link._id)}
                  className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  title="Delete link"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      {/* Photos Section */}
      {(activeTab === "all" || activeTab === "photos") && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#3A2E22]">Photos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {paginatedPhotos.length > 0 ? (
              paginatedPhotos.map((photo, idx) => {
                const isOwner = currentUser?._id && photo.uploadedBy?._id === currentUser?._id;
                return (
                  <div
                    key={photo._id || idx}
                    className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EFE6]">
                      <img
                        src={photo.mediaUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                      {isOwner && (
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button
                            onClick={() => onEdit(photo)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-[#EDE3D3] shadow-sm transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#3A2E22]" />
                          </button>
                          <button
                            onClick={() => onDelete(photo._id)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-red-200 shadow-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={photo.uploadedBy?.profilePicture}
                          name={photo.uploadedBy?.fullName}
                          size="sm"
                        />
                        <span className="text-sm text-[#3A2E22] font-medium truncate">
                          {displayName(photo.uploadedBy, currentUser?._id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8B5E3C]">
                        <button
                          onClick={() => onToggleLike(photo._id)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedMemories.has(photo._id) ? "text-red-500" : "hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedMemories.has(photo._id) ? "fill-current" : ""}`} />
                          {photo.likes?.length ?? 0}
                        </button>
                        <button
                          onClick={() => onOpenComments(photo._id)}
                          className="flex items-center gap-1 hover:text-[#4A3428] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {photo.comments?.length ?? 0}
                        </button>
                        <button
                          onClick={() => onSelectMemory(photo)}
                          className="px-2.5 py-1 rounded-lg border border-[#EDE3D3] text-xs font-medium hover:bg-[#F5EFE6] transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-base text-[#8B5E3C] mb-2 font-medium">No photos yet</p>
                <p className="text-sm text-[#A6987F]">Add your first photo to start building memories.</p>
              </div>
            )}
          </div>
          {totalPhotoPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => onSetPhotoPage((p) => Math.max(1, p - 1))}
                disabled={photoPage === 1}
                className="px-4 py-2 rounded-lg border border-[#EDE3D3] text-sm text-[#3A2E22] hover:bg-[#F5EFE6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-[#8B5E3C] font-medium">
                Page {photoPage} of {totalPhotoPages}
              </span>
              <button
                onClick={() => onSetPhotoPage((p) => Math.min(totalPhotoPages, p + 1))}
                disabled={photoPage === totalPhotoPages}
                className="px-4 py-2 rounded-lg border border-[#EDE3D3] text-sm text-[#3A2E22] hover:bg-[#F5EFE6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* Videos Section */}
      {(activeTab === "all" || activeTab === "videos") && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#3A2E22]">Videos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedVideos.length > 0 ? (
              paginatedVideos.map((video, idx) => {
                const isOwner = currentUser?._id && video.uploadedBy?._id === currentUser?._id;
                return (
                  <div
                    key={video._id || idx}
                    className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video overflow-hidden bg-[#F5EFE6]">
                      <video
                        src={video.mediaUrl}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs font-medium">
                        0:{Math.floor(Math.random() * 50 + 10).toString().padStart(2, "0")}
                      </span>
                      {isOwner && (
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button
                            onClick={() => onEdit(video)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-[#EDE3D3] shadow-sm transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#3A2E22]" />
                          </button>
                          <button
                            onClick={() => onDelete(video._id)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-red-200 shadow-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={video.uploadedBy?.profilePicture}
                          name={video.uploadedBy?.fullName}
                          size="sm"
                        />
                        <span className="text-sm text-[#3A2E22] font-medium truncate">
                          {displayName(video.uploadedBy, currentUser?._id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8B5E3C]">
                        <button
                          onClick={() => onToggleLike(video._id)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedMemories.has(video._id) ? "text-red-500" : "hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedMemories.has(video._id) ? "fill-current" : ""}`} />
                          {video.likes?.length ?? 0}
                        </button>
                        <button
                          onClick={() => onOpenComments(video._id)}
                          className="flex items-center gap-1 hover:text-[#4A3428] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {video.comments?.length ?? 0}
                        </button>
                        <button
                          onClick={() => onSelectMemory(video)}
                          className="px-2.5 py-1 rounded-lg border border-[#EDE3D3] text-xs font-medium hover:bg-[#F5EFE6] transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-base text-[#8B5E3C] mb-2 font-medium">No videos yet</p>
                <p className="text-sm text-[#A6987F]">
                  Add your first video to start building memories.
                </p>
              </div>
            )}
          </div>
          {totalVideoPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => onSetVideoPage((p) => Math.max(1, p - 1))}
                disabled={videoPage === 1}
                className="px-4 py-2 rounded-lg border border-[#EDE3D3] text-sm text-[#3A2E22] hover:bg-[#F5EFE6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-[#8B5E3C] font-medium">
                Page {videoPage} of {totalVideoPages}
              </span>
              <button
                onClick={() => onSetVideoPage((p) => Math.min(totalVideoPages, p + 1))}
                disabled={videoPage === totalVideoPages}
                className="px-4 py-2 rounded-lg border border-[#EDE3D3] text-sm text-[#3A2E22] hover:bg-[#F5EFE6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* Links Section */}
      {(activeTab === "all" || activeTab === "links") && (
        <>
          {renderLinkGroup("Google Photos Links", googleLinks)}
          {renderLinkGroup("YouTube Links", youtubeLinks)}
          {renderLinkGroup("Dropbox Links", dropboxLinks)}
          {renderLinkGroup("Other Links", otherLinks)}
          {links.length === 0 && (
            <section>
              <h2 className="text-xl font-semibold text-[#3A2E22] mb-5">Links</h2>
              <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-10 text-center">
                <p className="text-base text-[#8B5E3C] mb-2 font-medium">No links yet</p>
                <p className="text-sm text-[#A6987F]">Add your first link to start building memories.</p>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default function MemoriesPage() {
  const { toast, confirm } = useUiFeedback();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos" | "links">("all");
  const [currentUser, setCurrentUser] = useState<{ _id?: string } | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [photoPage, setPhotoPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [likedMemories, setLikedMemories] = useState<Set<string>>(new Set());
  const [commentsOpen, setCommentsOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [addMemoryOpen, setAddMemoryOpen] = useState(false);

  const fetchMemories = useCallback(async (query?: string, tab?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (tab && tab !== "all") params.set("type", tab === "photos" ? "photo" : tab === "videos" ? "video" : "link");
      params.set("limit", "100");

      const result = await api.get(`/memories${params.toString() ? `?${params.toString()}` : ""}`);
      const memoriesList = (result as any).memories || [];
      setMemories(memoriesList);
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories(searchQuery, activeTab);
  }, [activeTab, fetchMemories, searchQuery]);

  useEffect(() => {
    setPhotoPage(1);
    setVideoPage(1);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser?._id || memories.length === 0) {
      setLikedMemories(new Set());
      return;
    }
    const liked = new Set<string>();
    memories.forEach((m) => {
      if (m.likes?.some((likeId) => likeId === currentUser?._id)) {
        liked.add(m._id);
      }
    });
    setLikedMemories(liked);
  }, [memories, currentUser]);

  useEffect(() => {
    if (!selectedMemory) return;
    const updated = memories.find((m) => m._id === selectedMemory._id);
    if (updated && updated !== selectedMemory) {
      setSelectedMemory(updated);
    }
  }, [memories, selectedMemory]);

  const photos = memories.filter((m) => m.type === "photo");
  const videos = memories.filter((m) => m.type === "video");
  const links = memories.filter((m) => m.type === "link");
  const totalPhotoPages = Math.max(1, Math.ceil(photos.length / PHOTOS_PER_PAGE));
  const totalVideoPages = Math.max(1, Math.ceil(videos.length / VIDEOS_PER_PAGE));

  const actions = (
    <button
      onClick={() => setAddMemoryOpen(true)}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add memory
    </button>
  );

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
  };

  const handleDelete = async (memoryId: string) => {
    const ok = await confirm("Are you sure you want to delete this memory?");
    if (!ok) return;

    setMemories((prev) => prev.filter((m) => m._id !== memoryId));
    try {
      await api.delete(`/memories/${memoryId}`);
    } catch (error: any) {
      console.error("Failed to delete memory:", error);
      const message = error?.message || "";
      if (!message.toLowerCase().includes("not found")) {
        toast(message || "Something went wrong. Please try again.");
        fetchMemories(searchQuery, activeTab);
      }
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Something went wrong. Please try again.");
    }
  };

  const handleDeleteLink = async (memoryId: string) => {
    const ok = await confirm("Are you sure you want to delete this link?");
    if (!ok) return;
    await handleDelete(memoryId);
  };

  const handleEditSuccess = () => {
    fetchMemories(searchQuery, activeTab);
  };

  const handleAddMemorySuccess = () => {
    setAddMemoryOpen(false);
    fetchMemories(searchQuery, activeTab);
  };

  const handleToggleLike = async (memoryId: string) => {
    try {
      const result: any = await api.post(`/memories/${memoryId}/like`, {});
      setMemories((prev) =>
        prev.map((m) => {
          if (m._id !== memoryId) return m;
          const updated = result?.memory || m;
          return {
            ...m,
            likes: updated.likes || m.likes || [],
          };
        })
      );
      setLikedMemories((prev) => {
        const next = new Set(prev);
        if (next.has(memoryId)) {
          next.delete(memoryId);
        } else {
          next.add(memoryId);
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const fetchComments = async (memoryId: string) => {
    try {
      const result: any = await api.get(`/comments/memory/${memoryId}`);
      setComments(result.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    }
  };

  const openComments = async (memoryId: string) => {
    setCommentsOpen(memoryId);
    setNewComment("");
    await fetchComments(memoryId);
  };

  const handleAddComment = async () => {
    if (!commentsOpen || !newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const result: any = await api.post("/comments", {
        content: newComment.trim(),
        targetType: "memory",
        targetId: commentsOpen,
      });
      setComments((prev) => [result.comment, ...prev]);
      setMemories((prev) =>
        prev.map((m) =>
          m._id === commentsOpen
            ? { ...m, comments: [...(m.comments || []), result.comment._id] }
            : m
        )
      );
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading && memories.length === 0) {
    return (
      <InnerLayout title="Memories" subtitle="Loading..." actions={actions}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout title="Memories" subtitle="Cherish and explore your family's precious moments." actions={actions} actionsAlign="right">
      <EditMemoryModal
        key={editingMemory?._id}
        isOpen={!!editingMemory}
        onClose={() => setEditingMemory(null)}
        onSuccess={handleEditSuccess}
        memory={editingMemory}
      />
      <AddMemoryModal
        isOpen={addMemoryOpen}
        onClose={() => setAddMemoryOpen(false)}
        onSuccess={handleAddMemorySuccess}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6987F]" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
          />
        </div>
        <div className="flex rounded-xl border border-[#EDE3D3] overflow-hidden bg-white">
          {(["all", "photos", "videos", "links"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#3A2E22] text-white"
                  : "text-[#8B5E3C] hover:bg-[#F5EFE6]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <MemoriesContent
        memories={memories}
        activeTab={activeTab}
        searchQuery={searchQuery}
        currentUser={currentUser}
        likedMemories={likedMemories}
        photoPage={photoPage}
        videoPage={videoPage}
        totalPhotoPages={totalPhotoPages}
        totalVideoPages={totalVideoPages}
        onSetPhotoPage={(updater) => setPhotoPage((prev) => updater(prev))}
        onSetVideoPage={(updater) => setVideoPage((prev) => updater(prev))}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleLike={handleToggleLike}
        onOpenComments={openComments}
        onSelectMemory={setSelectedMemory}
        onCopyLink={handleCopyLink}
        onDeleteLink={handleDeleteLink}
      />

      <MemoryDetailModal
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        currentUser={currentUser}
        likedMemories={likedMemories}
        onToggleLike={handleToggleLike}
        onCommentAdded={fetchMemories}
      />
    </InnerLayout>
  );
}
