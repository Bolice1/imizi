"use client";

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Play,
  BookOpen,
  CalendarDays,
  Phone,
  Upload,
  ChevronRight,
  Heart,
  MessageCircle,
  Search,
  Bell,
  CheckCircle2,
  Star,
  Lightbulb,
  Share2,
  ImageIcon,
  Video,
  Users,
  Home as HomeIcon,
  FileText,
  TreePine,
  CalendarIcon,
  X,
  Camera,
  Film,
  NotebookPen,
  Ticket,
} from "lucide-react"
import { api } from "@/lib/api"
import AddMemoryModal from "@/components/modals/AddMemoryModal"
import AddEventModal from "@/components/modals/AddEventModal"
import AddStoryModal from "@/components/modals/AddStoryModal"
import Avatar from "@/components/Avatar"

interface DashboardData {
  hasFamily: boolean
  upcomingEvents: any[]
  memories: any[]
  stories: any[]
  recentComments: any[]
  stats: {
    totalMemories: number
    totalStories: number
    activeMembers: number
    totalMembers: number
  }
}

interface FamilyMember {
  _id: string
  fullName: string
  email: string
  role?: string
  profilePicture?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [showJoinFamily, setShowJoinFamily] = useState(false)
  const [familyName, setFamilyName] = useState("")
  const [invitationCode, setInvitationCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showAddStory, setShowAddStory] = useState(false)
  const [family, setFamily] = useState<{ familyMembers?: FamilyMember[] } | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const joinFamilyCode = urlParams.get('joinFamily')
    const invitationCodeParam = urlParams.get('code')
    
    if (joinFamilyCode === 'true' && invitationCodeParam) {
      setShowJoinFamily(true)
      setInvitationCode(invitationCodeParam.toUpperCase())
    }
    
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const result = await api.get('/dashboard')
      const payload = (result as any).data || result
      const familyData = (result as any).family || null
      
      setData({
        hasFamily: (result as any).hasFamily ?? true,
        upcomingEvents: payload.upcomingEvents ?? [],
        memories: payload.memories ?? [],
        stories: payload.stories ?? [],
        recentComments: payload.recentComments ?? [],
        stats: payload.stats ?? {
          totalMemories: 0,
          totalStories: 0,
          activeMembers: 0,
          totalMembers: 0,
        },
      })
      
