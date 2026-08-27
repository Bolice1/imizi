import Image from "next/image";
import Link from "next/link";
import { Home, CalendarDays, Images, BookOpen, Users } from "lucide-react";
import type { Metadata } from "next";

const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Imizi",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero-style header */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-0">
          <Image src={BACKGROUND_IMAGE} alt="Family heritage" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-[#2B211B]/70" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/imizi_logo.svg" alt="Imizi" width={40} height={40} className="w-10 h-10" />
            <span className="text-2xl font-[family-name:var(--font-playfair)] text-white font-semibold">Imizi</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-[family-name:var(--font-playfair)] text-white font-bold mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-playfair)] text-white font-semibold mb-4">
            This page seems to have wandered off
          </h2>
          <p className="text-base text-white/80 mb-8 leading-relaxed max-w-md mx-auto">
            Like a story waiting to be told, some pages take time to find. Let&apos;s get you back to where your family&apos;s memories live.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 bg-[#8A5B38] text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#7A4E2F] transition-all shadow-lg shadow-[#8A5B38]/30">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Helpful links footer */}
      <div className="bg-[#F7F3EE] py-12 border-t border-[#E8DDD2]">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm font-medium text-[#6B625C] text-center mb-6">Or explore what Imizi has to offer</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/events" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E8DDD2] hover:shadow-md transition-all group">
              <CalendarDays className="w-6 h-6 text-[#8A5B38] group-hover:text-[#7A4E2F] transition-colors" />
              <span className="text-sm font-medium text-[#2B211B]">Family Calendar</span>
            </Link>
            <Link href="/memories" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E8DDD2] hover:shadow-md transition-all group">
              <Images className="w-6 h-6 text-[#8A5B38] group-hover:text-[#7A4E2F] transition-colors" />
              <span className="text-sm font-medium text-[#2B211B]">Memories</span>
            </Link>
            <Link href="/stories" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E8DDD2] hover:shadow-md transition-all group">
              <BookOpen className="w-6 h-6 text-[#8A5B38] group-hover:text-[#7A4E2F] transition-colors" />
              <span className="text-sm font-medium text-[#2B211B]">Stories</span>
            </Link>
            <Link href="/family-tree" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E8DDD2] hover:shadow-md transition-all group">
              <Users className="w-6 h-6 text-[#8A5B38] group-hover:text-[#7A4E2F] transition-colors" />
              <span className="text-sm font-medium text-[#2B211B]">Family Tree</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
