"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, User, Ticket } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, invitationCode: invitationCode || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (invitationCode) {
        window.location.href = "/dashboard?joinFamily=true&code=" + encodeURIComponent(invitationCode);
      } else {
        window.location.href = "/dashboard?setupFamily=true";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <Image
          src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80"
          alt="Family gathering"
          fill
          sizes="(max-width: 1024px) 0px, 50vw"
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-[#4A3428]/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <img src="/imizi_logo.svg" alt="Imizi" width={24} height={24} className="w-6 h-6" />
                </div>
                <span className="text-xl font-serif tracking-wide">Imizi</span>
              </div>
          <h1 className="text-5xl font-serif mb-4 leading-tight">Start your journey!</h1>
          <p className="text-lg text-white/80 leading-relaxed">Your family&apos;s story is waiting for you.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F5EFE6] p-8">
        <div className="w-full max-w-md">
          <div className="bg-[#FFFDFA] rounded-3xl shadow-xl shadow-black/5 border border-[#EDE3D3] p-10">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#4A3428] flex items-center justify-center">
                <img src="/imizi_logo.svg" alt="Imizi" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-xl font-serif text-[#3A2E22]">Imizi</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-[#3A2E22] mb-2">Create Account</h2>
              <p className="text-sm text-[#8B5E3C]">Join your family on Imizi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-xl border border-red-100 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3A2E22]">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-[#A6987F] group-focus-within:text-[#8B5E3C] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3A2E22]">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-[#A6987F] group-focus-within:text-[#8B5E3C] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3A2E22]">
                  Invitation Code (optional)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Ticket className="w-5 h-5 text-[#A6987F] group-focus-within:text-[#8B5E3C] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    placeholder="Enter invitation code"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3A2E22]">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-[#A6987F] group-focus-within:text-[#8B5E3C] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#A6987F] hover:text-[#8B5E3C] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3A2E22]">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="w-5 h-5 text-[#A6987F] group-focus-within:text-[#8B5E3C] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4A3428] text-white py-3.5 rounded-xl font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-[#4A3428]/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Creating account...
                  </span>
                ) : (
                  "Create your Imizi Account"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#8B5E3C]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#4A3428] hover:underline underline-offset-4"
              >
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
