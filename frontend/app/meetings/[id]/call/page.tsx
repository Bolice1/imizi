"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Users,
  Loader2,
  MessageSquare,
  Settings,
  CircleDot,
  StopCircle,
  VideoIcon,
} from "lucide-react";
import { StreamVideo, StreamVideoClient, Call, CallControls, CallParticipantsList, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

function createStreamClient(token: string, userId: string) {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || ""
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_STREAM_API_KEY")
  }
  return new StreamVideoClient({
    apiKey,
    user: { id: userId },
    token,
  })
}

function ActiveCallInner() {
  const router = useRouter()
  const search = useSearchParams()
  const token = search.get("token") || ""
  const userId = search.get("userId") || ""
  const meetingId = search.get("meetingId") || ""
  const isHostParam = search.get("isHost") === "true"

  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isHost, setIsHost] = useState(isHostParam)
  const [recordingConsentShown, setRecordingConsentShown] = useState(false)

  const call = useCall()
  const { useIsCallRecordingInProgress, useLocalParticipant } = useCallStateHooks()
  const isCallRecording = useIsCallRecordingInProgress()
  const localParticipant = useLocalParticipant()

  useEffect(() => {
    if (isCallRecording && !recordingConsentShown) {
      setRecordingConsentShown(true)
    }
    setIsRecording(isCallRecording)
  }, [isCallRecording, recordingConsentShown])

  useEffect(() => {
    if (!localParticipant) return
    const permissions = (localParticipant as any).permissions || []
    if (permissions.includes("call.record")) {
      setIsHost(true)
    }
  }, [localParticipant])

  useEffect(() => {
    if (!token || !userId) {
      setError("Missing token or user info")
      setLoading(false)
      return
    }

    try {
      const streamClient = createStreamClient(token, userId)
      setClient(streamClient)

      const callInstance = streamClient.call("family_meeting", meetingId)

      callInstance.join({ create: true }).catch((err) => {
        console.error("Join call error:", err)
        setError(err.message || "Failed to join call")
        setLoading(false)
      })

      callInstance.on("call.recording_started", () => {
        setIsRecording(true)
        setRecordingConsentShown(true)
      })

      callInstance.on("call.recording_stopped", () => {
        setIsRecording(false)
      })

      setLoading(false)
    } catch (err: any) {
      setError(err.message || "Failed to initialize call")
      setLoading(false)
    }

    return () => {
      if (call) {
        call.leave().catch(() => {})
      }
    }
  }, [token, userId, meetingId])

  const toggleMute = useCallback(async () => {
    if (!call) return
    if (isMuted) {
      await call.microphone.enable()
    } else {
      await call.microphone.disable()
    }
    setIsMuted((prev) => !prev)
  }, [call, isMuted])

  const toggleVideo = useCallback(async () => {
    if (!call) return
    if (isVideoOff) {
      await call.camera.enable()
    } else {
      await call.camera.disable()
    }
    setIsVideoOff((prev) => !prev)
  }, [call, isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (!call) return
    if (isScreenSharing) {
      await call.screenShare.disable()
    } else {
      await call.screenShare.enable()
    }
    setIsScreenSharing((prev) => !prev)
  }, [call, isScreenSharing])

  const toggleRecording = useCallback(async () => {
    if (!call) return
    try {
      if (isRecording) {
        await call.stopRecording()
      } else {
        await call.startRecording()
      }
    } catch (err: any) {
      console.error("Recording toggle error:", err)
    }
  }, [call, isRecording])

  const leaveCall = useCallback(async () => {
    if (call) {
      await call.leave()
    }
    if (meetingId) {
      router.push(`/meetings/${meetingId}/complete`)
    } else {
      router.push("/meetings")
    }
  }, [call, router, meetingId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#3A2E22]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-sm">Joining family meeting...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#3A2E22]">
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] p-10 max-w-md w-full text-center">
          <Video className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
          <h2 className="text-xl text-[#3A2E22] mb-2">Could not join meeting</h2>
          <p className="text-sm text-[#8B5E3C] mb-6">{error}</p>
          <Link href="/meetings" className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
            Back to Meetings
          </Link>
        </div>
      </div>
    )
  }

  if (!client || !call) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#3A2E22] overflow-hidden">
      {/* Recording Consent Banner */}
      {recordingConsentShown && isRecording && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-semibold">REC</span>
          </div>
          <p className="text-sm">Recording has started. This meeting is being recorded.</p>
        </div>
      )}

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Participants Grid */}
        <div className="absolute inset-0 p-4 pt-28">
          <CallParticipantsList onClose={() => {}} />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-xs font-medium">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Family Meeting</p>
              <p className="text-white/70 text-xs">Encrypted & Private</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRecording && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-red-600 px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                REC
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="w-80 bg-[#2F1D12] border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white text-sm font-medium">Participants</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <CallParticipantsList onClose={() => {}} />
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? "bg-[#8B5E3C] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>
          {isHost && (
            <button
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isRecording ? "bg-red-600 text-white animate-pulse" : "bg-white/10 text-white hover:bg-white/20"}`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
            >
              {isRecording ? <StopCircle className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showParticipants ? "bg-[#8B5E3C] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={leaveCall}
            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActiveCallPage() {
  const search = useSearchParams()
  const token = search.get("token") || ""
  const userId = search.get("userId") || ""
  const meetingId = search.get("meetingId") || ""

  if (!token || !userId || !meetingId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#3A2E22]">
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] p-10 max-w-md w-full text-center">
          <Video className="w-12 h-12 text-[#A6987F] mx-auto mb-4" />
          <h2 className="text-xl text-[#3A2E22] mb-2">Invalid call link</h2>
          <p className="text-sm text-[#8B5E3C] mb-6">Missing required parameters.</p>
          <Link href="/meetings" className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors">
            Back to Meetings
          </Link>
        </div>
      </div>
    )
  }

  const client = createStreamClient(token, userId)

  return (
    <StreamVideo client={client}>
      <ActiveCallInner />
    </StreamVideo>
  )
}
