"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Users,
  Save,
  X,
  Video,
  Loader2,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { meetingApi } from "@/lib/meetingApi";

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  participants?: Array<{
    userId?: { _id: string; fullName: string };
    role: string;
    joinedAt?: string;
  }>;
  recording?: {
    recordingUrl?: string;
    recordingStatus?: string;
  };
  preservedAsMemory?: boolean;
}

export default function MeetingCompletePage() {
  const router = useRouter()
  const params = useParams()
  const meetingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [error, setError] = useState("")
  const [preserved, setPreserved] = useState(false)

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const result = await meetingApi.getMeeting(meetingId)
        setMeeting(result.meeting)
        setPreserved(result.meeting?.preservedAsMemory || false)
      } catch (err: any) {
        setError(err.message || "Failed to load meeting")
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()
  }, [meetingId])

  const handlePreserveMemory = async () => {
    setSaving(true)
    setError("")
    try {
      await meetingApi.preserveMemory(meetingId)
      setPreserved(true)
    } catch (err: any) {
      setError(err.message || "Failed to save as memory")
    } finally {
      setSaving(false)
    }
  }

  const handleDontSave = () => {
    router.push("/meetings")
  }

  const formatDuration = (start?: string, end?: string): string => {
    if (!start || !end) return "Unknown"
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "Unknown"
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#4A3428] animate-spin" />
      </div>
    )
  }

  if (error && !meeting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] p-10 max-w-md w-full text-center">
          <Video className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
          <h2 className="text-xl text-[#3A2E22] mb-2">Error loading meeting</h2>
          <p className="text-sm text-[#8B5E3C] mb-6">{error}</p>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
          >
            Back to Meetings
          </Link>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return null
  }

  const participantCount = meeting.participants?.length || 0
  const duration = formatDuration(meeting.startedAt, meeting.endedAt)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4A3428] to-[#8B5E3C] p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Meeting Ended</h1>
          <p className="text-white/80 text-sm">Your family meeting has concluded</p>
        </div>

        {/* Meeting Details */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#A69877] uppercase tracking-wide">Title</p>
                <p className="text-[#2F1D12] font-medium">{meeting.title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#A69877] uppercase tracking-wide">Date</p>
                <p className="text-[#2F1D12]">{formatDate(meeting.startedAt || meeting.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#A69877] uppercase tracking-wide">Duration</p>
                <p className="text-[#2F1D12]">{duration}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#A69877] uppercase tracking-wide">Participants</p>
                <p className="text-[#2F1D12]">{participantCount} {participantCount === 1 ? "member" : "members"} joined</p>
              </div>
            </div>

            {meeting.recording?.recordingUrl && (
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#A69877] uppercase tracking-wide">Recording</p>
                  <p className="text-[#2F1D12]">Recording available</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-xl border border-red-100 mb-6">
              {error}
            </div>
          )}

          {preserved ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-[#2F1D12] font-medium mb-1">Saved as Family Memory</p>
              <p className="text-sm text-[#8B5E3C] mb-4">This meeting has been preserved for your family.</p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/memories"
                  className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
                >
                  View Memories
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/meetings"
                  className="inline-flex items-center gap-2 border border-[#E5DDD1] text-[#3A2E22] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#F5EFE6] transition-colors"
                >
                  Back to Meetings
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="border-t border-[#E5DDD1] pt-6">
                <h3 className="text-sm font-medium text-[#2F1D12] mb-2">Save this meeting?</h3>
                <p className="text-sm text-[#8B5E3C] mb-6">
                  Would you like to preserve this meeting as a family memory? You can access it later in your family memories.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleDontSave}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5DDD1] text-sm font-medium text-[#2F1D12] hover:bg-[#F5EFE6] transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Don&apos;t Save
                  </button>
                  <button
                    onClick={handlePreserveMemory}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4A3428] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save as Family Memory
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/meetings"
                  className="text-sm text-[#8B5E3C] hover:text-[#4A3428] transition-colors"
                >
                  Back to Meetings
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
