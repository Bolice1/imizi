"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Calendar, Users, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

interface UserData {
  fullName: string;
  email: string;
  familyId?: string;
  role?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [family, setFamily] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const userData = JSON.parse(stored)
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-[#F5EFE6] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#8B5E3C]" />
          </Link>
          <h1 className="text-2xl text-[#3A2E22]">Profile</h1>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-2xl font-medium">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl text-[#3A2E22] mb-1">{user?.fullName || 'User'}</h2>
            <p className="text-sm text-[#8B5E3C]">{user?.email || ''}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <User className="w-5 h-5 text-[#8B5E3C]" />
            <div>
              <p className="text-xs text-[#A6987F]">Full Name</p>
              <p className="text-sm text-[#3A2E22]">{user?.fullName || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <Mail className="w-5 h-5 text-[#8B5E3C]" />
            <div>
              <p className="text-xs text-[#A6987F]">Email</p>
              <p className="text-sm text-[#3A2E22]">{user?.email || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <Users className="w-5 h-5 text-[#8B5E3C]" />
            <div>
              <p className="text-xs text-[#A6987F]">Family</p>
              <p className="text-sm text-[#3A2E22]">{family?.familyName || 'No family yet'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#F5EFE6] rounded-xl">
            <Calendar className="w-5 h-5 text-[#8B5E3C]" />
            <div>
              <p className="text-xs text-[#A6987F]">Member since</p>
              <p className="text-sm text-[#3A2E22]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
