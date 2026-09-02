"use client";

import { CalendarDays, ChevronLeft, ChevronRight, CircleOff, Clock } from "lucide-react";
import { useState } from "react";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

function keyForDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AvailabilityPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8);
  const [selectedDate, setSelectedDate] = useState("2026-09-03");
  const [openSlots, setOpenSlots] = useState(new Set(["2026-09-02|9:00 AM", "2026-09-02|10:00 AM", "2026-09-03|9:00 AM", "2026-09-03|10:00 AM", "2026-09-03|2:00 PM", "2026-09-04|1:00 PM"]));
  const [blockedDates, setBlockedDates] = useState(new Set(["2026-09-15"]));
  const [saved, setSaved] = useState(false);
  const [rangeStart, setRangeStart] = useState("2026-09-01");
  const [rangeEnd, setRangeEnd] = useState("2026-12-31");
  const [recurringDays, setRecurringDays] = useState(new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();

  function changeMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function toggleSlot(slot: string) {
    setOpenSlots((current) => {
      const next = new Set(current);
      next.has(slot) ? next.delete(slot) : next.add(slot);
      return next;
    });
    setBlockedDates((current) => { const next = new Set(current); next.delete(selectedDate); return next; });
    setSaved(false);
  }

  function blockSelectedDate() {
    setBlockedDates((current) => new Set(current).add(selectedDate));
    setOpenSlots((current) => new Set([...current].filter((slot) => !slot.startsWith(`${selectedDate}|`))));
    setSaved(false);
  }

  function openAllHours() {
    setBlockedDates((current) => { const next = new Set(current); next.delete(selectedDate); return next; });
    setOpenSlots((current) => new Set([...current, ...timeSlots.map((time) => `${selectedDate}|${time}`)]));
    setSaved(false);
  }

  function applyRecurringSchedule() {
    const start = new Date(`${rangeStart}T12:00:00`);
    const end = new Date(`${rangeEnd}T12:00:00`);
    setOpenSlots((current) => {
      const next = new Set(current);
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateKey = date.toISOString().slice(0, 10);
        if (recurringDays.has(weekdayNames[date.getDay()]) && !blockedDates.has(dateKey)) {
          ["9:00 AM", "10:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"].forEach((time) => next.add(`${dateKey}|${time}`));
        }
      }
      return next;
    });
    setSaved(false);
  }

  const selectedLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${selectedDate}T12:00:00`));
  const monthCells = Array.from({ length: leadingDays + daysInMonth }, (_, index) => index < leadingDays ? null : index - leadingDays + 1);

  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-800">Clinical portal</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Availability</h1><p className="mt-1 text-sm text-slate-500">Click a date to choose its specific appointment hours, or block the day before patients can book it.</p></div><div className="grid gap-6 xl:grid-cols-[1fr_340px]"><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><CalendarDays className="text-teal-800" size={21} /><div><h2 className="font-bold text-slate-900">{monthNames[month]} {year}</h2><p className="text-xs text-slate-500">Select any future day to edit its hours.</p></div></div><div className="flex gap-2"><button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><ChevronLeft size={17} /></button><button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><ChevronRight size={17} /></button></div></div><div className="mt-6 grid grid-cols-7 gap-2">{weekdayNames.map((day) => <div key={day} className="pb-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">{day}</div>)}{monthCells.map((day, index) => { if (!day) return <div key={`empty-${index}`} />; const date = keyForDate(year, month, day); const blocked = blockedDates.has(date); const openCount = [...openSlots].filter((slot) => slot.startsWith(`${date}|`)).length; return <button key={date} type="button" onClick={() => { setSelectedDate(date); setSaved(false); }} className={`aspect-square rounded-lg border p-2 text-left transition ${selectedDate === date ? "border-teal-700 ring-2 ring-teal-100" : "border-slate-200 hover:border-teal-400"} ${blocked ? "bg-rose-50 text-rose-700" : openCount ? "bg-teal-50 text-teal-900" : "bg-white text-slate-600"}`}><span className="font-semibold">{day}</span><span className="mt-2 block text-[10px] font-bold">{blocked ? "Blocked" : openCount ? `${openCount} hrs` : "Closed"}</span></button>; })}</div></section><aside className="h-fit rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-teal-800">Selected day</p><h2 className="mt-2 text-lg font-bold text-slate-900">{selectedLabel}</h2>{blockedDates.has(selectedDate) ? <p className="mt-2 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-800">This date is blocked and cannot be booked.</p> : <p className="mt-2 text-sm text-slate-600">Select the hours when you are available for patient assessments.</p>}<div className="mt-5 grid grid-cols-2 gap-2">{timeSlots.map((time) => { const slot = `${selectedDate}|${time}`; const open = openSlots.has(slot); return <button key={time} type="button" disabled={blockedDates.has(selectedDate)} onClick={() => toggleSlot(slot)} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold disabled:cursor-not-allowed ${open ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 hover:border-teal-500"}`}>{time}</button>; })}</div><div className="mt-5 grid gap-2"><button type="button" onClick={openAllHours} className="rounded-lg border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50">Open all hours</button><button type="button" onClick={blockSelectedDate} className="flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"><CircleOff size={16} /> Block this day</button></div><button type="button" onClick={() => setSaved(true)} className="mt-3 w-full rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">Save availability</button>{saved ? <p className="mt-3 text-sm font-semibold text-teal-800">Availability saved.</p> : null}</aside></div><section className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-teal-800">Recurring schedule</p><h2 className="mt-2 text-lg font-bold text-slate-900">Set a future pattern</h2><p className="mt-1 text-sm text-slate-500">Apply standard weekday hours across a future range, then refine individual days from the calendar.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-medium text-slate-700">Start date<input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><label className="text-sm font-medium text-slate-700">End date<input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><div className="sm:col-span-2"><p className="text-sm font-medium text-slate-700">Available weekdays</p><div className="mt-1.5 flex flex-wrap gap-2">{weekdayNames.map((day) => <button key={day} type="button" onClick={() => setRecurringDays((current) => { const next = new Set(current); next.has(day) ? next.delete(day) : next.add(day); return next; })} className={`rounded-full px-3 py-2 text-xs font-semibold ${recurringDays.has(day) ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}>{day}</button>)}</div></div></div><button type="button" onClick={applyRecurringSchedule} className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Clock size={16} /> Apply standard hours</button></section></div>;
}
