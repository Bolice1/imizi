"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Loader2,
  Users,
  Settings,
} from "lucide-react";
import { meetingApi } from "@/lib/meetingApi";
import { getStreamClient, StreamVideoProvider } from "@/lib/streamVideo";

function LobbyContent() {
  const router = useRouter()
  const params = useParams()
  const meetingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [meeting, setMeeting] = useState<any>(null)
  const [token, setToken] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [isHost, setIsHost] = useState<boolean>(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [screenEnabled, setScreenEnabled] = useState(false)
  const [devices, setDevices] = useState<{
    audioInputs: MediaDeviceInfo[]
    videoInputs: MediaDeviceInfo[]
    audioOutputs: MediaDeviceInfo[]
  }>({ audioInputs: [], videoInputs: [], audioOutputs: [] })
  const [selectedAudio, setSelectedAudio] = useState<string>("")
  const [selectedVideo, setSelectedVideo] = useState<string>("")
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [meetingRes, tokenRes] = await Promise.all([
          meetingApi.getMeeting(meetingId),
          meetingApi.getStreamToken(),
        ])

        setMeeting(meetingRes.meeting)
        setToken(tokenRes.token)
        setUserId(tokenRes.user._id)
        setUserName(tokenRes.user.fullName || "User")
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
        setIsHost(
          meetingRes.meeting?.hostId?._id === currentUser._id ||
          meetingRes.meeting?.createdBy?._id === currentUser._id ||
          meetingRes.meeting?.hostId === currentUser._id ||
          meetingRes.meeting?.createdBy === currentUser._id
        )
      } catch (err: any) {
        setError(err.message || "Failed to load meeting")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [meetingId])

  useEffect(() => {
    if (!token || !userId) return

    const client = getStreamClient(token, userId)

    const enumerate = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        stream.getTracks().forEach((t) => t.stop())
      } catch {
        setPermissionDenied(true)
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      setDevices({
        audioInputs: allDevices.filter((d) => d.kind === "audioinput"),
        videoInputs: allDevices.filter((d) => d.kind === "videoinput"),
        audioOutputs: allDevices.filter((d) => d.kind === "audiooutput"),
      })
    }

    enumerate()
  }, [token, userId])

  const handleJoin = async () => {
    if (!token) return
    setJoining(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioEnabled ? { deviceId: selectedAudio ? { exact: selectedAudio } : undefined } : false,
        video: videoEnabled ? { deviceId: selectedVideo ? { exact: selectedVideo } : undefined } : false,
      })
      stream.getTracks().forEach((t) => t.stop())
      router.push(`/meetings/${meetingId}/call?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}&meetingId=${encodeURIComponent(meetingId)}&isHost=${isHost}&audio=${audioEnabled}&video=${videoEnabled}&screen=${screenEnabled}`)
    } catch (err: any) {
      setError(err.message || "Failed to access devices")
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#4A3428] animate-spin" />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] p-10 max-w-md w-full text-center">
          <Video className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
          <h2 className="text-xl text-[#3A2E22] mb-2">Meeting not found</h2>
          <p className="text-sm text-[#8B5E3C] mb-6">{error || "This meeting may have been removed or you don't have access."}</p>
          <Link href="/meetings" className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
            Back to Meetings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5DDD1] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2F1D12]">{meeting.title}</h2>
            <p className="text-xs text-[#9A8777]">Get ready before joining</p>
          </div>
          <Link href="/meetings" className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#8B5E3C]" />
          </Link>
        </div>

        <div className="p-6 space-y-6">
          {permissionDenied && (
            <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-xl border border-red-100">
              Camera/microphone permission denied. Please allow access in your browser settings.
            </div>
          )}

          {error && (
            <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#2F1D12]">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#2F1D12]">Microphone</label>
              <select
                value={selectedAudio}
                onChange={(e) => setSelectedAudio(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              >
                <option value="">Default</option>
                {devices.audioInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#2F1D12]">Camera</label>
              <select
                value={selectedVideo}
                onChange={(e) => setSelectedVideo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              >
                <option value="">Default</option>
                {devices.videoInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${audioEnabled ? "bg-[#4A3428] text-white" : "bg-[#F5EFE6] text-[#8B5E3C]"}`}
            >
              {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {audioEnabled ? "Microphone On" : "Microphone Off"}
            </button>
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${videoEnabled ? "bg-[#4A3428] text-white" : "bg-[#F5EFE6] text-[#8B5E3C]"}`}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              {videoEnabled ? "Camera On" : "Camera Off"}
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E5DDD1]">
            <button
              onClick={() => router.push("/meetings")}
              className="flex-1 py-2.5 rounded-xl border border-[#E5DDD1] text-sm font-medium text-[#2F1D12] hover:bg-[#F5EFE6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Joining...
                </span>
              ) : (
                "Join Meeting"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinMeetingPage() {
  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5EFE6]/95 backdrop-blur-sm border-b border-[#EDE3D3]">
        <div className="w-full px-9 sm:px-12 lg:px-20">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/imizi_logo.svg" alt="Imizi" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-serif text-[#3A2E22]">imizi</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="w-full px-9 sm:px-12 lg:px-20 py-6 pt-24">
        <LobbyContent />
      </main>
    </div>
  );
}
