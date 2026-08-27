"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Images,
  Users,
  CalendarDays,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { UiFeedbackProvider } from "@/components/ui/UiFeedbackProvider";
import { displayName } from "@/lib/displayName";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<{ _id?: string; fullName?: string; email?: string; profilePicture?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname();

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
      setMounted(true)
    }
  }, [])

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/memories", label: "Memories", icon: Images },
    { href: "/family-tree", label: "Family", icon: Users },
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/stories", label: "Stories", icon: BookOpen },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ]

  const displayUser = mounted ? user : { fullName: "SIMBI Crista" }

  const getActiveLabel = () => {
    const match = navItems.find((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))
    return match?.label || "Home"
  }

  return (
    <div className="flex min-h-screen bg-[#F5EFE6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FFFDFA] flex flex-col fixed inset-y-0 left-0 z-40 border-r border-[#EDE3D3]">
        {/* Profile Section */}
        <div className="p-6 bg-[#4A3428] rounded-br-[4rem]">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[#8B5E3C]/40 bg-[#8B5E3C]">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/imizi_logo.svg"
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover opacity-80"
                />
              )}
            </div>
            <h2 className="text-white font-semibold text-sm">
              {displayName(user, user?._id)}
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#4A3428] text-white"
                    : "text-[#3A2E22] hover:bg-[#F5EFE6]"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
          >
            <Settings className="w-5 h-5" />
            Profile Settings
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              window.location.href = "/login"
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-xs font-medium overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#3A2E22] text-xs font-medium truncate">
                  {displayName(user, user?._id)}
                </p>
                <p className="text-[#A6987F] text-[10px] truncate">Family Member</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8B5E3C]" />
            </button>
            {dropdownOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-[#EDE3D3] overflow-hidden">
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token")
                      localStorage.removeItem("user")
                      window.location.href = "/login"
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="px-9 sm:px-12 lg:px-20">
          <div className="pt-2.5 sticky top-2.5 z-30">
            <Navbar activeLabel={getActiveLabel()} onOpenNotifications={() => setNotificationsOpen(true)} />
          </div>
          <div className="py-8">
            <UiFeedbackProvider>
              {children}
            </UiFeedbackProvider>
          </div>
        </div>
      </main>

      {/* Notifications Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setNotificationsOpen(false)}>
          <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3]">
              <h3 className="text-lg font-semibold text-[#3A2E22]">Notifications</h3>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <p className="text-sm text-[#A6987F] text-center py-8">No notifications yet.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
