import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, ClipboardList, Plus, UserRoundCheck } from 'lucide-react';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireRole } from '@/lib/auth/session';
import { getAdminBookings, getDashboardStats } from '@/features/bookings/queries';

export default async function AdminDashboardPage() {
  await requireRole(['admin']);
  const [stats, recentBookings] = await Promise.all([getDashboardStats(), getAdminBookings()]);
  const activeStatuses = ['assigned', 'accepted', 'on_the_way', 'in_progress'];
  const activeJobs = recentBookings.filter((booking) => activeStatuses.includes(booking.status));
  const confirmedBookings = recentBookings.filter((booking) => booking.status === 'confirmed');
  const needsAction = stats.pending + confirmedBookings.length;
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const statCards = [
    {
      label: 'Needs action',
      value: String(needsAction),
      helper: 'Pending or confirmed jobs',
      icon: Clock3,
      accent: 'bg-amber-50 text-amber-700'
    },
    {
      label: 'Active jobs',
      value: String(activeJobs.length),
      helper: 'Assigned to field team',
      icon: UserRoundCheck,
      accent: 'bg-sky-50 text-sky-700'
    },
    {
      label: 'Completed',
      value: String(stats.completed),
      helper: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      accent: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Total orders',
      value: String(stats.total),
      helper: 'Latest 50 from Supabase',
      icon: ClipboardList,
      accent: 'bg-[#F0F9FC] text-[#2EA9D6]'
    }
  ];

  return (
    <AdminShell
      title="Operations dashboard"
      description="Review new bookings, confirm customer requests, and assign the right technician from one focused workspace."
      actions={
        <>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2EA9D6] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]"
          >
            <Plus className="size-4" aria-hidden="true" />
            New order
          </Link>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6] hover:text-[#2EA9D6]"
          >
            Booking queue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#0B2A4A]">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.accent}`}>
                <stat.icon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-500">{stat.helper}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#0B2A4A]">Live booking queue</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Newest customer requests from the website.</p>
            </div>
            <Link href="/admin/bookings" className="text-sm font-bold text-[#2EA9D6] hover:text-[#0B2A4A]">
              View all bookings
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Area</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-[#F8FCFE]">
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-[#0B2A4A]">{booking.order_id}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{booking.customer_name}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">{booking.services?.title || booking.service_id || 'General Inquiry'}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <p className="font-semibold">{formatDate(booking.preferred_date)}</p>
                      <p className="text-xs text-slate-500">{booking.preferred_time}</p>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-slate-500">{booking.address}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/bookings/${booking.order_id}`} className="font-bold text-[#2EA9D6] hover:text-[#0B2A4A]">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-bold text-[#0B2A4A]">No bookings yet</p>
              <p className="mt-1 text-sm text-slate-500">Website booking requests will appear here automatically.</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-[#0B2A4A]">Today’s dispatch focus</h3>
            <div className="mt-4 space-y-3">
              <FocusRow label="Confirm pending customers" value={stats.pending} />
              <FocusRow label="Assign confirmed jobs" value={confirmedBookings.length} />
              <FocusRow label="Monitor active field jobs" value={activeJobs.length} />
            </div>
          </div>
          <div className="rounded-lg border border-[#B9E7F5] bg-[#F0F9FC] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Operating rhythm</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#0B2A4A]">
              Confirm the customer first, assign a technician second, then keep the job moving through accepted, on the way,
              in progress, and completed.
            </p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

function FocusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-lg font-extrabold text-[#0B2A4A]">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
