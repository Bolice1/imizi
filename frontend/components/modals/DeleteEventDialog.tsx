"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

interface Event {
  _id: string;
  title: string;
  type: string;
  startAt: string;
}

interface DeleteEventDialogProps {
  event: Event | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteEventDialog({ event, onClose, onDeleted }: DeleteEventDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/events/${event._id}`);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] w-full max-w-sm shadow-xl">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-[#2F1D12] mb-1">Delete Event</h3>
          <p className="text-sm text-[#72543E] mb-1">
             Are you sure you want to delete <span className="font-medium">&quot;{event.title}&quot;</span>?
          </p>
          <p className="text-xs text-[#9A8777]">This action cannot be undone.</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[#E5DDD1] text-sm font-medium text-[#2F1D12] hover:bg-[#F5EFE6] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
