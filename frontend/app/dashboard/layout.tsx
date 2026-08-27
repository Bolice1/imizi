"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Bell, Plus, Play, BookOpen, CalendarDays, Phone, Upload, ChevronRight, LogOut, User, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import Avatar from "@/components/Avatar";
import { displayName } from "@/lib/displayName";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ _id?: string; fullName?: string; email?: string; role?: string; profilePicture?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user")
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch {
          setUser(null)
        }
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  const refreshUser = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user")
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const handleCopyInviteLink = async () => {
    try {
      const data = await api.post('/family/invite-link', {})
      const inviteCode = data.code || ''
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy invite code:', err)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5EFE6]/95 backdrop-blur-sm border-b border-[#EDE3D3]">
        <div className="w-full px-9 sm:px-12 lg:px-20">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                 <img src="/imizi_logo.svg" alt="Imizi" width={40} height={40} className="w-10 h-10" />
                <span className="text-xl font-serif text-[#3A2E22]">imizi</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium text-[#4A3428] border-b-2 border-[#4A3428] pb-4 -mb-4">
                  Home
                </Link>
                <Link href="/memories" className="text-sm font-medium text-[#8B5E3C] hover:text-[#4A3428] transition-colors">
                  Memories
                </Link>
                <Link href="/family-tree" className="text-sm font-medium text-[#8B5E3C] hover:text-[#4A3428] transition-colors">
                  Family Tree
                </Link>
                <Link href="/stories" className="text-sm font-medium text-[#8B5E3C] hover:text-[#4A3428] transition-colors">
                  Stories
                </Link>
                <Link href="/calendar" className="text-sm font-medium text-[#8B5E3C] hover:text-[#4A3428] transition-colors">
                  Calendar
                </Link>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-[#8B5E3C] hover:text-[#4A3428] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-[#8B5E3C] hover:text-[#4A3428] transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
               <div className="flex items-center gap-3 pl-3 border-l border-[#EDE3D3]">
                 <div className="text-right hidden sm:block">
                   <p className="text-sm font-medium text-[#3A2E22]">{displayName(user, user?._id)}</p>
                   <p className="text-xs text-[#A6987F]">{user?.email || ""}</p>
                 </div>
                 <div className="relative">
                  <button
                    onClick={() => {
                      refreshUser()
                      setDropdownOpen(!dropdownOpen)
                    }}
                    className="w-9 h-9 rounded-full hover:ring-2 hover:ring-[#8B5E3C]/50 transition-all overflow-hidden"
                  >
                    <Avatar src={user?.profilePicture} name={user?.fullName} size="md" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#EDE3D3] overflow-hidden z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-[#EDE3D3]">
                           <p className="text-sm font-medium text-[#3A2E22]">{displayName(user, user?._id)}</p>
                           <p className="text-xs text-[#A6987F]">{user?.email || ""}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        {user?.role === 'admin_family' && (
                          <button
                            onClick={handleCopyInviteLink}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            {copied ? "Copied!" : "Copy invite code"}
                          </button>
                        )}
                        <div className="border-t border-[#EDE3D3]">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with top padding for fixed navbar */}
      <main className="w-full px-9 sm:px-12 lg:px-20 py-6 pt-24">
        {children}
      </main>
    </div>
  );
}
