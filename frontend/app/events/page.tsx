"use client";

import { useEffect, useState } from "react";
import { Plus, CalendarDays, MapPin, Clock, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import AddEventModal from "@/components/modals/AddEventModal";

interface FamilyEvent {
  _id: string;
  title: string;
  description?: string;
  type: "birthday" | "gathering" | "anniversary" | "other";
  date: string;
  location?: string;
}

const TYPE_LABELS: Record<FamilyEvent["type"], string> = {
  birthday: "Birthday",
  gathering: "Gathering",
  anniversary: "Anniversary",
  other: "Other",
};

export default function EventsPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);

  const openAdd = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEdit = (event: FamilyEvent) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleDelete = async (event: FamilyEvent) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/events/${event._id}`);
      fetchEvents();
    } catch (err: any) {
      console.error("Failed to delete event:", err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await api.get("/events?upcoming=false");
      setEvents(result.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = events
    .filter((e) => new Date(e.date).getTime() < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  const DateBadge = ({ iso }: { iso: string }) => {
    const d = new Date(iso);
    return (
      <div className="w-14 h-14 rounded-2xl bg-[#4A3428] text-white flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-medium uppercase">
          {d.toLocaleString("default", { month: "short" })}
        </span>
        <span className="text-xl font-bold leading-none">{d.getDate()}</span>
      </div>
    );
  };

  const EventCard = ({ event, onEdit, onDelete }: { event: FamilyEvent; onEdit: () => void; onDelete: () => void }) => (
    <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-4 flex items-start gap-4">
      <DateBadge iso={event.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-[#3A2E22] truncate">{event.title}</h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-medium text-[#8B5E3C] bg-[#F5EFE6] px-2 py-0.5 rounded-full whitespace-nowrap">
              {TYPE_LABELS[event.type]}
            </span>
            <button
              onClick={onEdit}
              aria-label="Edit event"
              className="p-1.5 rounded-lg text-[#8B5E3C] hover:bg-[#F5EFE6] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete event"
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#A6987F]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(event.date)} · {formatTime(event.date)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {event.location}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-[#3A2E22] mt-2 line-clamp-2">{event.description}</p>
        )}
      </div>
    </div>
  );

  const actions = (
    <button
      onClick={openAdd}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#4A3428] text-white rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Event
    </button>
  );

  if (loading) {
    return (
      <InnerLayout title="Family Events" subtitle="Loading..." actions={actions}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#EDE3D3] border-t-[#4A3428] rounded-full animate-spin" />
        </div>
      </InnerLayout>
    );
  }

  return (
    <InnerLayout
      title="Family Events"
      subtitle="Keep track of every birthday, gathering, and anniversary your family celebrates."
      actions={actions}
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-[#8B5E3C] uppercase tracking-wider mb-4">
            Upcoming ({upcoming.length})
          </h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((event) => (
                <EventCard key={event._id} event={event} onEdit={() => openEdit(event)} onDelete={() => handleDelete(event)} />
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFDFA] rounded-2xl border border-[#EDE3D3] p-10 text-center">
              <CalendarDays className="w-12 h-12 text-[#A6987F] mx-auto mb-3" />
              <p className="text-sm text-[#8B5E3C] mb-4">No upcoming events</p>
              <p className="text-xs text-[#A6987F]">Add an event to start planning your next family moment.</p>
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[#8B5E3C] uppercase tracking-wider mb-4">
              Past Events ({past.length})
            </h2>
            <div className="space-y-3 opacity-80">
              {past.map((event) => (
                <EventCard key={event._id} event={event} onEdit={() => openEdit(event)} onDelete={() => handleDelete(event)} />
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8B5E3C] mb-4">No events yet</p>
            <p className="text-xs text-[#A6987F]">Add your first family event to see it here.</p>
          </div>
        )}
      </div>

      <AddEventModal
        isOpen={showEventModal}
        event={editingEvent}
        onClose={() => setShowEventModal(false)}
        onSuccess={fetchEvents}
      />
    </InnerLayout>
  );
}
