"use client";

import { Bell } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  activeLabel: string;
  onOpenNotifications: () => void;
}

export default function Navbar({ activeLabel, onOpenNotifications }: NavbarProps) {
  return (
    <nav className="h-16 bg-white border border-[#EDE3D3] px-6 sm:px-8 lg:px-10 flex items-center justify-between rounded-2xl">
      <div className="flex items-center gap-3">
        <img src="/imizi_logo.svg" alt="Imizi" className="w-12 h-12 object-contain" />
        <span className="text-sm font-medium text-[#3A2E22]">{activeLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl border border-[#EDE3D3] hover:bg-[#F5EFE6] transition-colors"
        >
          <Bell className="w-5 h-5 text-[#8B5E3C]" />
        </button>
      </div>
    </nav>
  );
}
