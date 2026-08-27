"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import InnerLayout from "@/components/layout/InnerLayout";
import AddEventModal from "@/components/modals/AddEventModal";
import EventDetailsModal from "@/components/modals/EventDetailsModal";
import DeleteEventDialog from "@/components/modals/DeleteEventDialog";

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

interface Family {
  familyName: string;
  familyMembers?: { _id: string; fullName: string; email: string }[];
}

const EVENT_TYPES: { value: EventType; label: string; color: string; bg: string; dot: string }[] = [
  { value: "birthday", label: "Birthday", color: "#F97316", bg: "#FFF7ED", dot: "#F97316" },
  { value: "anniversary", label: "Anniversary", color: "#EC4899", bg: "#FDF2F8", dot: "#EC4899" },
  { value: "gathering", label: "Gathering", color: "#22C55E", bg: "#F0FDF4", dot: "#22C55E" },
  { value: "appointment", label: "Appointment", color: "#3B82F6", bg: "#EFF6FF", dot: "#3B82F6" },
  { value: "celebration", label: "Celebration", color: "#A855F7", bg: "#FAF5FF", dot: "#A855F7" },
  { value: "other", label: "Other", color: "#8B5E3C", bg: "#F5EFE6", dot: "#8B5E3C" },
];

const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map((t) => [t.value, t])) as Record<EventType, typeof EVENT_TYPES[number]>;

