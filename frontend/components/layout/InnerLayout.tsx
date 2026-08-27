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
  Video,
} from "lucide-react";

interface InnerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  actionsAlign?: "left" | "right";
}

export default function InnerLayout({ children, title, subtitle, actions, actionsAlign = "left" }: InnerLayoutProps) {
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
    { href: "/meetings", label: "Meetings", icon: Video },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ]

  const displayUser = mounted ? user : { fullName: "SIMBI Crista" }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-[#3A2E22] mb-1">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#A6987F]">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className={`mb-6 ${actionsAlign === "right" ? "flex justify-end" : ""}`}>{actions}</div>
      )}

      {/* Page Body */}
      {children}
    </>
  );
}
