"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, MessageCircle, Play, Copy, Trash2, Search } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";

interface Memory {
  _id: string;
  title: string;
  description?: string;
  type: "photo" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  location?: string;
  uploadedBy?: {
    fullName: string;
  };
  createdAt: string;
}

interface LinkItem {
  _id: string;
  url: string;
  description?: string;
  addedBy?: string;
  createdAt: string;
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos">("all");

  const fetchMemories = useCallback(async (query?: string, tab?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (tab && tab !== "all") params.set("type", tab === "photos" ? "photo" : "video");

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

  const photos = memories.filter((m) => m.type === "photo");
  const videos = memories.filter((m) => m.type === "video");

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-[#8B5E3C]",
      "bg-[#A67C52]",
      "bg-[#6B8E23]",
      "bg-[#CD853F]",
      "bg-[#8B7355]",
      "bg-[#4A3428]",
    ];
    return colors[index % colors.length];
  };

  const actions = (
    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
      <Plus className="w-4 h-4" />
      Add memory
    </button>
  );

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
    <InnerLayout
      title="Memories"
      subtitle="Cherish and explore your family's precious moments."
      actions={actions}
    >
      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6987F]" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
          />
        </div>
        <div className="flex rounded-xl border border-[#EDE3D3] overflow-hidden bg-white">
          {(["all", "photos", "videos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
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

      {/* Photos Section */}
      {(activeTab === "all" || activeTab === "photos") && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#3A2E22]">Photos</h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors">
                <svg className="w-4 h-4 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-1.5 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors">
                <svg className="w-4 h-4 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.length > 0 ? (
              photos.map((photo, idx) => (
                <div
                  key={photo._id || idx}
                  className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] overflow-hidden group"
                >
                  <div className="relative aspect-square">
                    <img
                      src={photo.mediaUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-[10px] font-medium`}
                      >
                        {photo.uploadedBy?.fullName
                          ? getInitials(photo.uploadedBy.fullName)
                          : "U"}
                      </div>
                      <span className="text-xs text-[#3A2E22]">
                        {photo.uploadedBy?.fullName?.split(" ")[0] || "User"}
                      </span>
                    </div>
                    <button className="px-3 py-1 bg-[#4A3428] text-white rounded-lg text-[10px] font-medium hover:bg-[#3A2E22] transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-sm text-[#8B5E3C] mb-2">No photos yet</p>
                <p className="text-xs text-[#A6987F]">
                  Add your first photo to start building memories.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Videos Section */}
      {(activeTab === "all" || activeTab === "videos") && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#3A2E22]">Videos</h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors">
                <svg className="w-4 h-4 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-1.5 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors">
                <svg className="w-4 h-4 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {videos.length > 0 ? (
              videos.map((video, idx) => (
                <div
                  key={video._id || idx}
                  className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] overflow-hidden group"
                >
                  <div className="relative aspect-video">
                    <video
                      src={video.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${getAvatarColor(idx)} text-white flex items-center justify-center text-[10px] font-medium`}
                      >
                        {video.uploadedBy?.fullName
                          ? getInitials(video.uploadedBy.fullName)
                          : "U"}
                      </div>
                      <span className="text-xs text-[#3A2E22]">
                        {video.uploadedBy?.fullName?.split(" ")[0] || "User"}
                      </span>
                    </div>
                    <button className="px-3 py-1 bg-[#4A3428] text-white rounded-lg text-[10px] font-medium hover:bg-[#3A2E22] transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-sm text-[#8B5E3C] mb-2">No videos yet</p>
                <p className="text-xs text-[#A6987F]">
                  Add your first video to start building memories.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Links Section */}
      <section>
        <h2 className="text-lg font-semibold text-[#3A2E22] mb-4">Links</h2>
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link._id}
              className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center">
                  <Play className="w-3 h-3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#3A2E22] truncate">{link.url}</p>
                <p className="text-xs text-[#A6987F]">
                  Shared by {link.addedBy || "Unknown"} ·{" "}
                  {new Date(link.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors">
                  <Copy className="w-4 h-4 text-[#8B5E3C]" />
                </button>
                <button className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </InnerLayout>
  );
}
