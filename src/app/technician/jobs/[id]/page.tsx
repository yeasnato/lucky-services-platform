import Link from 'next/link';
import { Calendar, CalendarClock, ClipboardCheck, ExternalLink, MapPin, Phone, Square, UserRound } from 'lucide-react';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatTaka, getTechnicianStatusStyle, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import { addTechnicianJobNote, completeTechnicianJob, updateBookingStatus } from '@/features/bookings/actions';
import { getBookingEvents, getTechnicianBookingByOrderId } from '@/features/bookings/queries';
import { getAllowedStatusTransitions } from '@/features/bookings/status-machine';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianJobPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ rescheduled?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await requireRole(['technician']);
  const job = await getTechnicianBookingByOrderId(id, profile.id).catch(() => null);

  if (!job) {
    return (
      <TechnicianShell title="Job Details" backHref="/technician/jobs">
        <TechnicianCard className="p-6">
          <h1 className="text-xl font-semibold text-[#000D32]">Job could not be opened</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#45464F]">
            This job is not assigned to your technician profile, or the order is no longer active.
          </p>
          <Link href="/technician/dashboard" className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-[#000D32] px-5 text-sm font-semibold text-white">
            Back to dashboard
          </Link>
        </TechnicianCard>
      </TechnicianShell>
    );
  }

  const events = await getBookingEvents(job.id);
  const allowedActions = getAllowedStatusTransitions(job.status, 'technician');
  const progressActions = allowedActions.filter((nextStatus) => ['accepted', 'on_the_way', 'in_progress'].includes(nextStatus));
  const canUpdateJob = !['completed', 'cancelled'].includes(job.status);
  const serviceTitle = job.services?.title || job.service_id || 'General Service';
  const status = getTechnicianStatusStyle(job.status);

  return (
    <TechnicianShell title="Job Details" backHref="/technician/jobs">
      {query?.rescheduled ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          Schedule updated successfully.
        </div>
      ) : null}

      <TechnicianCard accent={status.accent} className="p-4 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#45464F]">Order ID</p>
            <h1 className="mt-3 text-[20px] font-semibold leading-7 tracking-normal text-[#000D32]">{shortOrderId(job.order_id)}</h1>
          </div>
          <div className="grid gap-3 justify-items-end">
            <TechnicianStatusBadge status={job.status} />
            {canUpdateJob ? (
              <Link href={`/technician/jobs/${job.order_id}/reschedule`} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#757680] px-4 text-[11px] font-medium tracking-[0.08em] text-[#191C1E]">
                <Calendar className="size-3.5" aria-hidden="true" />
                Reschedule
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-7 border-t border-[#D8DADC] pt-4">
          <p className="flex items-center gap-3 text-[13px] font-medium tracking-[0.05em] text-[#191C1E]">
            <CalendarClock className="size-4 text-[#45464F]" aria-hidden="true" />
            Booked: {formatDetailSchedule(job.preferred_date, job.preferred_time)}
          </p>
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-0">
        <div
          className="flex min-h-[142px] items-center justify-center bg-[#F2F4F6] bg-cover bg-center"
          style={{ backgroundImage: "linear-gradient(rgba(247,249,251,0.55), rgba(247,249,251,0.55)), url('https://tile.openstreetmap.org/14/12095/6924.png')" }}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#000D32] text-white shadow-[0_10px_20px_rgba(0,13,50,0.28)] ring-4 ring-white">
            <MapPin className="size-7" aria-hidden="true" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#F2F4F6] text-[#000D32]">
                <UserRound className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#45464F]">Customer</p>
                <h2 className="mt-1 truncate text-[20px] font-semibold leading-6 text-[#000D32]">{job.customer_name}</h2>
              </div>
            </div>
            <a href={`tel:${job.customer_phone}`} className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-[#000D32] text-white shadow-[0_8px_16px_rgba(0,13,50,0.18)]" aria-label="Call customer">
              <Phone className="size-6" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-5 rounded-[10px] border border-[#C5C6D0] bg-[#F7F9FB] p-4">
            <p className="flex items-start gap-3 text-[13px] font-medium leading-6 tracking-[0.04em] text-[#191C1E]">
              <MapPin className="mt-1 size-4 shrink-0 text-[#45464F]" aria-hidden="true" />
              {job.address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] text-[#000D32]"
            >
              Open in Maps <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#45464F]">Service Summary</p>
        <div className="mt-4 border-t border-[#D8DADC] pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold leading-7 text-[#191C1E]">{serviceTitle}</h2>
              <p className="mt-3 flex items-center gap-2 text-[13px] font-medium tracking-[0.06em] text-[#191C1E]">
                <Calendar className="size-4" aria-hidden="true" />
                {formatShortDate(job.preferred_date)} • {shortTime(job.preferred_time)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#45464F]">Total Amount</p>
              <p className="mt-2 text-[24px] font-semibold text-[#000D32]">{formatTaka(job.final_price)}</p>
            </div>
          </div>
          <div className="mt-6 rounded-[8px] bg-[#F2F4F6] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#000D32]">Scope of work:</p>
            <div className="mt-4 grid gap-3 text-[13px] font-medium tracking-[0.04em] text-[#191C1E]">
              <p className="flex items-center gap-3">
                <Square className="size-4 text-[#757680]" strokeWidth={1.7} aria-hidden="true" />
                Diagnostic spin cycle test
              </p>
              <p className="flex items-center gap-3">
                <Square className="size-4 text-[#757680]" strokeWidth={1.7} aria-hidden="true" />
                Water inlet valve inspection
              </p>
            </div>
          </div>
        </div>
      </TechnicianCard>

      {canUpdateJob && progressActions.length > 0 ? (
        <TechnicianCard className="mt-6 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#45464F]">Job Progress</p>
          <div className="mt-4 grid gap-3">
            {allowedActions.includes('accepted') ? (
              <StatusAction bookingId={job.id} status="accepted" label="Accept Job" pendingLabel="Accepting..." />
            ) : null}
            {allowedActions.includes('on_the_way') ? (
              <StatusAction bookingId={job.id} status="on_the_way" label="On The Way" pendingLabel="Updating..." />
            ) : null}
            {allowedActions.includes('in_progress') ? (
              <StatusAction bookingId={job.id} status="in_progress" label="Start Work" pendingLabel="Starting..." />
            ) : null}
          </div>
        </TechnicianCard>
      ) : null}

      {canUpdateJob ? (
        <TechnicianCard className="mt-6 p-4">
          <p className="border-b border-[#D8DADC] pb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#45464F]">Notes</p>
          <form action={addTechnicianJobNote} className="mt-4">
            <input type="hidden" name="bookingId" value={job.id} />
            <input type="hidden" name="noteType" value="field_note" />
            <textarea
              name="technicianNote"
              required
              rows={4}
              placeholder="Add internal comments or job notes here..."
              className="w-full rounded-[8px] border border-[#C5C6D0] bg-[#F2F4F6] p-4 text-[13px] font-medium leading-6 tracking-[0.04em] text-[#000D32] outline-none focus:border-[#000D32]"
            />
            <SubmitButton pendingLabel="Adding note..." className="sr-only">
              Add note
            </SubmitButton>
          </form>
        </TechnicianCard>
      ) : null}

      {allowedActions.includes('completed') ? (
        <TechnicianCard className="mt-6 p-4">
          <p className="border-b border-[#D8DADC] pb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#45464F]">Complete Job</p>
          <form action={completeTechnicianJob} className="mt-6 space-y-6">
            <input type="hidden" name="bookingId" value={job.id} />
            <input type="hidden" name="completionNote" value="Job completed by technician." />
            <label className="block">
              <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#45464F]">Reason for price change</span>
              <textarea
                name="priceChangeReason"
                rows={3}
                placeholder="Explain why the final price is different..."
                className="w-full rounded-[8px] border border-[#C5C6D0] bg-[#F2F4F6] p-4 text-[13px] font-medium leading-6 tracking-[0.04em] text-[#000D32] outline-none focus:border-[#000D32]"
              />
            </label>
            <label className="block">
              <span className="mb-3 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#45464F]">Final amount</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-medium text-[#000D32]">৳</span>
                <input
                  name="finalPrice"
                  type="number"
                  min="1"
                  required={!job.final_price}
                  defaultValue={job.final_price || ''}
                  className="min-h-[56px] w-full rounded-[8px] border border-[#C5C6D0] bg-[#F2F4F6] pl-12 pr-4 text-[20px] font-medium text-[#000D32] outline-none focus:border-[#000D32]"
                />
              </div>
            </label>
            <SubmitButton
              pendingLabel="Completing..."
              confirmMessage="Mark this job as completed? This action cannot be undone."
              className="inline-flex min-h-[58px] w-full items-center justify-center rounded-[8px] bg-[#000D32] text-[18px] font-medium tracking-[0.02em] text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]"
            >
              Complete Job
            </SubmitButton>
          </form>
        </TechnicianCard>
      ) : null}

      <TechnicianCard className="mt-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#45464F]">Activity History</p>
        <div className="mt-4 grid gap-3">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="rounded-lg bg-[#F7F9FB] p-4">
              <p className="text-sm font-semibold capitalize text-[#000D32]">{event.event_type.replaceAll('_', ' ')}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-[#45464F]">{event.note || 'No note added.'}</p>
            </div>
          ))}
        </div>
      </TechnicianCard>
    </TechnicianShell>
  );
}

function shortOrderId(orderId: string) {
  return orderId;
}

function shortTime(value: string) {
  return value.includes('(') ? value.split('(')[0].trim() : value;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(new Date(value));
}

function formatDetailSchedule(dateValue: string, timeValue: string) {
  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = dateValue === today ? 'Today' : formatShortDate(dateValue);
  return `${dateLabel}, ${shortTime(timeValue)}`;
}

function StatusAction({ bookingId, status, label, pendingLabel }: { bookingId: string; status: string; label: string; pendingLabel: string }) {
  return (
    <form
      action={async () => {
        'use server';
        await updateBookingStatus(bookingId, status);
      }}
    >
      <SubmitButton pendingLabel={pendingLabel} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded bg-[#000D32] px-5 text-base font-semibold text-white">
        <ClipboardCheck className="size-5" aria-hidden="true" />
        {label}
      </SubmitButton>
    </form>
  );
}
