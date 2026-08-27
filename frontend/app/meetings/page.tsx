"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Video,
  CalendarDays,
  Clock,
  Users,
  Play,
  Trash2,
  Phone,
  Info,
} from "lucide-react";
import { meetingApi } from "@/lib/meetingApi";

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  streamCallId: string;
  visibility: string;
  createdBy?: { _id: string; fullName: string };
  hostId?: { _id: string; fullName: string };
  participants?: Array<{
    userId?: { _id: string; fullName: string };
    role: string;
    joinedAt?: string;
  }>;
  createdAt: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  const fetchMeetings = async () => {
    try {
      setError("")
      const result = await meetingApi.getMeetings()
      setMeetings(result.meetings || [])
    } catch (err: any) {
      setError(err.message || "Failed to load meetings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const handleStartInstant = async () => {
    try {
      const meeting = await meetingApi.createMeeting({
        title: `Instant Family Call`,
        type: "instant_call",
        visibility: "family",
        recordingEnabled: false,
        transcriptionEnabled: false,
      })
      window.location.href = `/meetings/${meeting._id}/join`
    } catch (err: any) {
      setError(err.message || "Failed to start call")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "scheduled":
        return "bg-blue-100 text-blue-700"
      case "ended":
        return "bg-gray-100 text-gray-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-[#F5EFE6] text-[#8B5E3C]"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#3A2E22] mb-1">Family Meetings</h1>
          <p className="text-sm text-[#8B5E3C]">Gather your family in a private, secure space.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStartInstant}
            className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all shadow-lg shadow-[#4A3428]/20"
          >
            <Phone className="w-4 h-4" />
            Call Family Now
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 border border-[#EDE3D3] text-[#3A2E22] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#F5EFE6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-2xl border border-red-100 flex items-center gap-2">
          <Info className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-5 animate-pulse">
              <div className="h-5 bg-[#F5EFE6] rounded w-3/4 mb-3" />
              <div className="h-4 bg-[#F5EFE6] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] p-12 text-center">
          <Video className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#3A2E22] mb-2">No meetings yet</h3>
          <p className="text-sm text-[#8B5E3C] mb-6">Start a family call or schedule one to bring everyone together.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleStartInstant}
              className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Family Now
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 border border-[#EDE3D3] text-[#3A2E22] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#F5EFE6] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                  <span className="text-[10px] text-[#A6987F]">{meeting.type.replace("_", " ")}</span>
                </div>
                <Video className="w-5 h-5 text-[#8B5E3C]" />
              </div>
              <h3 className="text-sm font-medium text-[#2F1D12] mb-1 truncate">{meeting.title}</h3>
              {meeting.scheduledAt && (
                <p className="text-xs text-[#9A8777] flex items-center gap-1 mb-2">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(meeting.scheduledAt).toLocaleString()}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5DDD1]">
                <span className="text-[10px] text-[#9A8777]">
                  {meeting.participants?.length || 0} participants
                </span>
                <Link
                  href={`/meetings/${meeting._id}/join`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#4A3428] hover:text-[#3A2E22]"
                >
                  {meeting.status === "active" ? (
                    <>
                      <Play className="w-3 h-3" /> Join
                    </>
                  ) : (
                    <>
                      <Info className="w-3 h-3" /> View
                    </>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2F1D12]">Schedule Family Meeting</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#8B5E3C] mb-4">Meeting creation form will be here. For now, use &quot;Call Family Now&quot; to start an instant meeting.</p>
            <button
              onClick={() => setShowCreate(false)}
              className="w-full py-2.5 rounded-xl border border-[#E5DDD1] text-sm font-medium text-[#2F1D12] hover:bg-[#F5EFE6] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
