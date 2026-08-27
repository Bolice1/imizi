import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Images, Video, Milestone } from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=2000&q=80";
const CTA_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=80";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&q=80",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
];

const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1, -1, 2.5, -1];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <img src="/imizi_logo.svg" alt="Imizi" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-[family-name:var(--font-playfair)] text-white font-semibold">Imizi</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#about" className="text-sm text-white/90 hover:text-white transition-colors">About</Link>
              <Link href="#about" className="text-sm text-white/90 hover:text-white transition-colors">About Us</Link>
              <Link href="#how-it-works" className="text-sm text-white/90 hover:text-white transition-colors">Features</Link>
              <Link href="#contact" className="text-sm text-white/90 hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-5 py-2 rounded-xl text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#8A5B38] hover:bg-[#7A4E2F] transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image src={HERO_IMAGE} alt="Family sunset" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B211B]/75 via-[#2B211B]/40 to-[#2B211B]/60" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-6">
            <span className="text-xs font-medium text-white/90 uppercase tracking-wider">Your Family&apos;s Story, Preserved Forever</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-playfair)] text-white font-bold leading-tight mb-6">
            Every Memory<br />Deserves a Home
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-[600px] mx-auto mb-8 leading-relaxed">
            Imizi brings your family&apos;s photos, videos, and milestones together in one secure, private place—accessible for generations to come.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#8A5B38] text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#7A4E2F] transition-all shadow-lg shadow-[#8A5B38]/30">
              Start Your Story
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#F7F3EE] py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-playfair)] text-[#2B211B] font-semibold mb-4">About Us</h2>
            <p className="text-base text-[#6B625C] leading-relaxed">
              Imizi is a digital place for families to preserve their memories, stories, histories and milestones for generations to come.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DDD2] flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F3EE] flex items-center justify-center mb-5">
                <Images className="w-6 h-6 text-[#8A5B38]" />
              </div>
              <h3 className="text-xl font-[family-name:var(--font-playfair)] text-[#2B211B] font-semibold mb-3">Photo Albums</h3>
              <p className="text-sm text-[#6B625C] leading-relaxed mb-6 flex-1">
                Organize your cherished photographs into beautiful albums. Each image holds its own story and family history.
              </p>
              <Link href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[#8A5B38] hover:text-[#7A4E2F] transition-colors">
                Explore Albums <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DDD2] flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F3EE] flex items-center justify-center mb-5">
                <Video className="w-6 h-6 text-[#8A5B38]" />
              </div>
              <h3 className="text-xl font-[family-name:var(--font-playfair)] text-[#2B211B] font-semibold mb-3">Video Memories</h3>
              <p className="text-sm text-[#6B625C] leading-relaxed mb-6 flex-1">
                Store precious moments in motion—from graduations and family gatherings to everyday life and special occasions.
              </p>
              <Link href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[#8A5B38] hover:text-[#7A4E2F] transition-colors">
                View Videos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DDD2] flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F3EE] flex items-center justify-center mb-5">
                <Milestone className="w-6 h-6 text-[#8A5B38]" />
              </div>
              <h3 className="text-xl font-[family-name:var(--font-playfair)] text-[#2B211B] font-semibold mb-3">Family Milestones</h3>
              <p className="text-sm text-[#6B625C] leading-relaxed mb-6 flex-1">
                Mark births, anniversaries, graduations and important family events that deserve to be remembered.
              </p>
              <Link href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[#8A5B38] hover:text-[#7A4E2F] transition-colors">
                Add Milestones <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#3D332B] py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#B08B68] uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-playfair)] text-white font-semibold">How Imizi Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#B08B68]/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-[family-name:var(--font-playfair)] text-[#B08B68] font-bold">1</span>
              </div>
              <h3 className="text-lg font-[family-name:var(--font-playfair)] text-white font-semibold mb-2">Create Your Family Space</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Set up your private family home in minutes. Name it, personalize it, and make it ready for future generations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#8A5B38]/30 to-[#B08B68]/20 border border-[#B08B68]/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#B08B68]/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-[family-name:var(--font-playfair)] text-[#B08B68] font-bold">2</span>
              </div>
              <h3 className="text-lg font-[family-name:var(--font-playfair)] text-white font-semibold mb-2">Invite Loved Ones</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Send secure invitations to family members near and far. Grandparents, cousins, siblings, and parents can contribute.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#B08B68]/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-[family-name:var(--font-playfair)] text-[#B08B68] font-bold">3</span>
              </div>
              <h3 className="text-lg font-[family-name:var(--font-playfair)] text-white font-semibold mb-2">Capture & Cherish Together</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Upload photos, write stories, record memories, and celebrate life&apos;s milestones—all preserved securely by Imizi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Family Gallery Section */}
      <section className="bg-[#F7F3EE] py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#8A5B38] uppercase tracking-widest mb-3">Family Gallery</p>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-playfair)] text-[#2B211B] font-semibold mb-4">A Glimpse Into Family Life</h2>
            <p className="text-base text-[#6B625C] max-w-xl mx-auto">
              Every photograph holds a world of feeling. Here&apos;s a peek at what families are preserving.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#E8DDD2] -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8">
              {GALLERY_IMAGES.map((src, idx) => (
                <div
                  key={idx}
                  className="relative bg-white p-2 pb-8 shadow-lg border border-[#E8DDD2] hover:shadow-xl transition-shadow"
                  style={{ transform: `rotate(${ROTATIONS[idx % ROTATIONS.length]}deg)` }}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-sm">
                    <Image src={src} alt={`Family memory ${idx + 1}`} fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Divider */}
      <section className="bg-[#F7F3EE] py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <p className="text-sm font-semibold text-[#8A5B38] uppercase tracking-widest mb-6">Every Family Has A Story Worth Telling</p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A5B38]" />
            <span className="w-2 h-2 rounded-full bg-[#B08B68]" />
            <span className="w-2 h-2 rounded-full bg-[#8A5B38]" />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="contact" className="relative py-24">
        <div className="absolute inset-0">
          <Image src={CTA_IMAGE} alt="Family around campfire" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#3D332B]/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-playfair)] text-white font-bold mb-6">Your Story Starts Today.</h2>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Don&apos;t let precious memories fade. Give your family the gift of connection, history, and belonging that lasts for generations.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#8A5B38] text-white px-8 py-4 rounded-xl text-sm font-medium hover:bg-[#7A4E2F] transition-all shadow-lg shadow-[#8A5B38]/30 mb-4">
            Begin Your Family Album — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-white/60">No credit card required • Secure • Private</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D332B] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/imizi_logo.svg" alt="Imizi" width={28} height={28} className="w-7 h-7" />
                <span className="text-lg font-[family-name:var(--font-playfair)] text-white font-semibold">Imizi</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Inside every family lives a story worth preserving.
              </p>
              <p className="text-xs text-white/40 leading-relaxed">
                Capture memories, celebrate milestones, and build a lasting digital legacy for future generations.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Navigate</h4>
              <ul className="space-y-2.5">
                <li><Link href="#about" className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">Legacy Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Family Tools</h4>
              <ul className="space-y-2.5">
                <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">Photo Albums</Link></li>
                <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">Video Memories</Link></li>
                <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">Milestones</Link></li>
                <li><Link href="/events" className="text-sm text-white/60 hover:text-white transition-colors">Family Calendar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Get Started</h4>
              <ul className="space-y-2.5">
                <li><Link href="/register" className="text-sm text-white/60 hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">Help & Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">© 2026 Imizi. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-white/40 hover:text-[#B08B68] transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </Link>
              <Link href="#" className="text-white/40 hover:text-[#B08B68] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </Link>
              <Link href="#" className="text-white/40 hover:text-[#B08B68] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
