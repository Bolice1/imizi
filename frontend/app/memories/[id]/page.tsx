"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Play, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import Comments from "@/components/Comments";

export default function MemoryDetailPage() {
  const { id } = useParams();
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/memories/${id}`);
        setMemory(data.memory);
      } catch (err: any) {
        setError(err?.message || "Failed to load memory");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <InnerLayout title="Memory" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin" />
        </div>
      </InnerLayout>
    );
  }

  if (error || !memory) {
    return (
      <InnerLayout title="Memory" subtitle="Not found">
        <div className="text-center py-12">
          <p className="text-sm text-[#8B5E3C] mb-4">{error || "This memory could not be found."}</p>
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout title={memory.title} subtitle={memory.uploadedBy?.fullName ? `Shared by ${memory.uploadedBy.fullName}` : undefined}>
      <div className="space-y-6">
        <a
          href="/memories"
          className="inline-flex items-center gap-1 text-sm text-[#8B5E3C] hover:text-[#4A3428] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to memories
        </a>

        <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] overflow-hidden">
          <div className="relative aspect-video bg-black">
            {memory.type === "video" ? (
              <video src={memory.mediaUrl} className="w-full h-full object-contain" controls playsInline />
            ) : (
              <img src={memory.mediaUrl} alt={memory.title} className="w-full h-full object-contain" />
            )}
          </div>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#3A2E22] mb-1">{memory.title}</h2>
            {memory.description && (
              <p className="text-sm text-[#3A2E22] mb-3">{memory.description}</p>
            )}
            {memory.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {memory.tags.map((t: string, i: number) => (
                  <span key={i} className="text-xs bg-[#F5EFE6] text-[#8B5E3C] px-2 py-1 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>
            )}
            {memory.location && (
              <p className="text-xs text-[#A6987F]">{memory.location}</p>
            )}
          </div>
        </div>

        <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-6">
          <Comments targetType="memory" targetId={memory._id} />
        </div>
      </div>
    </InnerLayout>
  );
}
