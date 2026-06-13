import Link from 'next/link';
import { BadgeDollarSign, Calendar, CalendarClock, CheckCircle2, Clock, FileText, Info as InfoIcon, MapPin, MessageCircle, MessageSquareText, Navigation, Phone, Save, Trash2, User, UserRoundCheck, XCircle } from 'lucide-react';
import { getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { BookingTimeline } from '@/components/admin/BookingTimeline';
import { AdminCard, AdminCardHeader, AdminFieldLabel, adminButtonClass, adminInputClass, formatBdt, normalizeBdPhoneDisplay } from '@/components/admin/AdminUI';
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
        <div className="rounded border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">This order could not be opened.</p>
          <p className="mt-2 text-sm font-medium text-amber-800">
            Go back to the booking queue and open the order again. If it still fails, the order may have been deleted.
          </p>
          <Link href="/admin/bookings" className={`${adminButtonClass.primary} mt-4`}>
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
            <div className="rounded border border-emerald-200 bg-emerald-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="size-5" aria-hidden="true" />
                Order created successfully
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-700">
                This order is pending. Confirm it first, then assign a technician.
              </p>
            </div>
          ) : null}

          <AdminCard>
            <AdminCardHeader
              title={booking.order_id}
              description="Customer order, schedule, pricing, and dispatch context."
              action={<StatusBadge status={booking.status} />}
            />

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Info label="Customer" value={booking.customer_name} />
              <Info
                label="Phone"
                value={
                  <a href={`tel:${booking.customer_phone}`} className="inline-flex items-center gap-2 text-[#000D32] hover:text-[#00677D]">
                    <Phone className="size-4" aria-hidden="true" />
                    {normalizeBdPhoneDisplay(booking.customer_phone)}
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
                    {booking.final_price ? formatBdt(booking.final_price) : 'Not set yet'}
                  </span>
                }
              />
              <Info label="Assigned technician" value={booking.technician_profiles?.display_name || 'Not assigned yet'} />
              <Info label="Source" value={booking.source} />
            </div>

            <div className="border-t border-[#D8DADC] p-6">
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <a href={`tel:${booking.customer_phone}`} className={adminButtonClass.secondary}>
                  <Phone className="size-4" aria-hidden="true" />
                  Call
                </a>
                <a href={customerWhatsAppUrl(booking.customer_phone, booking.order_id)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`} target="_blank" rel="noreferrer" className={adminButtonClass.secondary}>
                  <Navigation className="size-4" aria-hidden="true" />
                  Map
                </a>
              </div>
              <div className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">
                  <MessageSquareText className="size-4" aria-hidden="true" />
                  Customer notes
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#45464F]">{booking.notes || 'No customer notes were added.'}</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader title="Edit order" description="Update customer details, schedule, service, notes, or final price." icon={<Save className="size-4" aria-hidden="true" />} />
            <form action={updateBookingFields} className="grid gap-5 p-5 md:grid-cols-2">
              <input type="hidden" name="bookingId" value={booking.id} />
              <EditField icon={<User size={18} />} name="customerName" defaultValue={booking.customer_name} placeholder="Customer name" required />
              <EditField icon={<Phone size={18} />} name="customerPhone" defaultValue={booking.customer_phone} placeholder="Phone number" required type="tel" />

              <label className="relative block md:col-span-2">
                <span className="absolute left-4 top-3.5 text-[#757680]">
                  <MapPin size={18} />
                </span>
                <textarea name="address" required rows={2} defaultValue={booking.address} placeholder="Address" className={fieldClassName} />
              </label>

              <label className="block">
                <AdminFieldLabel>Service</AdminFieldLabel>
                <select name="serviceId" defaultValue={booking.service_id || ''} className={adminInputClass}>
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
                <span className="absolute left-4 top-3.5 text-[#757680]">
                  <FileText size={18} />
                </span>
                <textarea name="notes" rows={3} defaultValue={booking.notes || ''} placeholder="Notes" className={fieldClassName} />
              </label>

              <div className="md:col-span-2">
                <SubmitButton
                  pendingLabel="Saving changes..."
                  className={`${adminButtonClass.cyan} w-full md:w-auto`}
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save changes
                </SubmitButton>
              </div>
            </form>
          </AdminCard>

          <BookingTimeline events={events} />
        </div>

        <aside className="h-fit rounded-lg border border-[#D8DADC] bg-white p-5 shadow-[0_1px_2px_rgba(18,35,77,0.04)]">
          <h3 className="text-lg font-semibold text-[#000D32]">Dispatch actions</h3>
          <p className="mt-1 text-sm font-medium text-[#45464F]">Use this panel after calling the customer.</p>

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
                className={`${adminButtonClass.cyan} w-full`}
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Confirm booking
              </SubmitButton>
            </form>
          ) : null}

          {booking.status === 'pending' ? (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-800">
              <InfoIcon className="mr-1 inline size-4" aria-hidden="true" />
              Confirm this order first. The technician assignment panel will appear immediately after confirmation.
            </div>
          ) : null}

          {canAssign ? (
            <form action={assignTechnician} className="mt-3 space-y-3 rounded border border-[#D8DADC] bg-[#F7F9FB] p-3">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]" htmlFor="technicianId">
                {booking.assigned_technician_id ? 'Reassign technician' : 'Assign technician'}
              </label>
              <select id="technicianId" name="technicianId" required defaultValue={booking.assigned_technician_id || ''} className={adminInputClass}>
                <option value="">{booking.assigned_technician_id ? 'Select new technician' : 'Select technician'}</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.display_name} - {technician.availability_status.replaceAll('_', ' ')} - {activeCounts.get(technician.id) || 0} active
                  </option>
                ))}
              </select>
              <SubmitButton
                pendingLabel={booking.assigned_technician_id ? 'Reassigning...' : 'Assigning...'}
                className={`${adminButtonClass.primary} w-full`}
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
                className={`${adminButtonClass.secondary} w-full hover:border-rose-200 hover:text-rose-600`}
              >
                <XCircle className="size-4" aria-hidden="true" />
                Cancel booking
              </SubmitButton>
            </form>
          ) : null}

          <form action={deleteBooking} className="mt-5 border-t border-[#D8DADC] pt-5">
            <input type="hidden" name="bookingId" value={booking.id} />
            <SubmitButton
              pendingLabel="Deleting..."
              confirmMessage="Delete this booking permanently? This cannot be undone."
              className={`${adminButtonClass.danger} w-full`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete order
            </SubmitButton>
          </form>

          {!canConfirm && !canAssign && !canCancel ? (
            <div className="mt-5 rounded border border-[#D8DADC] bg-[#F7F9FB] p-4 text-sm font-medium text-[#45464F]">
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
    <div className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">{label}</p>
      <div className="mt-2 font-semibold text-[#000D32]">{value}</div>
    </div>
  );
}

const fieldClassName =
  'min-h-11 w-full rounded border border-[#C5C6D0] bg-[#F7F9FB] py-2 pl-11 pr-3 text-sm font-medium text-[#000D32] outline-none transition placeholder:text-[#757680] focus:border-[#000D32] focus:bg-white focus:ring-2 focus:ring-[#000D32]/10';

function EditField({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757680]">{icon}</span>
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
