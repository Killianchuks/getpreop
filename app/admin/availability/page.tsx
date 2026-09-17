"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  RefreshCw,
  Sparkles,
  UserCheck,
} from "lucide-react";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const standardTimeSlots = [
  "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

interface Slot {
  id: string;
  date: string;
  time: string;
  durationMin: number;
  isBooked: boolean;
  bookedByName?: string | null;
  bookedByEmail?: string | null;
  bookedByOrg?: string | null;
  notes?: string | null;
}

export default function AdminAvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calendar State
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));

  // Recurring generator state
  const [recurringStart, setRecurringStart] = useState(today.toISOString().slice(0, 10));
  const [recurringEnd, setRecurringEnd] = useState(
    new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [selectedRecurringDays, setSelectedRecurringDays] = useState<string[]>([
    "Mon", "Tue", "Wed", "Thu", "Fri"
  ]);
  const [selectedRecurringTimes, setSelectedRecurringTimes] = useState<string[]>([
    "9:00 AM", "10:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"
  ]);

  async function fetchSlots() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/demo-availability");
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Failed to load demo availability:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSlots();
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();

  function changeMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  const slotsForSelectedDate = useMemo(() => {
    return slots.filter((s) => s.date === selectedDate);
  }, [slots, selectedDate]);

  const datesWithSlots = useMemo(() => {
    const map = new Map<string, { total: number; booked: number }>();
    slots.forEach((s) => {
      const current = map.get(s.date) || { total: 0, booked: 0 };
      current.total++;
      if (s.isBooked) current.booked++;
      map.set(s.date, current);
    });
    return map;
  }, [slots]);

  async function toggleSlotTime(time: string) {
    const existing = slotsForSelectedDate.find((s) => s.time === time);
    setSaving(true);
    setFeedback(null);

    try {
      if (existing) {
        // Delete slot
        const res = await fetch("/api/admin/demo-availability", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id }),
        });
        if (res.ok) {
          setSlots((prev) => prev.filter((s) => s.id !== existing.id));
        }
      } else {
        // Add slot
        const res = await fetch("/api/admin/demo-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_slots",
            slots: [{ date: selectedDate, time, durationMin: 15 }],
          }),
        });
        if (res.ok) {
          await fetchSlots();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyRecurring() {
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/demo-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply_recurring",
          startDate: recurringStart,
          endDate: recurringEnd,
          days: selectedRecurringDays,
          times: selectedRecurringTimes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message || "Recurring availability slots generated successfully.");
        await fetchSlots();
      } else {
        alert(data.error || "Failed to generate slots.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleClearDateSlots() {
    if (!window.confirm(`Clear all unbooked slots for ${selectedDate}?`)) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/demo-availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      if (res.ok) {
        await fetchSlots();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const formattedSelectedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${selectedDate}T12:00:00`));

  return (
    <main className="w-full max-w-none px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-semibold text-teal-800 hover:text-teal-950">
              Operations
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-500">Platform Availability</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin & Demo Availability
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Set available meeting hours for partners and prospective facilities to book 1-on-1 demo walkthroughs with Dr. Jessica Onwudiwe.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/book-demo"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            View Public Booking Page &rarr;
          </Link>
          <button
            onClick={() => fetchSlots()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Main Grid: Month Calendar & Day Slot Configurator */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Month Calendar */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-teal-800" />
              <h2 className="font-bold text-slate-900">
                {monthNames[month]} {year}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs">
            {weekdayNames.map((d) => (
              <div key={d} className="py-1 font-bold text-slate-400 text-[10px] uppercase">
                {d}
              </div>
            ))}
            {Array.from({ length: leadingDays }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDate === dateStr;
              const stats = datesWithSlots.get(dateStr);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[52px] rounded-lg border p-1 text-xs font-medium transition flex flex-col justify-between text-left ${
                    isSelected
                      ? "border-teal-700 bg-teal-50/50 ring-2 ring-teal-600"
                      : "border-slate-200 hover:border-teal-300 bg-white"
                  }`}
                >
                  <span className={`font-semibold ${isSelected ? "text-teal-900" : "text-slate-800"}`}>{day}</span>
                  {stats && (
                    <div className="mt-1 flex flex-col text-[9px] font-bold">
                      <span className="text-teal-700">{stats.total} open</span>
                      {stats.booked > 0 && <span className="text-amber-700">{stats.booked} booked</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Day Slots Customizer */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Hours for Selected Date</p>
                <h3 className="text-base font-bold text-slate-900">{formattedSelectedDate}</h3>
              </div>
              {slotsForSelectedDate.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDateSlots}
                  className="rounded text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear Date
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Click any time slot below to toggle availability on this date:
            </p>

            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {standardTimeSlots.map((time) => {
                const existing = slotsForSelectedDate.find((s) => s.time === time);
                const isBooked = existing?.isBooked;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isBooked || saving}
                    onClick={() => toggleSlotTime(time)}
                    className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                      isBooked
                        ? "border-amber-200 bg-amber-50 text-amber-900 opacity-80 cursor-not-allowed"
                        : existing
                        ? "border-teal-800 bg-teal-800 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50"
                    }`}
                  >
                    {time}
                    {isBooked ? " (Booked)" : existing ? " ✓" : ""}
                  </button>
                );
              })}
            </div>

            {/* Bookings on this date */}
            {slotsForSelectedDate.some((s) => s.isBooked) && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Scheduled Demos for this day
                </p>
                <div className="mt-2 space-y-2">
                  {slotsForSelectedDate.filter((s) => s.isBooked).map((b) => (
                    <div key={b.id} className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 text-xs">
                      <p className="font-bold text-slate-900">{b.bookedByName} &bull; {b.time}</p>
                      <p className="text-slate-600">{b.bookedByEmail} {b.bookedByOrg ? `(${b.bookedByOrg})` : ""}</p>
                      {b.notes && <p className="mt-1 text-slate-500 italic">&ldquo;{b.notes}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            All slots are 15-minute demo calls scheduled in US Central Time (CT).
          </div>
        </section>
      </div>

      {/* Recurring Schedule Generator */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-800" />
          <h2 className="text-base font-bold text-slate-900">Bulk Recurring Availability Generator</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Quickly populate open demo slots across multiple weeks or months:
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600">Start Date</label>
            <input
              type="date"
              value={recurringStart}
              onChange={(e) => setRecurringStart(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600">End Date</label>
            <input
              type="date"
              value={recurringEnd}
              onChange={(e) => setRecurringEnd(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold uppercase text-slate-600">Days of Week</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const isSelected = selectedRecurringDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setSelectedRecurringDays((prev) =>
                        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                      )
                    }
                    className={`rounded px-2.5 py-1 text-xs font-semibold ${
                      isSelected ? "bg-teal-800 text-white" : "border border-slate-200 text-slate-700 bg-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-semibold uppercase text-slate-600">Slots to Generate</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {standardTimeSlots.map((time) => {
              const isSelected = selectedRecurringTimes.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() =>
                    setSelectedRecurringTimes((prev) =>
                      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
                    )
                  }
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    isSelected ? "bg-teal-800 text-white" : "border border-slate-200 text-slate-700 bg-white"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleApplyRecurring}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-xs font-bold text-white hover:bg-teal-900 transition disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate Recurring Demo Slots
          </button>
        </div>
      </div>
    </main>
  );
}
