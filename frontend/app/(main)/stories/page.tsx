"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, MessageCircle, Play, Send, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import StoryDetailModal from "@/components/modals/StoryDetailModal";
import AddStoryModal from "@/components/modals/AddStoryModal";
import EditStoryModal from "@/components/modals/EditStoryModal";
import Avatar from "@/components/Avatar";
import { useUiFeedback } from "@/components/ui/UiFeedbackProvider";
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

interface AuthorGroup {
  author: {
    _id?: string;
    fullName: string;
    profilePicture?: string;
  };
  stories: Story[];
}

export default function StoriesPage() {
  const { toast, confirm } = useUiFeedback();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ _id?: string } | null>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [addStoryOpen, setAddStoryOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

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
    if (!currentUser?._id || stories.length === 0) {
      setLikedStories(new Set());
      return;
    }
    const liked = new Set<string>();
    stories.forEach((s) => {
      if (s.likes?.some((likeId) => likeId === currentUser?._id)) {
        liked.add(s._id);
      }
    });
    setLikedStories(liked);
  }, [stories, currentUser]);

  useEffect(() => {
    if (!selectedStory) return;
    const updated = stories.find((s) => s._id === selectedStory._id);
    if (updated && updated !== selectedStory) {
      setSelectedStory(updated);
    }
  }, [stories, selectedStory]);

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

  const handleAddStorySuccess = () => {
    setAddStoryOpen(false);
    fetchStories();
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const handleDeleteStory = async (storyId: string) => {
    const ok = await confirm("Are you sure you want to delete this story?");
    if (!ok) return;

    setStories((prev) => prev.filter((s) => s._id !== storyId));
    try {
      await api.delete(`/stories/${storyId}`);
    } catch (error: any) {
      console.error("Failed to delete story:", error);
      const message = error?.message || "";
      if (!message.toLowerCase().includes("not found")) {
        toast(message || "Something went wrong. Please try again.");
        fetchStories();
      }
    }
  };

  const handleEditStorySuccess = () => {
    setEditingStory(null);
    fetchStories();
  };

  const handleToggleLike = async (storyId: string) => {
    try {
      const result: any = await api.post(`/stories/${storyId}/like`, {});
      setStories((prev) =>
        prev.map((s) => {
          if (s._id !== storyId) return s;
          const updated = result?.story || s;
          return {
            ...s,
            likes: updated.likes || s.likes || [],
          };
        })
      );
      setLikedStories((prev) => {
        const next = new Set(prev);
        if (next.has(storyId)) {
          next.delete(storyId);
        } else {
          next.add(storyId);
        }
        return next;
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
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
    <button
      onClick={() => setAddStoryOpen(true)}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Your Story
    </button>
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
      actionsAlign="right"
    >
      <AddStoryModal
        isOpen={addStoryOpen}
        onClose={() => setAddStoryOpen(false)}
        onSuccess={handleAddStorySuccess}
      />
      <EditStoryModal
        isOpen={!!editingStory}
        onClose={() => setEditingStory(null)}
        onSuccess={handleEditStorySuccess}
        story={editingStory}
      />
      <div className="space-y-8">
        {authors.map((group, groupIdx) => (
          <div key={groupIdx}>
            {/* Author Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={group.author.profilePicture}
                name={group.author.fullName}
                size="md"
              />
               <div>
                  <h3 className="text-sm font-semibold text-[#3A2E22]">
                    {displayName({ _id: group.author._id, fullName: group.author.fullName }, currentUser?._id)}
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
                <div className="w-16 h-16 rounded-xl bg-[#F5EFE6] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {story.thumbnailUrl ? (
                    <img src={story.thumbnailUrl} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center">
                      <Play className="w-4 h-4" />
                    </div>
                  )}
                </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#3A2E22] truncate">
                      {story.title}
                    </h4>
                     <div className="flex items-center gap-3 mt-1">
                       <span className="text-xs text-[#A6987F] flex items-center gap-1">
                         <Heart className="w-3 h-3" /> {story.likes?.length || 0}
                       </span>
                       <span className="text-xs text-[#A6987F] flex items-center gap-1">
                         <MessageCircle className="w-3 h-3" /> {story.comments?.length || 0} comments
                       </span>
                     </div>
                  </div>
                   <div className="flex items-center gap-3 flex-shrink-0">
                      {currentUser?._id && story.author?._id === currentUser?._id && (
                        <>
                          <button
                            onClick={() => handleEditStory(story)}
                            className="p-2 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-[#3A2E22]" />
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story._id)}
                            className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="px-4 py-2 bg-[#4A3428] text-white rounded-lg text-xs font-medium hover:bg-[#3A2E22] transition-colors"
                      >
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

      <StoryDetailModal
        story={selectedStory}
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        currentUser={currentUser}
        likedStories={likedStories}
        onToggleLike={handleToggleLike}
        onCommentAdded={fetchStories}
      />
    </InnerLayout>
  );
}
