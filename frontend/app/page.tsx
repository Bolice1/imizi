import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Image src="/imizi_logo.svg" alt="Imizi" width={48} height={48} />
          <span className="text-3xl font-serif text-[#4A3428]">Imizi</span>
        </div>
        <h1 className="text-4xl font-serif text-[#4A3428] mb-4">Welcome to Imizi</h1>
        <p className="text-[#8B5E3C] mb-8">The home for your family&apos;s memories</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#3A2E22] transition-colors"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
