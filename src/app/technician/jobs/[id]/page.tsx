import Link from 'next/link';
import { CalendarClock, CheckCircle2, ClipboardCheck, ExternalLink, MapPin, MessageSquareText, Phone, UserRound } from 'lucide-react';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatDateLong, formatTaka, getTechnicianStatusStyle, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
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
          <h1 className="text-xl font-black text-[#000D32]">Job could not be opened</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">
            This job is not assigned to your technician profile, or the order is no longer active.
          </p>
          <Link href="/technician/dashboard" className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-[#000D32] px-5 text-sm font-black text-white">
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
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
          Schedule updated successfully.
        </div>
      ) : null}

      <TechnicianCard accent={status.accent} className="p-6 pl-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Order ID</p>
            <h1 className="mt-3 text-2xl font-black tracking-normal text-[#000D32]">{job.order_id}</h1>
          </div>
          <div className="grid gap-3 justify-items-end">
            <TechnicianStatusBadge status={job.status} />
            {canUpdateJob ? (
              <Link href={`/technician/jobs/${job.order_id}/reschedule`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#000D32] px-4 text-sm font-bold text-[#000D32]">
                <CalendarClock className="size-4" aria-hidden="true" />
                Reschedule
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="flex items-center gap-3 text-base font-medium text-[#191C1E]">
            <CalendarClock className="size-5 text-[#64748B]" aria-hidden="true" />
            Booked: {formatDateLong(job.preferred_date)}, {job.preferred_time}
          </p>
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-0">
        <div className="flex min-h-36 items-center justify-center bg-[#E9F0F8]">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#000D32] text-white shadow-xl">
            <MapPin className="size-8" aria-hidden="true" />
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E9F0F8] text-[#000D32]">
                <UserRound className="size-8" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Customer</p>
                <h2 className="mt-1 truncate text-2xl font-black text-[#000D32]">{job.customer_name}</h2>
              </div>
            </div>
            <a href={`tel:${job.customer_phone}`} className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#000D32] text-white shadow-lg" aria-label="Call customer">
              <Phone className="size-7" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-[#F7F9FB] p-5">
            <p className="flex items-start gap-3 text-base font-medium leading-7 text-[#191C1E]">
              <MapPin className="mt-1 size-5 shrink-0 text-[#64748B]" aria-hidden="true" />
              {job.address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#000D32]"
            >
              Open in Maps <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Service Summary</p>
        <div className="mt-4 border-t border-slate-200 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black leading-8 text-[#191C1E]">{serviceTitle}</h2>
              <p className="mt-3 flex items-center gap-2 text-base font-medium text-[#191C1E]">
                <CalendarClock className="size-5" aria-hidden="true" />
                {formatDateLong(job.preferred_date)} • {job.preferred_time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">Amount</p>
              <p className="mt-2 text-3xl font-black text-[#000D32]">{formatTaka(job.final_price)}</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-[#E9F0F8] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#000D32]">Scope of work</p>
            <div className="mt-4 grid gap-3 text-base font-medium text-[#191C1E]">
              <p className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-[#000D32]" aria-hidden="true" />
                Customer confirmed problem
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-[#000D32]" aria-hidden="true" />
                Service completed or issue noted
              </p>
            </div>
          </div>
        </div>
      </TechnicianCard>

      {canUpdateJob && progressActions.length > 0 ? (
        <TechnicianCard className="mt-6 p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Job Progress</p>
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
        <TechnicianCard className="mt-6 p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Notes</p>
          <form action={addTechnicianJobNote} className="mt-4 space-y-4">
            <input type="hidden" name="bookingId" value={job.id} />
            <select
              name="noteType"
              defaultValue="field_note"
              className="min-h-14 w-full rounded-xl border border-slate-200 bg-[#E9F0F8] px-4 text-base font-bold text-[#000D32] outline-none focus:border-[#000D32]"
            >
              <option value="field_note">Field note</option>
              <option value="customer_not_reachable">Customer not reachable</option>
              <option value="customer_requested_change">Customer requested change</option>
              <option value="parts_required">Parts required</option>
              <option value="extra_work_found">Extra work found</option>
            </select>
            <textarea
              name="technicianNote"
              required
              rows={4}
              placeholder="Add internal comments or job notes here..."
              className="w-full rounded-xl border border-slate-200 bg-[#E9F0F8] p-4 text-base font-medium leading-7 text-[#000D32] outline-none focus:border-[#000D32]"
            />
            <SubmitButton pendingLabel="Adding note..." className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#000D32] px-5 text-base font-black text-white">
              <MessageSquareText className="size-5" aria-hidden="true" />
              Add Note
            </SubmitButton>
          </form>
        </TechnicianCard>
      ) : null}

      {allowedActions.includes('completed') ? (
        <TechnicianCard className="mt-6 p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Complete Job</p>
          <form action={completeTechnicianJob} className="mt-4 space-y-5">
            <input type="hidden" name="bookingId" value={job.id} />
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Reason for price change</span>
              <textarea
                name="priceChangeReason"
                rows={3}
                placeholder="Explain why the final price is different..."
                className="w-full rounded-xl border border-slate-200 bg-[#E9F0F8] p-4 text-base font-medium leading-7 text-[#000D32] outline-none focus:border-[#000D32]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Completion note</span>
              <textarea
                name="completionNote"
                required
                rows={3}
                placeholder="What was done?"
                className="w-full rounded-xl border border-slate-200 bg-[#E9F0F8] p-4 text-base font-medium leading-7 text-[#000D32] outline-none focus:border-[#000D32]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Final amount</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-[#000D32]">৳</span>
                <input
                  name="finalPrice"
                  type="number"
                  min="1"
                  required={!job.final_price}
                  defaultValue={job.final_price || ''}
                  className="min-h-16 w-full rounded-xl border border-slate-200 bg-[#E9F0F8] pl-12 pr-4 text-2xl font-medium text-[#000D32] outline-none focus:border-[#000D32]"
                />
              </div>
            </label>
            <SubmitButton
              pendingLabel="Completing..."
              confirmMessage="Mark this job as completed? This action cannot be undone."
              className="inline-flex min-h-16 w-full items-center justify-center rounded-xl bg-[#000D32] text-xl font-black text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]"
            >
              Complete Job
            </SubmitButton>
          </form>
        </TechnicianCard>
      ) : null}

      <TechnicianCard className="mt-6 p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Activity History</p>
        <div className="mt-4 grid gap-3">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="rounded-2xl bg-[#F7F9FB] p-4">
              <p className="text-sm font-black capitalize text-[#000D32]">{event.event_type.replaceAll('_', ' ')}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-[#64748B]">{event.note || 'No note added.'}</p>
            </div>
          ))}
        </div>
      </TechnicianCard>
    </TechnicianShell>
  );
}

function StatusAction({ bookingId, status, label, pendingLabel }: { bookingId: string; status: string; label: string; pendingLabel: string }) {
  return (
    <form
      action={async () => {
        'use server';
        await updateBookingStatus(bookingId, status);
      }}
    >
      <SubmitButton pendingLabel={pendingLabel} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#000D32] px-5 text-base font-black text-white">
        <ClipboardCheck className="size-5" aria-hidden="true" />
        {label}
      </SubmitButton>
    </form>
  );
}
