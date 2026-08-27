"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Calendar, Users, Shield, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  familyId?: string;
  role?: string;
  createdAt?: string;
  profilePicture?: string;
}

interface FamilyInfo {
  familyName?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [family, setFamily] = useState<FamilyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchProfile = async () => {
    setLoading(true)
    setError("")
    try {
      const [profileRes, familyRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/family/my-family').catch(() => ({ success: false, family: null }))
      ])

      const user = (profileRes as any).user
      if (user) {
        setProfile(user)
        setFullName(user.fullName || "")
        setEmail(user.email || "")
      }

      const familyData = (familyRes as any).family
      if (familyData) {
        setFamily(familyData)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const data = await api.put('/auth/profile', { fullName, email })
      const updatedUser = (data as any).user
      if (updatedUser) {
        setProfile(updatedUser)
        const stored = localStorage.getItem("user")
        if (stored) {
          const parsed = JSON.parse(stored)
          localStorage.setItem("user", JSON.stringify({ ...parsed, ...updatedUser }))
        }
      }
      setSuccess("Profile updated successfully")
      setEditing(false)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin_family":
        return "Family Admin"
      case "user":
        return "Family Member"
      default:
        return "Member"
    }
  }

  const actions = (
    <div className="flex gap-3">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
        >
          <User className="w-4 h-4" />
          Edit Profile
        </button>
      ) : (
        <form onSubmit={handleSave} className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setFullName(profile?.fullName || "")
              setEmail(profile?.email || "")
              setError("")
              setSuccess("")
            }}
            className="px-4 py-2.5 border border-[#EDE3D3] text-[#3A2E22] rounded-xl text-sm font-medium hover:bg-[#F5EFE6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      )}
    </div>
  )

  if (loading) {
    return (
      <InnerLayout title="Profile" subtitle="Loading..." actions={actions}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
        </div>
      </InnerLayout>
    )
  }

  return (
    <InnerLayout
      title="Profile"
      subtitle="Manage your personal information and preferences"
      actions={actions}
    >
      <div className="max-w-3xl">
        {error && (
          <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-xl border border-red-100 mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50/80 text-green-700 text-sm p-4 rounded-xl border border-green-100 mb-6">
            {success}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8 mb-6">
          <div className="flex items-start gap-6">
            <ProfilePictureUpload
              currentPicture={profile?.profilePicture}
              onUploadSuccess={(url) => {
                setProfile((prev) => prev ? { ...prev, profilePicture: url } : prev)
                const stored = localStorage.getItem("user")
                if (stored) {
                  const parsed = JSON.parse(stored)
                  localStorage.setItem("user", JSON.stringify({ ...parsed, profilePicture: url }))
                }
              }}
            />
            <div className="flex-1">
              <h2 className="text-2xl text-[#3A2E22] mb-1">{profile?.fullName || "User"}</h2>
              <p className="text-sm text-[#8B5E3C] mb-3">{profile?.email || ""}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5EFE6] text-[#8B5E3C] text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" />
                  {getRoleLabel(profile?.role)}
                </span>
                {family?.familyName && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5EFE6] text-[#8B5E3C] text-xs font-medium rounded-full">
                    <Users className="w-3 h-3" />
                    {family.familyName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-8">
          <h3 className="text-lg font-semibold text-[#3A2E22] mb-6">Personal Information</h3>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#3A2E22]">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#3A2E22]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFullName(profile?.fullName || "")
                    setEmail(profile?.email || "")
                    setError("")
                    setSuccess("")
                  }}
                  className="flex-1 py-3 rounded-xl border border-[#EDE3D3] text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#4A3428] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-[#F5EFE6] rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <User className="w-5 h-5 text-[#8B5E3C]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#A6987F] mb-0.5">Full Name</p>
                  <p className="text-sm text-[#3A2E22] font-medium">{profile?.fullName || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-[#F5EFE6] rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Mail className="w-5 h-5 text-[#8B5E3C]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#A6987F] mb-0.5">Email Address</p>
                  <p className="text-sm text-[#3A2E22] font-medium">{profile?.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-[#F5EFE6] rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Users className="w-5 h-5 text-[#8B5E3C]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#A6987F] mb-0.5">Family</p>
                  <p className="text-sm text-[#3A2E22] font-medium">{family?.familyName || "No family yet"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-[#F5EFE6] rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Shield className="w-5 h-5 text-[#8B5E3C]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#A6987F] mb-0.5">Role</p>
                  <p className="text-sm text-[#3A2E22] font-medium">{getRoleLabel(profile?.role)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-[#F5EFE6] rounded-xl">
                <div className="p-2 bg-white rounded-lg">
                  <Calendar className="w-5 h-5 text-[#8B5E3C]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#A6987F] mb-0.5">Member Since</p>
                  <p className="text-sm text-[#3A2E22] font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </InnerLayout>
  )
}
