import Link from 'next/link';
import { AlertTriangle, ArrowRight, BadgeDollarSign, BriefcaseBusiness, CheckCircle2, ClipboardList, MapPin, Phone, Plus, Wrench } from 'lucide-react';
import { AutoRefreshNotice } from '@/components/admin/AutoRefreshNotice';
import { BookingQuickAction, getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { AdminCard, AdminCardHeader, AdminMetricCard, adminButtonClass, formatBdt } from '@/components/admin/AdminUI';
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
  const completedValue = recentBookings
    .filter((booking) => booking.status === 'completed')
    .reduce((total, booking) => total + Number(booking.final_price || 0), 0);
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const activeCounts = getActiveBookingCounts(recentBookings);
  const priorityBookings = [...pendingBookings, ...unassignedConfirmed, ...fieldJobs].slice(0, 10);
  const statCards = [
    {
      label: 'Total revenue',
      value: formatBdt(completedValue),
      helper: 'Completed job value in BDT',
      icon: <BadgeDollarSign className="size-5" aria-hidden="true" />,
      tone: 'info' as const
    },
    {
      label: 'Active jobs',
      value: String(stats.fieldActive + stats.readyToAssign),
      helper: `${stats.fieldActive} in field, ${stats.readyToAssign} awaiting assign`,
      icon: <BriefcaseBusiness className="size-5" aria-hidden="true" />,
      tone: 'navy' as const
    },
    {
      label: 'Pending orders',
      value: String(stats.pending),
      helper: 'Need customer confirmation',
      icon: <AlertTriangle className="size-5" aria-hidden="true" />,
      tone: 'warning' as const
    },
    {
      label: 'Completed',
      value: String(stats.completed),
      helper: `${completionRate}% completion rate`,
      icon: <CheckCircle2 className="size-5" aria-hidden="true" />,
      tone: 'success' as const
    }
  ];

  return (
    <AdminShell
      title="Executive Overview"
      description="Review new bookings, confirm customer requests, and assign the right technician from one focused workspace."
      actions={
        <>
          <Link
            href="/admin/bookings/new"
            className={adminButtonClass.cyan}
          >
            <Plus className="size-4" aria-hidden="true" />
            New order
          </Link>
          <Link
            href="/admin/bookings"
            className={adminButtonClass.secondary}
          >
            Booking queue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <AutoRefreshNotice latestBookingId={recentBookings[0]?.id} />
        </>
      }
    >
      {resolvedSearchParams.action === 'updated' ? (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Booking updated successfully.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <AdminMetricCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} icon={stat.icon} tone={stat.tone} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminCard>
          <AdminCardHeader
            title="Live Orders"
            description="Newest customer requests from the website and phone desk."
            icon={<ClipboardList className="size-4" aria-hidden="true" />}
            action={
              <Link href="/admin/bookings" className="text-sm font-semibold text-[#00677D] hover:text-[#000D32]">
              View all bookings
              </Link>
            }
          />

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#F2F4F6] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#45464F]">
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
                  <tr key={booking.id} className="transition hover:bg-[#F7F9FB]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#000D32]">{booking.order_id}</p>
                      <p className="mt-1 text-xs font-medium text-[#45464F]">{booking.customer_name}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#191C1E]">{booking.services?.title || booking.service_id || 'General Inquiry'}</td>
                    <td className="px-5 py-4 text-[#45464F]">
                      <p className="font-medium">{formatDate(booking.preferred_date)}</p>
                      <p className="text-xs">{booking.preferred_time}</p>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-[#45464F]">{booking.address}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4">
                      <BookingQuickAction booking={booking} technicians={technicians} activeCounts={activeCounts} successHref="/admin/dashboard?action=updated" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/bookings/${booking.order_id}`} className="font-semibold text-[#00677D] hover:text-[#000D32]">
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
              <article key={booking.id} className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#000D32]">{booking.order_id}</p>
                    <p className="mt-1 text-xs font-medium text-[#45464F]">{booking.customer_name}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-3 text-sm font-semibold text-[#191C1E]">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
                <p className="mt-1 text-sm font-medium text-[#45464F]">{formatDate(booking.preferred_date)} / {booking.preferred_time}</p>
                <p className="mt-2 flex items-start gap-2 text-sm font-medium text-[#45464F]">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                  <span>{booking.address}</span>
                </p>
                <div className="mt-4 grid gap-3">
                  <BookingQuickAction booking={booking} technicians={technicians} activeCounts={activeCounts} successHref="/admin/dashboard?action=updated" />
                  <Link href={`/admin/bookings/${booking.order_id}`} className={adminButtonClass.secondary}>
                    Manage order
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {priorityBookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-[#000D32]">No bookings yet</p>
              <p className="mt-1 text-sm text-[#45464F]">Website booking requests will appear here automatically.</p>
            </div>
          ) : null}
        </AdminCard>

        <aside className="space-y-4">
          <AdminCard className="p-5">
            <h3 className="text-base font-semibold text-[#000D32]">Today’s dispatch focus</h3>
            <div className="mt-4 space-y-3">
              <FocusRow label="Confirm pending customers" value={stats.pending} />
              <FocusRow label="Assign confirmed jobs" value={stats.readyToAssign} />
              <FocusRow label="Monitor active field jobs" value={stats.fieldActive} />
            </div>
          </AdminCard>
          <AdminCard className="p-5">
            <h3 className="text-base font-semibold text-[#000D32]">Dispatch lanes</h3>
            <div className="mt-4 space-y-3">
              <Lane title="Pending confirmation" count={stats.pending} tone="amber" href="/admin/bookings?status=pending" />
              <Lane title="Ready to assign" count={stats.readyToAssign} tone="sky" href="/admin/bookings?status=confirmed&unassigned=1" />
              <Lane title="In field progress" count={stats.fieldActive} tone="emerald" href="/admin/bookings?status=field" />
            </div>
          </AdminCard>
          <AdminCard className="p-5">
            <h3 className="text-base font-semibold text-[#000D32]">Technician capacity</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Capacity label="Available" value={availableTechnicians.length} />
              <Capacity label="Total" value={technicians.length} />
            </div>
            <Link href="/admin/technicians" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00677D] hover:text-[#000D32]">
              <Wrench className="size-4" aria-hidden="true" />
              Manage team
            </Link>
          </AdminCard>
          <div className="rounded border border-[#B9E7F5] bg-[#F0F9FC] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00677D]">Operating rhythm</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#000D32]">
              Confirm the customer first, assign a technician second, then keep the job moving through accepted, on the way,
              in progress, and completed.
            </p>
          </div>
        </aside>
      </div>

      <AdminCard className="mt-6">
        <AdminCardHeader
          title="Today’s jobs"
          description="Jobs scheduled for today, sorted from newest booking data."
          action={
            <Link href="/admin/bookings/new" className={adminButtonClass.primary}>
              <Plus className="size-4" aria-hidden="true" />
              Add phone order
            </Link>
          }
        />
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {todayJobs.slice(0, 6).map((booking) => (
            <Link key={booking.id} href={`/admin/bookings/${booking.order_id}`} className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4 transition hover:border-[#2EA9D6] hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#000D32]">{booking.order_id}</p>
                  <p className="mt-1 text-sm font-semibold text-[#191C1E]">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#45464F]">
                <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                {booking.customer_phone}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm font-medium text-[#45464F]">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                <span className="line-clamp-2">{booking.address}</span>
              </p>
            </Link>
          ))}
          {todayJobs.length === 0 ? (
            <div className="rounded border border-dashed border-[#C5C6D0] p-6 text-sm font-medium text-[#45464F]">
              No jobs scheduled today.
            </div>
          ) : null}
        </div>
      </AdminCard>
    </AdminShell>
  );
}

function FocusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded border border-[#D8DADC] bg-[#F7F9FB] px-4 py-3">
      <span className="text-sm font-medium text-[#45464F]">{label}</span>
      <span className="text-lg font-semibold text-[#000D32]">{value}</span>
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
    <Link href={href} className="flex items-center justify-between rounded border border-[#D8DADC] bg-[#F7F9FB] px-4 py-3 transition hover:border-[#2EA9D6] hover:bg-white">
      <span className="text-sm font-medium text-[#45464F]">{title}</span>
      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tones[tone]}`}>{count}</span>
    </Link>
  );
}

function Capacity({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#000D32]">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
