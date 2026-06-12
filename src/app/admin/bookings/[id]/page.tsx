import Link from 'next/link';
import { BadgeDollarSign, Calendar, CalendarClock, CheckCircle2, Clock, FileText, Info as InfoIcon, MapPin, MessageCircle, MessageSquareText, Navigation, Phone, Save, Trash2, User, UserRoundCheck, XCircle } from 'lucide-react';
import { getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { BookingTimeline } from '@/components/admin/BookingTimeline';
import { AdminShell } from '@/components/admin/DashboardShell';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { assignTechnician, deleteBooking, updateBookingFields, updateBookingStatus } from '@/features/bookings/actions';
import { getAdminBookings, getBookingByOrderId, getBookingEvents, getServicesForSelect } from '@/features/bookings/queries';
import { getAllowedStatusTransitions } from '@/features/bookings/status-machine';
import { getTechnicians } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function BookingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  await requireRole(['admin']);
  const booking = await getBookingByOrderId(id).catch(() => null);

  if (!booking) {
    return (
      <AdminShell title="Order could not load" eyebrow="Booking detail" description="The order link may be old, deleted, or temporarily unavailable.">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-extrabold text-amber-900">This order could not be opened.</p>
          <p className="mt-2 text-sm font-semibold text-amber-800">
            Go back to the booking queue and open the order again. If it still fails, the order may have been deleted.
          </p>
          <Link href="/admin/bookings" className="mt-4 inline-flex rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white">
            Back to bookings
          </Link>
        </div>
      </AdminShell>
    );
  }

  const [technicians, events, serviceOptions, allBookings] = await Promise.all([
    getTechnicians().catch(() => []),
    getBookingEvents(booking.id).catch(() => []),
    getServicesForSelect().catch(() => []),
    getAdminBookings().catch(() => [])
  ]);
  const activeCounts = getActiveBookingCounts(allBookings);
  const allowedActions = getAllowedStatusTransitions(booking.status, 'admin');
  const canConfirm = allowedActions.includes('confirmed');
  const canAssign = allowedActions.includes('assigned');
  const canCancel = allowedActions.includes('cancelled');

  return (
    <AdminShell title={booking.order_id} eyebrow="Booking detail" description="Confirm the customer request, assign a technician, and keep the service status accurate.">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {resolvedSearchParams.created === '1' ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                <CheckCircle2 className="size-5" aria-hidden="true" />
                Order created successfully
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                This order is pending. Confirm it first, then assign a technician.
              </p>
            </div>
          ) : null}

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
                  <a href={`tel:${booking.customer_phone}`} className="inline-flex items-center gap-2 text-[#0B2A4A] hover:text-[#2EA9D6]">
                    <Phone className="size-4" aria-hidden="true" />
                    {booking.customer_phone}
                  </a>
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
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <a href={`tel:${booking.customer_phone}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6] hover:text-[#2EA9D6]">
                  <Phone className="size-4" aria-hidden="true" />
                  Call
                </a>
                <a href={customerWhatsAppUrl(booking.customer_phone, booking.order_id)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6] hover:text-[#2EA9D6]">
                  <Navigation className="size-4" aria-hidden="true" />
                  Map
                </a>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <MessageSquareText className="size-4" aria-hidden="true" />
                  Customer notes
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{booking.notes || 'No customer notes were added.'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0B2A4A]">
                <Save className="size-5 text-[#2EA9D6]" aria-hidden="true" />
                Edit order
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Update customer details, schedule, service, notes, or final price.</p>
            </div>
            <form action={updateBookingFields} className="grid gap-5 p-5 md:grid-cols-2">
              <input type="hidden" name="bookingId" value={booking.id} />
              <EditField icon={<User size={18} />} name="customerName" defaultValue={booking.customer_name} placeholder="Customer name" required />
              <EditField icon={<Phone size={18} />} name="customerPhone" defaultValue={booking.customer_phone} placeholder="Phone number" required type="tel" />

              <label className="relative block md:col-span-2">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <MapPin size={18} />
                </span>
                <textarea name="address" required rows={2} defaultValue={booking.address} placeholder="Address" className={fieldClassName} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-600">Service</span>
                <select name="serviceId" defaultValue={booking.service_id || ''} className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]">
                  <option value="">General inquiry</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </label>

              <EditField icon={<BadgeDollarSign size={18} />} name="finalPrice" defaultValue={booking.final_price || ''} placeholder="Final price" type="number" min="1" />
              <EditField icon={<Calendar size={18} />} name="preferredDate" defaultValue={booking.preferred_date} required type="date" />
              <EditField icon={<Clock size={18} />} name="preferredTime" defaultValue={booking.preferred_time} required />

              <label className="relative block md:col-span-2">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <FileText size={18} />
                </span>
                <textarea name="notes" rows={3} defaultValue={booking.notes || ''} placeholder="Notes" className={fieldClassName} />
              </label>

              <div className="md:col-span-2">
                <SubmitButton
                  pendingLabel="Saving changes..."
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA] md:w-auto"
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save changes
                </SubmitButton>
              </div>
            </form>
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
              <SubmitButton
                pendingLabel="Confirming..."
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Confirm booking
              </SubmitButton>
            </form>
          ) : null}

          {booking.status === 'pending' ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
              <InfoIcon className="mr-1 inline size-4" aria-hidden="true" />
              Confirm this order first. The technician assignment panel will appear immediately after confirmation.
            </div>
          ) : null}

          {canAssign ? (
            <form action={assignTechnician} className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400" htmlFor="technicianId">
                {booking.assigned_technician_id ? 'Reassign technician' : 'Assign technician'}
              </label>
              <select id="technicianId" name="technicianId" required defaultValue={booking.assigned_technician_id || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]">
                <option value="">{booking.assigned_technician_id ? 'Select new technician' : 'Select technician'}</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.display_name} - {technician.availability_status.replaceAll('_', ' ')} - {activeCounts.get(technician.id) || 0} active
                  </option>
                ))}
              </select>
              <SubmitButton
                pendingLabel={booking.assigned_technician_id ? 'Reassigning...' : 'Assigning...'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123B64]"
              >
                <UserRoundCheck className="size-4" aria-hidden="true" />
                {booking.assigned_technician_id ? 'Reassign technician' : 'Assign technician'}
              </SubmitButton>
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
              <SubmitButton
                pendingLabel="Cancelling..."
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
              >
                <XCircle className="size-4" aria-hidden="true" />
                Cancel booking
              </SubmitButton>
            </form>
          ) : null}

          <form action={deleteBooking} className="mt-5 border-t border-slate-200 pt-5">
            <input type="hidden" name="bookingId" value={booking.id} />
            <SubmitButton
              pendingLabel="Deleting..."
              confirmMessage="Delete this booking permanently? This cannot be undone."
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete order
            </SubmitButton>
          </form>

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

const fieldClassName =
  'min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-[#0B2A4A] outline-none transition placeholder:text-slate-400 focus:border-[#2EA9D6] focus:bg-white focus:ring-2 focus:ring-[#2EA9D6]/20';

function EditField({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input {...props} className={fieldClassName} />
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function customerWhatsAppUrl(phone: string, orderId: string) {
  const normalized = normalizeBdPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(`Assalamu alaikum, Lucky Services Centre here about your booking ${orderId}.`)}`;
}

function normalizeBdPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  return digits;
}
