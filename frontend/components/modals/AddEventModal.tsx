"use client";

import { useState, useEffect } from "react";
import { X, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";

interface FamilyEvent {
  _id: string;
  title: string;
  description?: string;
  type: "birthday" | "gathering" | "anniversary" | "other";
  date: string;
  location?: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  event?: FamilyEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AddEventModal({ isOpen, event, onClose, onSuccess }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"birthday" | "gathering" | "anniversary" | "other">("other");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(event);

  useEffect(() => {
    if (!isOpen) return;
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setType(event.type);
      setDate(toLocalInput(event.date));
      setLocation(event.location || "");
    } else {
      setTitle("");
      setDescription("");
      setType("other");
      setDate("");
      setLocation("");
    }
    setError("");
  }, [isOpen, event]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !date) {
      setError("Title and date are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        type,
        date: new Date(date).toISOString(),
        location,
      };
      const data = isEdit
        ? await api.put(`/events/${event!._id}`, payload)
        : await api.post("/events", payload);

      if (!data?.event) {
        setError(data?.message || (isEdit ? "Failed to update event" : "Failed to add event"));
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFDFA] rounded-3xl border border-[#EDE3D3] w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE3D3] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#3A2E22]">{isEdit ? "Edit Event" : "Add Event"}</h2>
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

          <form id="event-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Family Reunion"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about the event..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              >
                <option value="birthday">Birthday</option>
                <option value="gathering">Gathering</option>
                <option value="anniversary">Anniversary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Date *</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#3A2E22]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Grandma's house"
                className="w-full px-3 py-2.5 rounded-xl border border-[#EDE3D3] bg-white text-sm text-[#3A2E22] placeholder-[#A6987F]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-[#EDE3D3] flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#EDE3D3] text-sm font-medium text-[#3A2E22] hover:bg-[#F5EFE6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={loading}
            className="flex-1 bg-[#4A3428] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
  </div>
