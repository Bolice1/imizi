"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Play, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import Comments from "@/components/Comments";

export default function StoryDetailPage() {
  const { id } = useParams();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/stories/${id}`);
        setStory(data.story);
      } catch (err: any) {
        setError(err?.message || "Failed to load story");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <InnerLayout title="Story" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin" />
        </div>
      </InnerLayout>
    );
  }

  if (error || !story) {
    return (
      <InnerLayout title="Story" subtitle="Not found">
        <div className="text-center py-12">
          <p className="text-sm text-[#8B5E3C] mb-4">{error || "This story could not be found."}</p>
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout
      title={story.title}
      subtitle={story.author?.fullName ? `Told by ${story.author.fullName}` : story.toldBy ? `Told by ${story.toldBy}` : undefined}
    >
      <div className="space-y-6">
        <a
          href="/stories"
          className="inline-flex items-center gap-1 text-sm text-[#8B5E3C] hover:text-[#4A3428] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to stories
        </a>

        <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center">
              <Play className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#3A2E22]">{story.title}</h2>
              <p className="text-xs text-[#A6987F]">
                {new Date(story.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {story.audioUrl && (
            <audio controls className="w-full mb-4">
              <source src={story.audioUrl} />
            </audio>
          )}

          <p className="text-sm text-[#3A2E22] leading-relaxed whitespace-pre-wrap">
            {story.content}
          </p>
        </div>

        <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-6">
          <Comments targetType="story" targetId={story._id} />
        </div>
      </div>
    </InnerLayout>
  );
}
