import Link from 'next/link';
import { AdminShell } from '@/components/admin/DashboardShell';
import { requireRole } from '@/lib/auth/session';
import { getAdminBookings } from '@/features/bookings/queries';

export default async function AdminBookingsPage() {
  await requireRole(['admin']);
  const bookings = await getAdminBookings();

  return (
    <AdminShell>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-lg font-extrabold text-[#0B2A4A]">Bookings</h2>
          <p className="text-sm text-gray-500">Confirm orders, assign technicians, and track job lifecycle.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/admin/bookings/${booking.order_id}`} className="grid gap-3 p-5 transition hover:bg-gray-50 md:grid-cols-[1fr_1fr_1fr_120px]">
              <div>
                <p className="font-bold text-[#0B2A4A]">{booking.order_id}</p>
                <p className="text-sm text-gray-500">{booking.customer_name}</p>
              </div>
              <p className="text-sm font-semibold text-gray-600">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
              <p className="text-sm text-gray-500">{booking.customer_phone}</p>
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-center text-xs font-bold uppercase text-yellow-700">{booking.status.replaceAll('_', ' ')}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
