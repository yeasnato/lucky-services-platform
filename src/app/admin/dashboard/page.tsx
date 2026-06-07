import { AdminShell } from '@/components/admin/DashboardShell';
import { requireRole } from '@/lib/auth/session';
import { getAdminBookings, getDashboardStats } from '@/features/bookings/queries';

export default async function AdminDashboardPage() {
  await requireRole(['admin']);
  const [stats, recentBookings] = await Promise.all([getDashboardStats(), getAdminBookings()]);
  const statCards = [
    { label: 'Pending Bookings', value: String(stats.pending) },
    { label: 'Assigned Jobs', value: String(stats.assigned) },
    { label: 'Completed Jobs', value: String(stats.completed) },
    { label: 'Total Orders', value: String(stats.total) }
  ];

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-[#0B2A4A]">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-lg font-extrabold text-[#0B2A4A]">Recent Booking Queue</h2>
          <p className="text-sm text-gray-500">New orders should appear here in realtime once Supabase is connected.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {recentBookings.slice(0, 10).map((booking) => (
            <div key={booking.id} className="grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_1fr_120px]">
              <div>
                <p className="font-bold text-[#0B2A4A]">{booking.order_id}</p>
                <p className="text-sm text-gray-500">{booking.customer_name}</p>
              </div>
              <p className="text-sm font-semibold text-gray-600">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
              <p className="text-sm text-gray-500">{booking.address}</p>
              <span className="rounded-full bg-[#F0F9FC] px-3 py-1 text-center text-xs font-bold capitalize text-[#2EA9D6]">{booking.status.replaceAll('_', ' ')}</span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
