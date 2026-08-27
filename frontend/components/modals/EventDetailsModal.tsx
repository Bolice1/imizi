"use client";

import { useState } from "react";
import { X, Pencil, Trash2, MapPin, Clock, Users, CalendarDays, Shield } from "lucide-react";
import { api } from "@/lib/api";

type EventType = "birthday" | "gathering" | "anniversary" | "celebration" | "appointment" | "other";

interface Event {
  _id: string;
  title: string;
  description?: string;
  type: EventType;
  startAt: string;
  endAt?: string;
  location?: string;
  relatedMemberId?: { _id: string; fullName: string };
  createdBy?: { _id: string; fullName: string };
  visibility: string;
  recurrence?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const EVENT_TYPES: { value: EventType; label: string; color: string; bg: string }[] = [
  { value: "birthday", label: "Birthday", color: "#F97316", bg: "#FFF7ED" },
  { value: "anniversary", label: "Anniversary", color: "#EC4899", bg: "#FDF2F8" },
  { value: "gathering", label: "Gathering", color: "#22C55E", bg: "#F0FDF4" },
  { value: "appointment", label: "Appointment", color: "#3B82F6", bg: "#EFF6FF" },
  { value: "celebration", label: "Celebration", color: "#A855F7", bg: "#FAF5FF" },
  { value: "other", label: "Other", color: "#8B5E3C", bg: "#F5EFE6" },
];

const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map((t) => [t.value, t])) as Record<EventType, typeof EVENT_TYPES[number]>;

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface EventDetailsModalProps {
  event: Event | null;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onUpdated: () => void;
}

export default function EventDetailsModal({ event, onClose, onEdit, onDelete, onUpdated }: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "other" as EventType,
    startAt: "",
    endAt: "",
    location: "",
    visibility: "family",
  });

  if (!event) return null;

  const meta = EVENT_TYPE_MAP[event.type] || EVENT_TYPE_MAP.other;
  const date = new Date(event.startAt);

  const handleEditClick = () => {
    setFormData({
      title: event.title,
      description: event.description || "",
      type: event.type,
      startAt: new Date(event.startAt).toISOString().slice(0, 16),
      endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "",
      location: event.location || "",
      visibility: event.visibility || "family",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startAt: new Date(formData.startAt).toISOString(),
        visibility: formData.visibility,
      };
      if (formData.endAt) {
        payload.endAt = new Date(formData.endAt).toISOString();
      }
      if (formData.location) {
        payload.location = formData.location;
      }
      await api.patch(`/events/${event._id}`, payload);
      setIsEditing(false);
      onUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DDD1] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#2F1D12]">Event Details</h2>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <button
                  onClick={handleEditClick}
                  className="p-2 text-[#8B5E3C] hover:text-[#4A3428] hover:bg-[#F5EFE6] rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(event)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 text-[#8B5E3C] hover:text-[#4A3428] hover:bg-[#F5EFE6] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">End Date & Time (optional)</label>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Gogo's Farm, Rwanda"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
                >
                  <option value="family">Family</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2F1D12]">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Event Type Badge & Title */}
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: meta.color }}
                >
                  <span className="text-xs font-medium uppercase leading-none">{date.toLocaleString("default", { month: "short" })}</span>
                  <span className="text-2xl font-bold leading-none mt-0.5">{date.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#2F1D12] leading-tight">{event.title}</h3>
                  <span
                    className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full mt-1.5"
                    style={{ color: meta.color, backgroundColor: meta.bg }}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-[#72543E] leading-relaxed">{event.description}</p>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-1 gap-3">
                {event.startAt && (
                  <div className="flex items-center gap-2.5 text-sm text-[#72543E]">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9A8777]">Time</p>
                      <p className="font-medium text-[#2F1D12]">
                        {formatTime(event.startAt)}
                        {event.endAt ? ` - ${formatTime(event.endAt)}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-2.5 text-sm text-[#72543E]">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9A8777]">Location</p>
                      <p className="font-medium text-[#2F1D12]">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.relatedMemberId && (
                  <div className="flex items-center gap-2.5 text-sm text-[#72543E]">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9A8777]">Related Member</p>
                      <p className="font-medium text-[#2F1D12]">{event.relatedMemberId.fullName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-sm text-[#72543E]">
                  <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#9A8777]">Visibility</p>
                    <p className="font-medium text-[#2F1D12] capitalize">{event.visibility}</p>
                  </div>
                </div>

                {event.createdBy && (
                  <div className="flex items-center gap-2.5 text-sm text-[#72543E]">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9A8777]">Created By</p>
                      <p className="font-medium text-[#2F1D22]">{event.createdBy.fullName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="pt-3 border-t border-[#E5DDD1] space-y-1">
                <p className="text-[11px] text-[#9A8777]">
                  Created: {new Date(event.createdAt).toLocaleDateString()}
                </p>
                <p className="text-[11px] text-[#9A8777]">
                  Last updated: {new Date(event.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="px-6 py-4 border-t border-[#E5DDD1] flex gap-3 flex-shrink-0">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#E5DDD1] text-sm font-medium text-[#2F1D12] hover:bg-[#F5EFE6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.title.trim() || !formData.startAt}
              className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
