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

interface InnerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function InnerLayout({
  children,
  title,
  subtitle,
  actions,
}: InnerLayoutProps) {
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
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

  return (
    <div className="flex min-h-screen bg-[#F5EFE6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#3A2E22] flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Profile Section */}
        <div className="p-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white/20">
              <Image
                src="/imizi_logo.svg"
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-white font-semibold text-sm">
              {displayUser?.fullName || "SIMBI Crista"}
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
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-xs font-medium">
                {initials}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-xs font-medium truncate">
                  {displayUser?.fullName || "User"}
                </p>
                <p className="text-white/50 text-[10px] truncate">Family Member</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/50" />
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
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#F5EFE6]/95 backdrop-blur-sm border-b border-[#EDE3D3]">
          <div className="px-9 sm:px-12 lg:px-20">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <img src="/imizi_logo.svg" alt="Imizi" width={28} height={28} className="w-7 h-7" />
                <span className="text-lg font-serif text-[#3A2E22]">Imizi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search person"
                    className="w-64 pl-10 pr-4 py-2 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                  />
                  <svg className="w-4 h-4 text-[#A6987F] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button className="p-2 text-[#8B5E3C] hover:text-[#4A3428] transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-9 sm:px-12 lg:px-20 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-serif text-[#3A2E22] mb-1">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#A6987F]">{subtitle}</p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="mb-6">{actions}</div>
          )}

          {/* Page Body */}
          {children}
        </div>
      </main>
    </div>
  );
}
