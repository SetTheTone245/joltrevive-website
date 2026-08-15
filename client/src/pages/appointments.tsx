import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isBefore, addMonths, parseISO, addDays,
} from "date-fns";
import { Link } from "wouter";
import {
  Calendar, Clock, Upload, X, CheckCircle2, ChevronLeft, ChevronRight,
  Zap, Stethoscope, Wrench, Hammer, Battery, MessageSquare, FileImage,
} from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAppointment, type Appointment, type AppointmentInput } from "@/lib/staticApi";

const SERVICES = [
  { id: "diagnostic", label: "Diagnostic", icon: Stethoscope },
  { id: "repair", label: "Repair", icon: Wrench },
  { id: "rebuild", label: "Rebuild", icon: Hammer },
  { id: "replacement", label: "Replacement", icon: Battery },
  { id: "consultation", label: "Consultation", icon: MessageSquare },
];

const SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

// deterministic slot availability per date so it feels "live" but stable
function slotUnavailable(date: Date, slotIndex: number): boolean {
  const seed = date.getDate() + slotIndex * 7;
  return (seed * 13) % 5 === 0;
}

export function AppointmentsPage() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const [service, setService] = useState(params.get("service") || "diagnostic");
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation<Appointment, Error, AppointmentInput>({
    mutationFn: (data) => createAppointment(data),
  });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canSubmit = selectedDate && slot && name && email && phone && !mutation.isPending;

  const submitData: AppointmentInput = { service: SERVICES.find((s) => s.id === service)?.label || "Diagnostic", date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "", time: slot || "", name, email, phone, notes };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(submitData);
  };

  return (
    <PageLayout>
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Calendar className="size-3.5" /> Appointment Scheduler</span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Schedule service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pick a service, date, and time. Upload photos of your battery so we can prepare.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {mutation.data ? (
          <div className="rounded-xl border border-status-online/40 bg-status-online/5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-online/15"><CheckCircle2 className="size-8 text-status-online" /></div>
            <h2 className="mt-4 font-display text-xl font-semibold">Appointment booked</h2>
            <p className="mt-1 text-sm text-muted-foreground">{mutation.data.service} on {format(parseISO(mutation.data.date), "MMM d, yyyy")} at {mutation.data.time}</p>
            <p className="mt-4 font-mono text-lg font-semibold text-primary" data-testid="appt-confirmation">{mutation.data.confirmation}</p>
            <p className="mt-2 text-xs text-muted-foreground">Save this confirmation number. We'll also email a reminder to {mutation.data.email}.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/repair/track"><Button variant="outline" className="gap-2">Track a repair</Button></Link>
              <Button onClick={() => { mutation.reset(); setSelectedDate(null); setSlot(null); setFiles([]); setName(""); setEmail(""); setPhone(""); setNotes(""); }} className="gap-2">Book another</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Service */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold"><Stethoscope className="size-4 text-primary" /> Service</label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center hover-elevate ${service === s.id ? "border-primary bg-primary/5" : "border-border"}`}
                    data-testid={`appt-service-${s.id}`}
                  >
                    <s.icon className={`size-5 ${service === s.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Service prices cover labor only — replacement parts are billed separately. A confirmed quote is provided after the $80 diagnostic.
              </p>
            </div>

            {/* Calendar */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold"><Calendar className="size-4 text-primary" /> Date</label>
              <div className="mt-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{format(month, "MMMM yyyy")}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month" data-testid="cal-prev"><ChevronLeft className="size-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month" data-testid="cal-next"><ChevronRight className="size-4" /></Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="text-xs font-medium text-muted-foreground">{d}</span>)}
                  {days.map((day) => {
                    const past = isBefore(day, today);
                    const inMonth = isSameMonth(day, month);
                    const selected = selectedDate && isSameDay(day, selectedDate);
                    const isSunday = day.getDay() === 0;
                    const disabled = past || isSunday;
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={disabled}
                        onClick={() => { setSelectedDate(day); setSlot(null); }}
                        className={`rounded-md py-1.5 text-xs transition-colors ${selected ? "bg-primary text-primary-foreground" : disabled ? "text-muted-foreground/40" : inMonth ? "hover-elevate hover:bg-muted" : "text-muted-foreground/40"}`}
                        data-testid={`cal-day-${format(day, "yyyy-MM-dd")}`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
                {selectedDate && <p className="mt-3 text-center text-xs text-muted-foreground">Selected: <span className="font-medium text-foreground">{format(selectedDate, "EEEE, MMM d")}</span></p>}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold"><Clock className="size-4 text-primary" /> Available times</label>
              {!selectedDate ? (
                <p className="mt-3 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Select a date to see available times.</p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5" data-testid="time-slots">
                  {SLOTS.map((t, i) => {
                    const unavailable = slotUnavailable(selectedDate, i);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={unavailable}
                        onClick={() => setSlot(t)}
                        className={`rounded-md border py-2 text-xs font-medium transition-colors ${slot === t ? "border-primary bg-primary text-primary-foreground" : unavailable ? "border-border text-muted-foreground/40 line-through" : "border-border hover-elevate hover:border-primary/40"}`}
                        data-testid={`slot-${t.replace(/[^a-z0-9]+/gi, "-")}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Photo upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold"><Upload className="size-4 text-primary" /> Upload photos</label>
              <p className="mt-1 text-xs text-muted-foreground">Battery labels, error messages, damaged connectors — helps us prepare. (Demo only — files aren't stored.)</p>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card p-6 text-center hover-elevate" data-testid="appt-upload">
                <FileImage className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload photos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const f = Array.from(e.target.files || []).map((x) => x.name); setFiles((prev) => [...prev, ...f]); }} data-testid="appt-file-input" />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
                      <span className="flex items-center gap-1.5 truncate"><FileImage className="size-3 shrink-0 text-muted-foreground" /> {f}</span>
                      <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}><X className="size-3 text-muted-foreground hover:text-destructive" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input mt-1" data-testid="appt-name" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" className="input mt-1" data-testid="appt-phone" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="input mt-1" data-testid="appt-email" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input mt-1" data-testid="appt-notes" placeholder="Describe the issue, symptoms, when it started…" />
              </div>
            </div>

            {mutation.isError && <p className="text-sm text-destructive">Couldn't book — please try again.</p>}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{selectedDate && slot ? `${format(selectedDate, "MMM d")} at ${slot}` : "Select a date & time"}</p>
              <Button type="submit" size="lg" disabled={!canSubmit} className="gap-2" data-testid="appt-submit">
                {mutation.isPending ? "Booking…" : "Confirm appointment"} <Zap className="size-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
