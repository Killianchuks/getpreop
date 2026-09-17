"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  User,
  Mail,
  Building,
  Check,
  ArrowRight,
} from "lucide-react";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
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
  meetingUrl?: string | null;
}

export default function BookDemoPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar navigation
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Booking Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Slot | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchSlots() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/demo-availability");
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Failed to load demo slots:", err);
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

  const availableSlotsForDate = useMemo(() => {
    return slots.filter((s) => s.date === selectedDate && !s.isBooked);
  }, [slots, selectedDate]);

  const datesWithSlots = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => {
      if (!s.isBooked) set.add(s.date);
    });
    return set;
  }, [slots]);

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address (e.g. name@company.com).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/demo-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book_slot",
          slotId: selectedSlot.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          organization: organization.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking failed.");
      }

      setBookingSuccess(data.slot || selectedSlot);
      setEmailWarning(data.confirmationEmailSent === false ? data.message : null);
      fetchSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error booking demo.");
    } finally {
      setSubmitting(false);
    }
  }

  const formattedSelectedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${selectedDate}T12:00:00`));

  return (
    <main className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
            <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            1-on-1 Preoperative Optimization Demo
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Schedule a Demo with Dr. Jessica Onwudiwe, MD
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
            Founder & CEO of GetPreOp &bull; University of Chicago Trained Anesthesiologist. Discover how virtual preoperative optimization eliminates same-day surgery cancellations.
          </p>
        </div>

        {bookingSuccess ? (
          <div className="mt-10 rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Demo Walkthrough Confirmed!</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              A calendar invite and meeting details have been emailed to <strong>{email}</strong>.
            </p>

            {emailWarning && (
              <p className="mx-auto mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
                {emailWarning}
              </p>
            )}

            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-left text-xs text-slate-700">
              <p><strong>Host:</strong> Dr. Jessica Onwudiwe, MD</p>
              <p className="mt-1"><strong>Date:</strong> {formattedSelectedDate}</p>
              <p className="mt-1"><strong>Time:</strong> {bookingSuccess.time} (Central Time / CT)</p>
              <p className="mt-1"><strong>Duration:</strong> 15 minutes</p>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              {bookingSuccess.meetingUrl && (
                <a
                  href={bookingSuccess.meetingUrl}
                  className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition"
                >
                  Join Video Call
                </a>
              )}
              <Link
                href="/"
                className="rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-900 transition"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Calendar & Slot Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-800" />
                  <h2 className="font-bold text-slate-900">Select a Date & Time</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-800 min-w-[110px] text-center">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Month Day Grid */}
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
                  const hasSlots = datesWithSlots.has(dateStr);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`h-9 rounded-lg text-xs font-medium transition flex flex-col items-center justify-center relative ${
                        isSelected
                          ? "bg-teal-800 text-white font-bold"
                          : hasSlots
                          ? "bg-teal-50 text-teal-900 hover:bg-teal-100 font-semibold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                      {hasSlots && !isSelected && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-teal-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Available Time Slots for Selected Date */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Slots for {formattedSelectedDate}
                </p>

                {loading ? (
                  <p className="mt-3 text-xs text-slate-400">Loading availability...</p>
                ) : availableSlotsForDate.length === 0 ? (
                  <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    No open demo slots for this date. Please pick another date.
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {availableSlotsForDate.map((slot) => {
                      const isChosen = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            isChosen
                              ? "border-teal-800 bg-teal-800 text-white"
                              : "border-slate-200 bg-white text-slate-800 hover:border-teal-600 hover:bg-teal-50/50"
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-800" />
                  Your Contact Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fill in your information to reserve your 15-minute 1-on-1 demo.
                </p>

                {selectedSlot && (
                  <div className="mt-4 rounded-lg bg-teal-50 border border-teal-200 p-3 text-xs text-teal-900">
                    <p className="font-semibold">Selected Slot:</p>
                    <p className="mt-0.5">{formattedSelectedDate} at {selectedSlot.time} (CT)</p>
                  </div>
                )}

                <form id="booking-form" onSubmit={handleConfirmBooking} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-600">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Jane Smith"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-600">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jsmith@hospital.com"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-600">Facility / Surgery Center</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Chicago Surgical Specialists"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-600">Notes / Questions (Optional)</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specific workflows or cancellation challenges you'd like to address..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                </form>

                {error && (
                  <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  form="booking-form"
                  disabled={!selectedSlot || submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-900 disabled:opacity-50 transition"
                >
                  {submitting ? "Confirming..." : "Confirm 15-Minute Demo Walkthrough"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