function getEventTypeMeta(type: EventType | string) {
  return EVENT_TYPE_MAP[type as EventType] || EVENT_TYPE_MAP.other;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatMonthYear(date: Date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const fetchFamily = useCallback(async () => {
    try {
      const result: any = await api.get("/family/my-family");
      if (result.success && result.family) {
        setFamily(result.family);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchEvents = useCallback(async (from: Date, to: Date) => {
    try {
      setError("");
      const fromStr = from.toISOString();
      const toStr = to.toISOString();
      const result: any = await api.get(`/events?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`);
      setEvents(result.events || []);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarStart = new Date(year, month, 1 - getFirstDayOfMonth(firstDay));
    const calendarEnd = new Date(year, month + 1, 30 + (7 - getFirstDayOfMonth(lastDay) - 1));
    fetchEvents(calendarStart, calendarEnd);
  }, [currentMonth, fetchEvents]);

  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; events: Event[] }[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const daysInPrevMonth = getDaysInMonth(new Date(year, month - 1, 1));

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({ date, isCurrentMonth: true, events: [] });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    events.forEach((ev) => {
      const evDate = new Date(ev.startAt);
      const idx = days.findIndex((d) => isSameDay(d.date, evDate));
      if (idx >= 0) {
        days[idx].events.push(ev);
      }
    });

    return days;
  }, [currentMonth, events]);

  const filteredEvents = useMemo(() => {
    if (eventTypeFilter === "all") return events;
    return events.filter((e) => e.type === eventTypeFilter);
  }, [events, eventTypeFilter]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...filteredEvents]
      .filter((e) => new Date(e.startAt) >= now)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 6);
  }, [filteredEvents]);

  const selectedDateEvents = useMemo(() => {
    return events
      .filter((e) => isSameDay(new Date(e.startAt), selectedDate))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleEventCreated = () => {
    setShowCreateModal(false);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarStart = new Date(year, month, 1 - getFirstDayOfMonth(firstDay));
    const calendarEnd = new Date(year, month + 1, 30 + (7 - getFirstDayOfMonth(lastDay) - 1));
    fetchEvents(calendarStart, calendarEnd);
  };

  const handleEventUpdated = () => {
    setSelectedEvent(null);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarStart = new Date(year, month, 1 - getFirstDayOfMonth(firstDay));
    const calendarEnd = new Date(year, month + 1, 30 + (7 - getFirstDayOfMonth(lastDay) - 1));
    fetchEvents(calendarStart, calendarEnd);
  };

  const handleEventDeleted = () => {
    setEventToDelete(null);
    setSelectedEvent(null);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarStart = new Date(year, month, 1 - getFirstDayOfMonth(firstDay));
    const calendarEnd = new Date(year, month + 1, 30 + (7 - getFirstDayOfMonth(lastDay) - 1));
    fetchEvents(calendarStart, calendarEnd);
  };

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <InnerLayout
      title="Family Events"
      subtitle="Birthdays, anniversaries, gatherings and more — all in one place."
      actions={
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3A2E22] active:scale-[0.98] transition-all shadow-lg shadow-[#4A3428]/20"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      }
    >
      <div className="space-y-8">
        {/* Family Context */}
        <div>
          <p className="text-xs text-[#8B5E3C] font-medium">
            {family ? `${family.familyName} · ${family.familyMembers?.length || 0} Members` : "Loading family..."}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 text-red-700 text-sm p-4 rounded-2xl border border-red-100">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const calendarStart = new Date(year, month, 1 - getFirstDayOfMonth(firstDay));
                const calendarEnd = new Date(year, month + 1, 30 + (7 - getFirstDayOfMonth(lastDay) - 1));
                fetchEvents(calendarStart, calendarEnd);
              }}
              className="mt-2 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Calendar Section */}
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#E5DDD1] shadow-sm overflow-hidden">
          {/* Decorative Top Strip */}
          <div className="h-2 bg-[#2F1D12] relative">
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-30">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-[#8B5E3C] hover:text-[#4A3428] hover:bg-[#F5EFE6] rounded-xl transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-[#2F1D12]">{formatMonthYear(currentMonth)}</h2>
              <p className="text-[10px] text-[#9A8777] uppercase tracking-widest font-medium mt-0.5">
                {family ? `${family.familyName.toUpperCase()} CALENDAR` : "FAMILY CALENDAR"}
              </p>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 text-[#8B5E3C] hover:text-[#4A3428] hover:bg-[#F5EFE6] rounded-xl transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-t border-[#E5DDD1]">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-center text-[10px] font-semibold text-[#9A8777] uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-t border-[#E5DDD1]">
            {calendarDays.map((day, idx) => {
              const isSelected = isSameDay(day.date, selectedDate);
              const isCurrentMonth = day.isCurrentMonth;
              const dayEvents = day.events.filter((e) => eventTypeFilter === "all" || e.type === eventTypeFilter);
              const maxDots = 3;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day.date)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-[#E5DDD1] flex flex-col items-start gap-1 transition-colors relative ${
                    isCurrentMonth ? "bg-white hover:bg-[#F5EFE6]/50" : "bg-[#F5EFE6]/30 text-[#9A8777]/60"
                  } ${isSelected ? "bg-[#2F1D12]/5" : ""}`}
                  aria-label={`${day.date.toLocaleDateString()}${dayEvents.length > 0 ? `, ${dayEvents.length} events` : ""}`}
                >
                  <span
                    className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-[#2F1D12] text-white"
                        : isToday(day.date)
                        ? "text-[#2F1D12] font-bold"
                        : "text-[#3A2E22]"
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-auto w-full">
                    {dayEvents.slice(0, maxDots).map((ev, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getEventTypeMeta(ev.type).dot }}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > maxDots && (
                      <span className="text-[8px] text-[#9A8777] font-medium ml-0.5">+{dayEvents.length - maxDots}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-[#E5DDD1]">
            <p className="text-[10px] font-semibold text-[#9A8777] uppercase tracking-widest mb-2.5">Legend</p>
            <div className="flex flex-wrap gap-4">
              {EVENT_TYPES.filter((t) => t.value !== "other").map((t) => (
                <div key={t.value} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.dot }} />
                  <span className="text-xs text-[#72543E]">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDateEvents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#2F1D12] mb-3">
              {selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            <div className="space-y-2">
              {selectedDateEvents.map((ev) => {
                const meta = getEventTypeMeta(ev.type);
                return (
                  <button
                    key={ev._id}
                    onClick={() => setSelectedEvent(ev)}
                    className="w-full flex items-center gap-3 bg-[#FFFDF7] rounded-xl border border-[#E5DDD1] p-3 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: meta.color }}>
                      {new Date(ev.startAt).getDate()}
                      <span className="block text-[8px] font-normal uppercase">{new Date(ev.startAt).toLocaleString("default", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2F1D12] truncate">{ev.title}</p>
                      <p className="text-xs text-[#9A8777]">{formatTime(ev.startAt)}{ev.endAt ? ` - ${formatTime(ev.endAt)}` : ""}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: meta.color, backgroundColor: meta.bg }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Toggle & Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#72543E] uppercase tracking-widest">Upcoming Events</h3>
            <span className="text-xs text-[#9A8777]">{upcomingEvents.length} events this month</span>
          </div>

          {/* Calendar / List Toggle */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-[#2F1D12] text-white"
                  : "bg-[#F5EFE6] text-[#72543E] hover:bg-[#E5DDD1]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-[#2F1D12] text-white"
                  : "bg-[#F5EFE6] text-[#72543E] hover:bg-[#E5DDD1]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>

            {/* Filter */}
            <div className="ml-auto">
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value as EventType | "all")}
                className="text-xs border border-[#E5DDD1] rounded-xl px-3 py-2 bg-white text-[#72543E] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
              >
                <option value="all">All Events</option>
                {EVENT_TYPES.filter((t) => t.value !== "other").map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F5EFE6]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#F5EFE6] rounded w-3/4" />
                      <div className="h-3 bg-[#F5EFE6] rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "calendar" ? (
            /* Calendar Cards View */
            upcomingEvents.length === 0 ? (
              <div className="bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-10 text-center">
                <CalendarDays className="w-12 h-12 text-[#A6987F] mx-auto mb-3" />
                <p className="text-sm text-[#8B5E3C] mb-4">No upcoming events</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-[#4A3428] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#3A2E22] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((ev) => {
                  const meta = getEventTypeMeta(ev.type);
                  const date = new Date(ev.startAt);
                  return (
                    <button
                      key={ev._id}
                      onClick={() => setSelectedEvent(ev)}
                      className="bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-4 text-left hover:shadow-md transition-all group"
                    >
                      <div className="flex gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: meta.color }}
                        >
                          <span className="text-[10px] font-medium uppercase leading-none">
                            {date.toLocaleString("default", { month: "short" })}
                          </span>
                          <span className="text-lg font-bold leading-none mt-0.5">{date.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[#2F1D12] truncate group-hover:text-[#4A3428] transition-colors">
                            {ev.title}
                          </h4>
                          <span
                            className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
                            style={{ color: meta.color, backgroundColor: meta.bg }}
                          >
                            {meta.label}
                          </span>
                          {ev.location && (
                            <p className="flex items-center gap-1 text-[11px] text-[#9A8777] mt-1.5">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{ev.location}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      {ev.description && (
                        <p className="text-xs text-[#9A8777] mt-2.5 line-clamp-2">{ev.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-[#E5DDD1]">
                        <span className="flex items-center gap-1 text-[11px] text-[#9A8777]">
                          <Clock className="w-3 h-3" />
                          {formatTime(ev.startAt)}
                        </span>
                        {ev.relatedMemberId && (
                          <span className="flex items-center gap-1 text-[11px] text-[#9A8777]">
                            <Users className="w-3 h-3" />
                            {ev.relatedMemberId.fullName}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            /* List View */
            upcomingEvents.length === 0 ? (
              <div className="bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-10 text-center">
                <ListFilter className="w-12 h-12 text-[#A6987F] mx-auto mb-3" />
                <p className="text-sm text-[#8B5E3C]">No matching events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((ev) => {
                  const meta = getEventTypeMeta(ev.type);
                  const date = new Date(ev.startAt);
                  return (
                    <button
                      key={ev._id}
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full flex items-center gap-4 bg-[#FFFDF7] rounded-2xl border border-[#E5DDD1] p-4 text-left hover:shadow-md transition-all"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        <span className="text-[10px] font-medium uppercase leading-none">
                          {date.toLocaleString("default", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold leading-none mt-0.5">{date.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-[#2F1D12] truncate">{ev.title}</h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: meta.color, backgroundColor: meta.bg }}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-[#9A8777]">
                            <Clock className="w-3 h-3" />
                            {formatTime(ev.startAt)}
                            {ev.endAt ? ` - ${formatTime(ev.endAt)}` : ""}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 text-[11px] text-[#9A8777]">
                              <MapPin className="w-3 h-3" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="text-xs text-[#9A8777] mt-1 line-clamp-1">{ev.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#9A8777]">{formatDate(ev.startAt)}</p>
                        {ev.relatedMemberId && (
                          <p className="text-[11px] text-[#9A8777] mt-0.5">{ev.relatedMemberId.fullName}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEventModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEventToEdit(null)
        }}
        onSuccess={() => {
          handleEventCreated()
          setEventToEdit(null)
        }}
        event={eventToEdit}
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(ev) => {
          setSelectedEvent(null)
          setEventToEdit(ev)
          setShowCreateModal(true)
        }}
        onDelete={(ev) => {
          setSelectedEvent(null)
          setEventToDelete(ev)
        }}
        onUpdated={handleEventUpdated}
      />

      <DeleteEventDialog
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        onDeleted={handleEventDeleted}
      />
    </InnerLayout>
  );
}
