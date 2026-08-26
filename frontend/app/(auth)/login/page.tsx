"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post("/auth/login", { email, password });
      if (!data?.token) {
        setError(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
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
          <h1 className="text-5xl font-serif mb-4 leading-tight">Welcome Back</h1>
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
              <h2 className="text-3xl font-serif text-[#3A2E22] mb-2">Sign In</h2>
              <p className="text-sm text-[#8B5E3C]">Welcome back to your family</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-xl border border-red-100 backdrop-blur-sm">
                  {error}
                </div>
              )}

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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#EDE3D3] text-[#4A3428] focus:ring-[#8B5E3C]" />
                  <span className="text-sm text-[#3A2E22]">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#8B5E3C] hover:text-[#4A3428] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4A3428] text-white py-3.5 rounded-xl font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-[#4A3428]/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In to Imizi"
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EDE3D3]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#FFFDFA] text-[#A6987F] font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#EDE3D3] rounded-xl bg-white hover:bg-[#F5EFE6] hover:border-[#8B5E3C]/30 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-[#3A2E22]">
                  Continue with Google
                </span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-[#8B5E3C]">
              New to Imizi?{" "}
              <Link
                href="/register"
                className="font-medium text-[#4A3428] hover:underline underline-offset-4"
              >
                Create your family account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
