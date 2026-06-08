import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireRole } from '@/lib/auth/session';
import { getAdminBookings } from '@/features/bookings/queries';

export default async function AdminBookingsPage() {
  await requireRole(['admin']);
  const bookings = await getAdminBookings();

  return (
    <AdminShell
      title="Booking queue"
      description="Confirm customer requests, assign technicians, and track every order through the service lifecycle."
      actions={
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2EA9D6] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]"
        >
          <Plus className="size-4" aria-hidden="true" />
          New order
        </Link>
      }
    >
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#0B2A4A]">All bookings</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Latest 50 orders from Supabase.</p>
          </div>
          <div className="rounded-lg bg-[#F0F9FC] px-3 py-2 text-sm font-extrabold text-[#0B2A4A]">{bookings.length} orders</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-[#F8FCFE]">
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-[#0B2A4A]">{booking.order_id}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{booking.source}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-700">{booking.customer_name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{booking.customer_phone}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">{booking.services?.title || booking.service_id || 'General Inquiry'}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">{formatDate(booking.preferred_date)}</p>
                    <p className="mt-1 text-xs text-slate-500">{booking.preferred_time}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/bookings/${booking.order_id}`} className="font-bold text-[#2EA9D6] hover:text-[#0B2A4A]">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-bold text-[#0B2A4A]">No bookings found</p>
            <p className="mt-1 text-sm text-slate-500">New customer booking requests will be listed here.</p>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
