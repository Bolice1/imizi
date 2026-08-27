"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Users, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

interface InvitationData {
  success: boolean;
  invitation?: {
    token: string;
    familyId: {
      familyName: string;
    };
  };
  message?: string;
}

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchInvitation()
  }, [resolvedParams.token])

  const fetchInvitation = async () => {
    try {
      const data = await api.get(`/family/invite/${resolvedParams.token}`)
      setInvitation(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinFamily = async () => {
    setJoining(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const data = await api.post('/family/join', { code: resolvedParams.token })
      const updatedUser = (data as any).user
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to join family')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl text-[#3A2E22] mb-2">Invalid Invitation</h1>
          <p className="text-[#8B5E3C] mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3428] text-white rounded-xl hover:bg-[#3A2E22] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl text-[#3A2E22] mb-2">Welcome to the family!</h1>
          <p className="text-[#8B5E3C] mb-6">You've successfully joined the family.</p>
          <p className="text-sm text-[#A6987F]">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#8B5E3C]" />
          </div>
          <h1 className="text-2xl text-[#3A2E22] mb-2">Join Family</h1>
          <p className="text-[#8B5E3C]">
            You've been invited to join <span className="font-medium text-[#4A3428]">{invitation?.invitation?.familyId.familyName || 'a family'}</span>
          </p>
        </div>

        <div className="bg-[#F5EFE6] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#3A2E22] mb-1">Invitation code</p>
          <p className="text-xs text-[#A6987F] font-mono">{resolvedParams.token}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="flex-1 py-3 border border-[#EDE3D3] text-[#3A2E22] rounded-xl text-center hover:bg-[#F5EFE6] transition-colors"
          >
            Login first
          </Link>
          <button
            onClick={handleJoinFamily}
            disabled={joining}
            className="flex-1 py-3 bg-[#4A3428] text-white rounded-xl hover:bg-[#3A2E22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join Family'}
          </button>
        </div>
      </div>
    </div>
  )
}
