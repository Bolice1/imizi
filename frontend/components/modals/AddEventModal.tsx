"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

type EventType = "birthday" | "gathering" | "anniversary" | "celebration" | "appointment" | "other";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: {
    _id: string;
    title: string;
    description?: string;
    type: EventType;
    startAt: string;
    endAt?: string;
    location?: string;
    visibility?: string;
  } | null;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "gathering", label: "Gathering" },
  { value: "anniversary", label: "Anniversary" },
  { value: "celebration", label: "Celebration" },
  { value: "appointment", label: "Appointment" },
  { value: "other", label: "Other" },
];

export default function AddEventModal({ isOpen, onClose, onSuccess, event }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("other");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("family");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!event;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("other");
    setStartAt("");
    setEndAt("");
    setLocation("");
    setVisibility("family");
    setError("");
  };

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setType(event.type);
      setStartAt(new Date(event.startAt).toISOString().slice(0, 16));
      setEndAt(event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "");
      setLocation(event.location || "");
      setVisibility(event.visibility || "family");
    } else {
      resetForm();
    }
  }, [event]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !startAt) {
      setError("Title and start date are required");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        type,
        startAt: new Date(startAt).toISOString(),
        visibility,
      };
      if (endAt) {
        payload.endAt = new Date(endAt).toISOString();
      }
      if (location.trim()) {
        payload.location = location.trim();
      }

      if (isEdit && event) {
        await api.patch(`/events/${event._id}`, payload);
      } else {
        await api.post("/events", payload);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? "update" : "add"} event`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] w-full max-w-md max-h-[85vh] flex flex-col shadow-xl">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DDD1] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#2F1D12]">{isEdit ? "Edit Event" : "Add Event"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F5EFE6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#8B5E3C]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="bg-red-50/80 text-red-700 text-sm p-3 rounded-xl border border-red-100 mb-5">
              {error}
            </div>
          )}

          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gogo Nomsa Turns 78"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] placeholder-[#9A8777]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">End Date & Time (optional)</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gogo's Farm, Rwanda"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] placeholder-[#9A8777]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              >
                <option value="family">Family</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#2F1D12]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about the event..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5DDD1] bg-white text-sm text-[#2F1D12] placeholder-[#9A8777]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-[#E5DDD1] flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E5DDD1] text-sm font-medium text-[#2F1D12] hover:bg-[#F5EFE6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={loading}
            className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Event")}
          </button>
        </div>
      </div>
    </div>
  );
}
