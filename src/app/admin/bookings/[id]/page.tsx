import { AdminShell } from '@/components/admin/DashboardShell';
import { assignTechnician, updateBookingStatus } from '@/features/bookings/actions';
import { getBookingByOrderId } from '@/features/bookings/queries';
import { getTechnicians } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(['admin']);
  const [booking, technicians] = await Promise.all([getBookingByOrderId(id), getTechnicians()]);

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Booking</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{booking.order_id}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Info label="Customer" value={booking.customer_name} />
            <Info label="Phone" value={booking.customer_phone} />
            <Info label="Service" value={booking.services?.title || booking.service_id || 'General Inquiry'} />
            <Info label="Address" value={booking.address} />
            <Info label="Preferred Time" value={`${booking.preferred_date} / ${booking.preferred_time}`} />
            <Info label="Status" value={booking.status.replaceAll('_', ' ')} />
          </div>
        </section>
        <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-extrabold text-[#0B2A4A]">Admin Actions</h3>
          <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'confirmed'); }} className="mt-4">
            <button className="w-full rounded-xl bg-[#2EA9D6] py-3 text-sm font-bold text-white">Confirm Booking</button>
          </form>
          <form action={assignTechnician} className="mt-3 space-y-3 rounded-xl bg-gray-50 p-3">
            <input type="hidden" name="bookingId" value={booking.id} />
            <select name="technicianId" required className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-[#0B2A4A]">
              <option value="">Select technician</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.display_name}
                </option>
              ))}
            </select>
            <button className="w-full rounded-xl bg-[#0B2A4A] py-3 text-sm font-bold text-white">Assign Technician</button>
          </form>
          <form action={async () => { 'use server'; await updateBookingStatus(booking.id, 'cancelled'); }} className="mt-3">
            <button className="w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600">Cancel Booking</button>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-[#0B2A4A]">{value}</p>
    </div>
  );
}
