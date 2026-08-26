"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, MessageCircle, Play } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";

interface Story {
  _id: string;
  title: string;
  content?: string;
  toldBy?: string;
  audioUrl?: string;
  author?: {
    fullName: string;
  };
  createdAt: string;
}

interface AuthorGroup {
  author: {
    fullName: string;
  };
  stories: Story[];
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const result = await api.get("/stories");
      const storiesList = (result as any).stories || [];
      setStories(storiesList);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Group stories by author
  const groupedStories = stories.reduce<Record<string, AuthorGroup>>(
    (acc, story) => {
      const authorName = story.author?.fullName || story.toldBy || "Unknown";
      if (!acc[authorName]) {
        acc[authorName] = {
          author: { fullName: authorName },
          stories: [],
        };
      }
      acc[authorName].stories.push(story);
      return acc;
    },
    {}
  );

  const authors = Object.values(groupedStories);

  const actions = (
    <div className="flex items-center gap-4">
      <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
        <Plus className="w-4 h-4" />
        Add Your Story
      </button>
      <span className="text-sm text-[#8B5E3C]">
        {stories.length} {stories.length === 1 ? "story" : "stories"}
      </span>
    </div>
  );

  if (loading) {
    return (
      <InnerLayout title="Family Stories" subtitle="Loading..." actions={actions}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout
      title="Family Stories"
      subtitle="Every family weaves its own quiet tapestry of time, stitched together by those unforgettable moments where their lives change forever and their shared history begins."
      actions={actions}
    >
      <div className="space-y-8">
        {authors.map((group, groupIdx) => (
          <div key={groupIdx}>
            {/* Author Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full ${getAvatarColor(groupIdx)} text-white flex items-center justify-center text-sm font-medium`}
              >
                {getInitials(group.author.fullName)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#3A2E22]">
                  {group.author.fullName}
                </h3>
                <p className="text-xs text-[#A6987F]">
                  {group.stories.length} {group.stories.length === 1 ? "story" : "stories"}
                </p>
              </div>
            </div>

            {/* Stories */}
            <div className="space-y-3">
              {group.stories.map((story, idx) => (
                <div
                  key={story._id || idx}
                  className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center">
                      <Play className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#3A2E22] truncate">
                      {story.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#A6987F] flex items-center gap-1">
                        <Heart className="w-3 h-3" /> 24
                      </span>
                      <span className="text-xs text-[#A6987F] flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> 8 comments
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button className="px-4 py-2 bg-[#4A3428] text-white rounded-lg text-xs font-medium hover:bg-[#3A2E22] transition-colors">
                      View
                    </button>
                    <span className="text-[10px] text-[#A6987F]">
                      {new Date(story.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8B5E3C] mb-4">No stories yet</p>
            <p className="text-xs text-[#A6987F]">
              Start by adding your first family story.
            </p>
          </div>
        )}
      </div>
    </InnerLayout>
  );
}
