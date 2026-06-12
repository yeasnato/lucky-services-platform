import Link from 'next/link';
import { BadgeDollarSign, CalendarClock, CalendarDays, CheckCircle2, MapPin, MessageSquareText, NotebookPen, Phone, Route, Wrench } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { addTechnicianJobNote, completeTechnicianJob, rescheduleTechnicianJob, updateBookingStatus } from '@/features/bookings/actions';
import { getTechnicianBookingByOrderId } from '@/features/bookings/queries';
import { getAllowedStatusTransitions } from '@/features/bookings/status-machine';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole(['technician']);
  const job = await getTechnicianBookingByOrderId(id, profile.id).catch(() => null);

  if (!job) {
    return (
      <TechnicianShell>
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-extrabold text-amber-950">Job could not be opened</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
            This job is not assigned to your technician profile, or the order is no longer active.
          </p>
          <Link href="/technician/dashboard" className="mt-4 inline-flex rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white">
            Back to dashboard
          </Link>
        </section>
      </TechnicianShell>
    );
  }

  const allowedActions = getAllowedStatusTransitions(job.status, 'technician');
  const canUpdateJob = !['completed', 'cancelled'].includes(job.status);

  return (
    <TechnicianShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="p-6 pb-0">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Assigned Job</p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{job.order_id}</h1>
            </div>
            <div className="px-6 pt-6 sm:pl-0">
              <StatusBadge status={job.status} />
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Info icon={<Wrench className="size-4" />} label="Service" value={job.services?.title || job.service_id || 'General Inquiry'} />
            <Info icon={<CalendarClock className="size-4" />} label="Schedule" value={`${formatDate(job.preferred_date)} / ${job.preferred_time}`} />
            <Info label="Customer" value={job.customer_name} />
            <Info
              icon={<Phone className="size-4" />}
              label="Phone"
              value={
                <a href={`tel:${job.customer_phone}`} className="text-[#0B2A4A] hover:text-[#2EA9D6]">
                  {job.customer_phone}
                </a>
              }
            />
            <Info
              icon={<MapPin className="size-4" />}
              label="Address"
              value={<span className="leading-6">{job.address}</span>}
              wide
            />
            <Info
              icon={<BadgeDollarSign className="size-4" />}
              label="Final price"
              value={job.final_price ? `BDT ${job.final_price}` : 'Not set yet'}
            />
          </div>

          <div className="border-t border-gray-100 p-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                <MessageSquareText className="size-4" aria-hidden="true" />
                Customer notes
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">{job.notes || 'No customer notes were added.'}</p>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-[#0B2A4A]">Update Status</h2>
          <div className="mt-4 grid gap-2">
            <a href={`tel:${job.customer_phone}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-bold text-[#0B2A4A]">
              <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
              Call customer
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-bold text-[#0B2A4A]"
            >
              <Route className="size-4 text-[#2EA9D6]" aria-hidden="true" />
              Map route
            </a>
          </div>

          {allowedActions.includes('accepted') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'accepted'); }} className="mt-4">
              <SubmitButton pendingLabel="Accepting..." className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Accept Job
              </SubmitButton>
            </form>
          ) : null}
          {allowedActions.includes('on_the_way') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'on_the_way'); }} className="mt-3">
              <SubmitButton pendingLabel="Updating..." className="w-full rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white">
                On The Way
              </SubmitButton>
            </form>
          ) : null}
          {allowedActions.includes('in_progress') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'in_progress'); }} className="mt-3">
              <SubmitButton pendingLabel="Starting..." className="w-full rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white">
                Start Work
              </SubmitButton>
            </form>
          ) : null}
          {allowedActions.includes('completed') ? (
            <form action={completeTechnicianJob} className="mt-4 space-y-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <input type="hidden" name="bookingId" value={job.id} />
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-emerald-700">Final price</span>
                <input
                  name="finalPrice"
                  type="number"
                  min="1"
                  required={!job.final_price}
                  defaultValue={job.final_price || ''}
                  placeholder="Enter final price"
                  className="min-h-[44px] w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-emerald-700">Completion note</span>
                <textarea
                  name="completionNote"
                  required
                  rows={3}
                  placeholder="What was done? Mention price change reason if changed."
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]"
                />
              </label>
              <SubmitButton
                pendingLabel="Completing..."
                confirmMessage="Mark this job as completed? This action cannot be undone."
                className="w-full rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
              >
                Complete Job
              </SubmitButton>
            </form>
          ) : null}
          {allowedActions.length === 0 ? (
            <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm font-semibold text-gray-500">No technician action is available for this status.</p>
          ) : null}
        </aside>
      </div>

      {canUpdateJob ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#F0F9FC] text-[#2EA9D6]">
                <CalendarDays className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#0B2A4A]">Reschedule visit</h2>
                <p className="text-sm font-medium text-gray-500">Use when customer requests a different time or visit must move.</p>
              </div>
            </div>
            <form action={rescheduleTechnicianJob} className="mt-5 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="bookingId" value={job.id} />
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">New date</span>
                <input
                  name="preferredDate"
                  type="date"
                  required
                  defaultValue={job.preferred_date}
                  className="min-h-[46px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">New time</span>
                <input
                  name="preferredTime"
                  required
                  defaultValue={job.preferred_time}
                  placeholder="Morning, afternoon, 3 PM"
                  className="min-h-[46px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Reason</span>
                <textarea
                  name="rescheduleNote"
                  required
                  rows={3}
                  placeholder="Customer requested evening, traffic delay, parts needed, customer not home..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white"
                />
              </label>
              <div className="sm:col-span-2">
                <SubmitButton pendingLabel="Saving schedule..." className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white sm:w-auto">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Save schedule
                </SubmitButton>
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#F0F9FC] text-[#2EA9D6]">
                <NotebookPen className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#0B2A4A]">Add field note</h2>
                <p className="text-sm font-medium text-gray-500">Log call attempts, customer issues, parts needs, or visit updates.</p>
              </div>
            </div>
            <form action={addTechnicianJobNote} className="mt-5 space-y-4">
              <input type="hidden" name="bookingId" value={job.id} />
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Note type</span>
                <select
                  name="noteType"
                  defaultValue="field_note"
                  className="min-h-[46px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white"
                >
                  <option value="field_note">Field note</option>
                  <option value="customer_not_reachable">Customer not reachable</option>
                  <option value="customer_requested_change">Customer requested change</option>
                  <option value="parts_required">Parts required</option>
                  <option value="extra_work_found">Extra work found</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Note</span>
                <textarea
                  name="technicianNote"
                  required
                  rows={4}
                  placeholder="Called customer 3 times, phone off. Waiting for admin follow-up..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white"
                />
              </label>
              <SubmitButton pendingLabel="Adding note..." className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white sm:w-auto">
                <NotebookPen className="size-4" aria-hidden="true" />
                Add note
              </SubmitButton>
            </form>
          </div>
        </section>
      ) : null}
    </TechnicianShell>
  );
}

function Info({
  icon,
  label,
  value,
  wide
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-gray-100 bg-gray-50 p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        {icon ? <span className="text-[#2EA9D6]">{icon}</span> : null}
        {label}
      </p>
      <div className="mt-2 text-sm font-bold text-[#0B2A4A]">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
