import Link from 'next/link';
import { BadgeDollarSign, CalendarClock, CheckCircle2, MapPin, MessageSquareText, Phone, UserRoundCheck, XCircle } from 'lucide-react';
import { BookingTimeline } from '@/components/admin/BookingTimeline';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { assignTechnician, updateBookingStatus } from '@/features/bookings/actions';
import { getBookingByOrderId, getBookingEvents } from '@/features/bookings/queries';
import { getAllowedStatusTransitions } from '@/features/bookings/status-machine';
import { getTechnicians } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(['admin']);
  const booking = await getBookingByOrderId(id);
  const [technicians, events] = await Promise.all([getTechnicians(), getBookingEvents(booking.id)]);
  const allowedActions = getAllowedStatusTransitions(booking.status, 'admin');
  const canConfirm = allowedActions.includes('confirmed');
  const canAssign = allowedActions.includes('assigned');
  const canCancel = allowedActions.includes('cancelled');

  return (
    <AdminShell title={booking.order_id} eyebrow="Booking detail" description="Confirm the customer request, assign a technician, and keep the service status accurate.">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Customer order</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{booking.order_id}</h2>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Info label="Customer" value={booking.customer_name} />
              <Info
                label="Phone"
                value={
                  <Link href={`tel:${booking.customer_phone}`} className="inline-flex items-center gap-2 text-[#0B2A4A] hover:text-[#2EA9D6]">
                    <Phone className="size-4" aria-hidden="true" />
                    {booking.customer_phone}
                  </Link>
                }
              />
              <Info label="Service" value={booking.services?.title || booking.service_id || 'General Inquiry'} />
              <Info
                label="Preferred time"
                value={
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                    {formatDate(booking.preferred_date)} / {booking.preferred_time}
                  </span>
                }
              />
              <Info
                label="Address"
                value={
                  <span className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                    {booking.address}
                  </span>
                }
              />
              <Info
                label="Final price"
                value={
                  <span className="inline-flex items-center gap-2">
                    <BadgeDollarSign className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                    {booking.final_price ? `BDT ${booking.final_price}` : 'Not set yet'}
                  </span>
                }
              />
              <Info label="Assigned technician" value={booking.technician_profiles?.display_name || 'Not assigned yet'} />
              <Info label="Source" value={booking.source} />
            </div>

            <div className="border-t border-slate-100 p-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <MessageSquareText className="size-4" aria-hidden="true" />
                  Customer notes
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{booking.notes || 'No customer notes were added.'}</p>
              </div>
            </div>
          </section>

          <BookingTimeline events={events} />
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-[#0B2A4A]">Dispatch actions</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Use this panel after calling the customer.</p>

          {canConfirm ? (
            <form
              action={async () => {
                'use server';
                await updateBookingStatus(booking.id, 'confirmed');
              }}
              className="mt-5"
            >
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Confirm booking
              </button>
            </form>
          ) : null}

          {canAssign ? (
            <form action={assignTechnician} className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400" htmlFor="technicianId">
                Assign technician
              </label>
              <select id="technicianId" name="technicianId" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]">
                <option value="">Select technician</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.display_name}
                  </option>
                ))}
              </select>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123B64]">
                <UserRoundCheck className="size-4" aria-hidden="true" />
                Assign technician
              </button>
            </form>
          ) : null}

          {canCancel ? (
            <form
              action={async () => {
                'use server';
                await updateBookingStatus(booking.id, 'cancelled');
              }}
              className="mt-3"
            >
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-600">
                <XCircle className="size-4" aria-hidden="true" />
                Cancel booking
              </button>
            </form>
          ) : null}

          {!canConfirm && !canAssign && !canCancel ? (
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              No admin action is available for this status.
            </div>
          ) : null}
        </aside>
      </div>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="mt-2 font-bold text-[#0B2A4A]">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