      if (familyData) {
        setFamily(familyData)
      } else {
        try {
          const familyResult = await api.get('/family/my-family')
          if ((familyResult as any).success && (familyResult as any).family) {
            setFamily((familyResult as any).family)
          }
        } catch (e) {
          console.error('Failed to fetch family:', e)
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error)
      if (error.message === 'Invalid token' || error.message === 'Unauthorized') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }
      setData({
        hasFamily: false,
        upcomingEvents: [],
        memories: [],
        stories: [],
        recentComments: [],
        stats: {
          totalMemories: 0,
          totalStories: 0,
          activeMembers: 0,
          totalMembers: 0,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) return

    setCreating(true)
    try {
      const result = await api.post('/family/create', { familyName })
      const updatedUser = (result as any).user
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      await fetchDashboard()
      setShowCreateFamily(false)
      setFamilyName("")
    } catch (error) {
      console.error('Failed to create family:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitationCode.trim()) return

    setJoining(true)
    try {
      const result = await api.post('/family/join', { code: invitationCode })
      const updatedUser = (result as any).user
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      await fetchDashboard()
      setShowJoinFamily(false)
      setInvitationCode("")
      window.history.replaceState({}, '', '/dashboard')
    } catch (error) {
      console.error('Failed to join family:', error)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data?.hasFamily) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#8B5E3C]" />
          </div>
          <h2 className="text-2xl text-[#3A2E22] mb-2">Welcome to Imizi</h2>
          <p className="text-sm text-[#8B5E3C] mb-6">
            Create a family to start capturing and preserving your family memories together, or join an existing family with an invitation code.
          </p>

          {!showCreateFamily && !showJoinFamily ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateFamily(true)}
                className="w-full bg-[#4A3428] text-white py-3.5 rounded-xl font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all shadow-lg shadow-[#4A3428]/20"
              >
                Create Your Family
              </button>
              <button
                onClick={() => setShowJoinFamily(true)}
                className="w-full border border-[#EDE3D3] text-[#3A2E22] py-3.5 rounded-xl font-medium hover:bg-[#F5EFE6] transition-colors"
              >
                Join a Family
              </button>
            </div>
          ) : showCreateFamily ? (
            <form onSubmit={handleCreateFamily} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-[#3A2E22] mb-1.5">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. The Ntwari Family"
                  className="w-full px-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateFamily(false)}
                  className="flex-1 py-3.5 rounded-xl border border-[#EDE3D3] text-[#3A2E22] font-medium hover:bg-[#F5EFE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#4A3428] text-white py-3.5 rounded-xl font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {creating ? "Creating..." : "Create Family"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleJoinFamily} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-[#3A2E22] mb-1.5">Invitation Code</label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="Enter invitation code"
                  className="w-full px-4 py-3 rounded-xl border border-[#EDE3D3] bg-white text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinFamily(false)
                    setInvitationCode("")
                  }}
                  className="flex-1 py-3.5 rounded-xl border border-[#EDE3D3] text-[#3A2E22] font-medium hover:bg-[#F5EFE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="flex-1 bg-[#4A3428] text-white py-3.5 rounded-xl font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {joining ? "Joining..." : "Join Family"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}

  const getRelativeTime = (date: string | Date) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return `${Math.floor(diffDays / 7)} weeks ago`
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl text-[#3A2E22] mb-1">Good evening, {user.fullName?.split(" ")[0] || "Ntwari"}.</h1>
        <p className="text-[#8B5E3C]">Here&apos;s what your family has been up to lately. You&apos;ve been missed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Content - Left/Center */}
        <div className="lg:col-span-8 space-y-6">
          {/* Coming Up */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-[#3A2E22]">Coming Up</h2>
              <Link href="/calendar" className="text-sm text-[#8B5E3C] hover:text-[#4A3428] flex items-center gap-1 transition-colors font-medium">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {data.upcomingEvents.length === 0 ? (
                <div className="flex-shrink-0 w-full bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-8 text-center">
                  <CalendarIcon className="w-12 h-12 text-[#A6987F] mx-auto mb-3" />
                  <p className="text-base text-[#8B5E3C] font-medium">No upcoming events</p>
                  <Link href="/calendar" className="inline-flex items-center gap-1 text-sm text-[#4A3428] font-medium mt-2 hover:underline">
                    <Plus className="w-4 h-4" /> Add event
                  </Link>
                </div>
              ) : (
                data.upcomingEvents.map((event: any, i: number) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#4A3428] text-white flex flex-col items-center justify-center">
                        <span className="text-xs font-medium">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                        <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[#3A2E22] text-base">{event.title}</h3>
                        <p className="text-sm text-[#A6987F] mt-0.5">{event.type}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Lately in the Family */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-[#3A2E22]">Lately in the Family</h2>
              <div className="flex gap-2">
                {["All", "Photos", "Videos", "Stories"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tab === "All"
                        ? "bg-[#4A3428] text-white"
                        : "bg-[#FFFDFA] text-[#8B5E3C] border border-[#EDE3D3] hover:border-[#8B5E3C]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Featured Post */}
              {data.memories.length > 0 && (
                <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] overflow-hidden">
                  <div className="relative h-80">
                    {data.memories[0].type === 'video' ? (
                      <video
                        src={data.memories[0].mediaUrl}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={data.memories[0].mediaUrl || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80"}
                        alt={data.memories[0].title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#4A3428] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        {data.memories[0].type === 'video' ? <Play className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {data.memories[0].type === 'video' ? 'VIDEO' : 'PHOTO'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white text-xl mb-2">&quot;{data.memories[0].title}&quot;</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={data.memories[0].uploadedBy?.profilePicture}
                            name={data.memories[0].uploadedBy?.fullName}
                            size="md"
                          />
                          <span className="text-white/90 text-base">{data.memories[0].uploadedBy?.fullName || 'User'} · {new Date(data.memories[0].createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/80">
                          <button className="flex items-center gap-1 hover:text-white transition-colors">
                            <Heart className="w-5 h-5" /> {data.memories[0].likes?.length || 0}
                          </button>
                          <button className="flex items-center gap-1 hover:text-white transition-colors">
                            <MessageCircle className="w-5 h-5" /> {data.memories[0].comments?.length || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Story Post */}
              {data.stories.length > 0 && (
                <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-6">
                  <div className="flex gap-4">
                    <Avatar
                      src={data.stories[0].author?.profilePicture}
                      name={data.stories[0].author?.fullName || data.stories[0].toldBy || 'Unknown'}
                      size="lg"
                      className="w-24 h-24 text-base"
                    />
                    <div className="flex-1">
                      <span className="inline-block bg-[#F5EFE6] text-[#8B5E3C] text-xs font-medium px-2 py-1 rounded-full mb-2">A STORY</span>
                      <h3 className="text-[#3A2E22] text-lg mb-1">&quot;{data.stories[0].title}&quot;</h3>
                      <p className="text-base text-[#A6987F]">Told by {data.stories[0].toldBy || data.stories[0].author?.fullName || 'Unknown'}</p>
                      {data.stories[0].audioUrl && (
                        <button className="mt-3 inline-flex items-center gap-2 bg-[#4A3428] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3A2E22] transition-colors">
                          <Play className="w-4 h-4" /> Listen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {data.memories.length === 0 && data.stories.length === 0 && (
                <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-12 text-center">
                  <ImageIcon className="w-12 h-12 text-[#A6987F] mx-auto mb-3" />
                  <p className="text-base text-[#8B5E3C] mb-4 font-medium">No memories or stories yet</p>
                  <p className="text-sm text-[#A6987F]">Start by adding your first photo, video, or story to the family archive.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Quick Actions */}
            <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5">
              <h3 className="text-sm font-semibold text-[#3A2E22] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddPhoto(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#4A3428] text-white rounded-xl hover:bg-[#3A2E22] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button
                  onClick={() => setShowAddVideo(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-[#EDE3D3] text-[#3A2E22] rounded-xl hover:bg-[#F5EFE6] transition-colors"
                >
                  <Film className="w-4 h-4" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-[#EDE3D3] text-[#3A2E22] rounded-xl hover:bg-[#F5EFE6] transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Event</span>
                </button>
                <button
                  onClick={() => setShowAddStory(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-[#EDE3D3] text-[#3A2E22] rounded-xl hover:bg-[#F5EFE6] transition-colors"
                >
                  <NotebookPen className="w-4 h-4" />
                  <span className="text-sm font-medium">Story</span>
                </button>
                <button
                  onClick={() => router.push("/meetings")}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-[#EDE3D3] text-[#3A2E22] rounded-xl hover:bg-[#F5EFE6] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Call</span>
                </button>
              </div>
            </div>

            {/* Family Activity */}
            <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5">
              <h3 className="text-sm font-semibold text-[#3A2E22] mb-3">Family Activity</h3>
              <div className="flex flex-col items-center mb-4">
                {(() => {
                  const pct = Math.round((data.stats.activeMembers / Math.max(1, data.stats.totalMembers)) * 100)
                  const radius = 28
                  const circumference = 2 * Math.PI * radius
                  const offset = circumference - (pct / 100) * circumference
                  const strokeColor = pct < 40 ? '#EF4444' : pct < 70 ? '#F59E0B' : '#22C55E'
                  return (
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r={radius} stroke="#F5EFE6" strokeWidth="6" fill="none" />
                        <circle cx="32" cy="32" r={radius} stroke={strokeColor} strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-xl font-bold text-[#3A2E22]">{pct}</span>
                          <span className="block text-xs text-[#A6987F]">score</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <p className="text-sm text-[#A6987F] text-center mb-4">Family engagement this month</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="text-sm text-[#3A2E22]">Photos shared</span>
                  </div>
                  <span className="text-sm font-medium text-[#3A2E22]">{data.stats.totalMemories} this month</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="text-sm text-[#3A2E22]">Stories written</span>
                  </div>
                  <span className="text-sm font-medium text-[#3A2E22]">{data.stats.totalStories} this month</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="text-sm text-[#3A2E22]">Active members</span>
                  </div>
                  <span className="text-sm font-medium text-[#3A2E22]">{data.stats.activeMembers} of {data.stats.totalMembers}</span>
                </div>
              </div>
            </div>
          </div>

           {/* Family Members */}
           <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-base font-semibold text-[#3A2E22]">Family Members</h3>
               <span className="text-sm text-[#8B5E3C] font-medium">{data.stats.totalMembers} members</span>
             </div>
             <p className="text-sm text-[#A6987F] mb-4">{data.stats.activeMembers} active today</p>
             
             {/* Member avatars row */}
             <div className="flex items-center gap-3 mb-5">
               {family?.familyMembers?.slice(0, 5).map((member, idx) => (
                 <Avatar
                   key={member._id || idx}
                   src={member.profilePicture}
                   name={member.fullName}
                   size="md"
                 />
               ))}
               {family?.familyMembers && family.familyMembers.length > 5 && (
                 <div className="w-9 h-9 rounded-full bg-[#F5EFE6] text-[#8B5E3C] flex items-center justify-center text-sm font-medium">
                   +{family.familyMembers.length - 5}
                 </div>
               )}
             </div>

             {/* Recent activity */}
             <div className="space-y-3">
               {data.memories.slice(0, 2).map((memory, idx) => (
                 <div key={memory._id || idx} className="flex items-center gap-3">
                   <Avatar
                     src={memory.uploadedBy?.profilePicture}
                     name={memory.uploadedBy?.fullName}
                     size="sm"
                   />
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-[#3A2E22] truncate">
                       <span className="font-medium">{memory.uploadedBy?.fullName || 'Someone'}</span> shared a photo
                     </p>
                   </div>
                   <span className="text-xs text-[#A6987F] flex-shrink-0">
                     {getRelativeTime(memory.createdAt)}
                   </span>
                 </div>
               ))}
               {data.stories.slice(0, 1).map((story, idx) => (
                 <div key={story._id || idx} className="flex items-center gap-3">
                   <Avatar
                     src={story.author?.profilePicture}
                     name={story.author?.fullName || story.toldBy || 'Someone'}
                     size="sm"
                   />
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-[#3A2E22] truncate">
                       <span className="font-medium">{story.author?.fullName || story.toldBy || 'Someone'}</span> told a story
                     </p>
                   </div>
                   <span className="text-xs text-[#A6987F] flex-shrink-0">
                     {getRelativeTime(story.createdAt)}
                   </span>
                 </div>
               ))}
               {data.memories.length === 0 && data.stories.length === 0 && (
                 <p className="text-sm text-[#A6987F]">No recent activity yet.</p>
               )}
             </div>
           </div>

           {/* This Week's Highlight */}
           <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#8B5E3C]" />
                <h3 className="text-sm font-semibold text-[#3A2E22]">This Week&apos;s Highlight</h3>
              </div>
              <p className="text-sm text-[#3A2E22] mb-1">
                {data.stats.totalMemories} new memories added, {data.stats.totalStories} stories told this week.
              </p>
              <p className="text-sm text-[#A6987F]">Most active: <span className="text-[#8B5E3C] font-medium">You</span></p>
            </div>

           {/* On This Day */}
           <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5">
              <h3 className="text-sm font-semibold text-[#3A2E22] mb-4">On This Day</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[2019, 2016, 2011, 2004, 1998].map((year) => (
                  <div key={year} className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden mb-1 bg-[#F5EFE6] flex items-center justify-center">
                      <Camera className="w-5 h-5 text-[#A6987F]" />
                    </div>
                    <span className="text-xs text-[#A6987F] text-center block">{year}</span>
                  </div>
                ))}
                <div className="flex-shrink-0 w-11 h-11 rounded-lg border-2 border-dashed border-[#EDE3D3] flex items-center justify-center">
                  <span className="text-xs text-[#A6987F]">+{Math.max(0, data.stats.totalMemories - 5)}</span>
                </div>
              </div>
              <p className="text-sm text-[#A6987F] mt-2">{data.stats.totalMemories} memories</p>
            </div>

           {/* Today's Prompt */}
           <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#8B5E3C]" />
                <h3 className="text-sm font-semibold text-[#3A2E22]">Today&apos;s Prompt</h3>
              </div>
              <p className="text-sm text-[#3A2E22] mb-3">&quot;What&apos;s a memory from this week you want to keep forever?&quot;</p>
              <Link href="/stories" className="text-sm text-[#8B5E3C] hover:text-[#4A3428] font-medium flex items-center gap-1 transition-colors">
                Share a memory <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemoryModal
        isOpen={showAddPhoto}
        onClose={() => setShowAddPhoto(false)}
        onSuccess={fetchDashboard}
        initialType="photo"
      />
      <AddMemoryModal
        isOpen={showAddVideo}
        onClose={() => setShowAddVideo(false)}
        onSuccess={fetchDashboard}
        initialType="video"
      />
      <AddEventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        onSuccess={fetchDashboard}
      />
      <AddStoryModal
        isOpen={showAddStory}
        onClose={() => setShowAddStory(false)}
        onSuccess={fetchDashboard}
      />
    </div>
  )
}
