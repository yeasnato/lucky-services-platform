import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, ClipboardList, MapPin, Phone, Plus, UserRoundCheck, Wrench } from 'lucide-react';
import { AutoRefreshNotice } from '@/components/admin/AutoRefreshNotice';
import { BookingQuickAction, getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireRole } from '@/lib/auth/session';
import { getAdminBookings, getDashboardStats } from '@/features/bookings/queries';
import { getTechnicians } from '@/features/technicians/queries';

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ action?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  await requireRole(['admin']);
  const [stats, recentBookings, technicians] = await Promise.all([getDashboardStats(), getAdminBookings(), getTechnicians()]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const pendingBookings = recentBookings.filter((booking) => booking.status === 'pending');
  const confirmedBookings = recentBookings.filter((booking) => booking.status === 'confirmed');
  const fieldJobs = recentBookings.filter((booking) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status));
  const todayJobs = recentBookings.filter((booking) => booking.preferred_date === todayKey);
  const unassignedConfirmed = confirmedBookings.filter((booking) => !booking.assigned_technician_id);
  const availableTechnicians = technicians.filter((technician) => technician.availability_status === 'available');
  const needsAction = stats.pending + stats.readyToAssign;
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const activeCounts = getActiveBookingCounts(recentBookings);
  const priorityBookings = [...pendingBookings, ...unassignedConfirmed, ...fieldJobs].slice(0, 10);
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
      value: String(stats.fieldActive + stats.readyToAssign),
      helper: `${stats.fieldActive} in field, ${stats.readyToAssign} awaiting assign`,
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
      label: 'Today schedule',
      value: String(todayJobs.length),
      helper: `${availableTechnicians.length} available technicians`,
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
          <AutoRefreshNotice latestBookingId={recentBookings[0]?.id} />
        </>
      }
    >
      {resolvedSearchParams.action === 'updated' ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-extrabold text-emerald-800">
          Booking updated successfully.
        </div>
      ) : null}

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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
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

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Area</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Quick action</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priorityBookings.map((booking) => (
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
                    <td className="px-5 py-4">
                      <BookingQuickAction booking={booking} technicians={technicians} activeCounts={activeCounts} successHref="/admin/dashboard?action=updated" />
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

          <div className="grid gap-3 p-4 md:hidden">
            {priorityBookings.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-[#0B2A4A]">{booking.order_id}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{booking.customer_name}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{formatDate(booking.preferred_date)} / {booking.preferred_time}</p>
                <p className="mt-2 flex items-start gap-2 text-sm font-medium text-slate-500">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                  <span>{booking.address}</span>
                </p>
                <div className="mt-4 grid gap-3">
                  <BookingQuickAction booking={booking} technicians={technicians} activeCounts={activeCounts} successHref="/admin/dashboard?action=updated" />
                  <Link href={`/admin/bookings/${booking.order_id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0B2A4A]">
                    Manage order
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
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
              <FocusRow label="Assign confirmed jobs" value={stats.readyToAssign} />
              <FocusRow label="Monitor active field jobs" value={stats.fieldActive} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-[#0B2A4A]">Dispatch lanes</h3>
            <div className="mt-4 space-y-3">
              <Lane title="Pending confirmation" count={stats.pending} tone="amber" href="/admin/bookings?status=pending" />
              <Lane title="Ready to assign" count={stats.readyToAssign} tone="sky" href="/admin/bookings?status=confirmed&unassigned=1" />
              <Lane title="In field progress" count={stats.fieldActive} tone="emerald" href="/admin/bookings?status=field" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-extrabold text-[#0B2A4A]">Technician capacity</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Capacity label="Available" value={availableTechnicians.length} />
              <Capacity label="Total" value={technicians.length} />
            </div>
            <Link href="/admin/technicians" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#2EA9D6] hover:text-[#0B2A4A]">
              <Wrench className="size-4" aria-hidden="true" />
              Manage team
            </Link>
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

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#0B2A4A]">Today’s jobs</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Jobs scheduled for today, sorted from newest booking data.</p>
          </div>
          <Link href="/admin/bookings/new" className="inline-flex items-center gap-2 rounded-lg bg-[#0B2A4A] px-4 py-2 text-sm font-bold text-white">
            <Plus className="size-4" aria-hidden="true" />
            Add phone order
          </Link>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {todayJobs.slice(0, 6).map((booking) => (
            <Link key={booking.id} href={`/admin/bookings/${booking.order_id}`} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-[#2EA9D6] hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#0B2A4A]">{booking.order_id}</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                {booking.customer_phone}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm font-medium text-slate-500">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                <span className="line-clamp-2">{booking.address}</span>
              </p>
            </Link>
          ))}
          {todayJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm font-semibold text-slate-500">
              No jobs scheduled today.
            </div>
          ) : null}
        </div>
      </section>
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

function Lane({ title, count, href, tone }: { title: string; count: number; href: string; tone: 'amber' | 'sky' | 'emerald' }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700'
  };

  return (
    <Link href={href} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-[#2EA9D6] hover:bg-white">
      <span className="text-sm font-bold text-slate-600">{title}</span>
      <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${tones[tone]}`}>{count}</span>
    </Link>
  );
}

function Capacity({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
