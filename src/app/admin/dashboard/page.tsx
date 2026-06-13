import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  MapPin,
  Phone,
  Plus,
  SlidersHorizontal,
  UserRoundCheck,
  Wrench
} from 'lucide-react';
import { AutoRefreshNotice } from '@/components/admin/AutoRefreshNotice';
import { BookingQuickAction, getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { AdminCard, AdminCardHeader, adminButtonClass, formatBdt, normalizeBdPhoneDisplay } from '@/components/admin/AdminUI';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireRole } from '@/lib/auth/session';
import { getAdminBookings, getDashboardStats, type BookingRow } from '@/features/bookings/queries';
import { getTechnicians, type TechnicianRow } from '@/features/technicians/queries';

const fieldStatuses = ['assigned', 'accepted', 'on_the_way', 'in_progress'];

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ action?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  await requireRole(['admin']);

  const [stats, recentBookings, technicians] = await Promise.all([
    getDashboardStats(),
    getAdminBookings({ pageSize: 100 }),
    getTechnicians()
  ]);

  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
  const pendingBookings = recentBookings.filter((booking) => booking.status === 'pending');
  const readyToAssignBookings = recentBookings.filter((booking) => booking.status === 'confirmed' && !booking.assigned_technician_id);
  const fieldJobs = recentBookings.filter((booking) => fieldStatuses.includes(booking.status));
  const todayJobs = recentBookings.filter((booking) => booking.preferred_date === todayKey);
  const availableTechnicians = technicians.filter((technician) => technician.availability_status === 'available');
  const completedValue = recentBookings
    .filter((booking) => booking.status === 'completed')
    .reduce((total, booking) => total + Number(booking.final_price || 0), 0);
  const activeProjectedValue = fieldJobs.reduce((total, booking) => total + Number(booking.final_price || 0), 0);
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const activeCounts = getActiveBookingCounts(recentBookings);
  const priorityBookings = [...pendingBookings, ...readyToAssignBookings, ...fieldJobs].sort(sortByDispatchPriority).slice(0, 8);
  const workloadRows = technicians
    .map((technician) => ({
      technician,
      active: activeCounts.get(technician.id) || 0
    }))
    .sort((a, b) => b.active - a.active || a.technician.display_name.localeCompare(b.technician.display_name))
    .slice(0, 5);
  const zoneRows = getZoneRows(recentBookings).slice(0, 5);

  return (
    <AdminShell
      title="Executive Dashboard"
      eyebrow="LSC Admin Suite"
      description="A compact command center for order confirmation, dispatch assignment, technician load, and daily service health."
      actions={
        <>
          <Link href="/admin/bookings/new" className={adminButtonClass.cyan}>
            <Plus className="size-4" aria-hidden="true" />
            New order
          </Link>
          <Link href="/admin/bookings" className={adminButtonClass.secondary}>
            Order center
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={formatBdt(completedValue)}
          helper="Completed value from recent service records"
          badge={`${completionRate}% done`}
          tone="info"
          icon={<BadgeDollarSign className="size-5" aria-hidden="true" />}
          href="/admin/bookings?status=completed"
        />
        <KpiCard
          label="Active jobs"
          value={stats.fieldActive}
          helper={`${activeProjectedValue ? `${formatBdt(activeProjectedValue)} projected / ` : ''}${stats.readyToAssign} ready to assign`}
          badge="Live field"
          tone="navy"
          icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />}
          href="/admin/bookings?status=field"
        />
        <KpiCard
          label="Pending orders"
          value={stats.pending}
          helper="Needs admin confirmation before dispatch"
          badge="Action"
          tone="warning"
          icon={<AlertTriangle className="size-5" aria-hidden="true" />}
          href="/admin/bookings?status=pending"
          urgent={stats.pending > 0}
        />
        <KpiCard
          label="Technician capacity"
          value={`${availableTechnicians.length}/${technicians.length}`}
          helper="Available field team against total active profiles"
          badge="Roster"
          tone="success"
          icon={<UserRoundCheck className="size-5" aria-hidden="true" />}
          href="/admin/technicians"
        />
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <AdminCard>
          <AdminCardHeader
            title="Order Command Center"
            description="Prioritized by pending confirmation, confirmed unassigned jobs, then active field work."
            icon={<ClipboardList className="size-4" aria-hidden="true" />}
            action={
              <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00677D] hover:text-[#000D32]">
                View full queue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />

          <div className="grid gap-4 p-5 xl:grid-cols-3">
            <DispatchLane
              title="Pending confirmation"
              count={stats.pending}
              tone="warning"
              bookings={pendingBookings.slice(0, 3)}
              technicians={technicians}
              activeCounts={activeCounts}
            />
            <DispatchLane
              title="Ready to assign"
              count={stats.readyToAssign}
              tone="info"
              bookings={readyToAssignBookings.slice(0, 3)}
              technicians={technicians}
              activeCounts={activeCounts}
            />
            <DispatchLane
              title="In field progress"
              count={stats.fieldActive}
              tone="success"
              bookings={fieldJobs.slice(0, 3)}
              technicians={technicians}
              activeCounts={activeCounts}
            />
          </div>

          <div className="border-t border-[#D8DADC]">
            <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#000D32]">Live priority queue</h2>
                <p className="mt-1 text-sm font-medium text-[#45464F]">Newest operational work that can move today.</p>
              </div>
              <Link href="/admin/bookings?status=all" className={adminButtonClass.secondary}>
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
              </Link>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-[#F2F4F6] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#45464F]">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Schedule</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Quick action</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEEF0]">
                  {priorityBookings.map((booking, index) => (
                    <tr key={booking.id} className={index % 2 === 1 ? 'bg-[#F7F9FB]' : 'bg-white'}>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-[#000D32]">{booking.order_id}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#757680]">{booking.source}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#191C1E]">{booking.customer_name}</p>
                        <a href={`tel:${booking.customer_phone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#45464F] hover:text-[#00677D]">
                          <Phone className="size-3" aria-hidden="true" />
                          {normalizeBdPhoneDisplay(booking.customer_phone)}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#D0E1FB] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#12234D]">
                          {serviceCode(booking)}
                        </span>
                        <p className="mt-2 max-w-[210px] truncate font-semibold text-[#191C1E]">{serviceTitle(booking)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#191C1E]">{formatDate(booking.preferred_date)}</p>
                        <p className="mt-1 text-xs text-[#45464F]">{booking.preferred_time}</p>
                      </td>
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

            <div className="grid gap-3 p-4 lg:hidden">
              {priorityBookings.map((booking) => (
                <OrderCard key={booking.id} booking={booking} technicians={technicians} activeCounts={activeCounts} />
              ))}
            </div>

            {priorityBookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-semibold text-[#000D32]">No active queue items</p>
                <p className="mt-1 text-sm text-[#45464F]">New customer bookings will appear here automatically.</p>
              </div>
            ) : null}
          </div>
        </AdminCard>

        <aside className="space-y-5">
          <AdminCard className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#000D32]">Today’s dispatch focus</h2>
                <p className="mt-1 text-sm font-medium text-[#45464F]">{todayJobs.length} scheduled jobs for Dhaka operations.</p>
              </div>
              <CalendarClock className="size-5 text-[#2EA9D6]" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-3">
              <FocusRow label="Confirm customers" value={stats.pending} href="/admin/bookings?status=pending" />
              <FocusRow label="Assign technicians" value={stats.readyToAssign} href="/admin/bookings?status=confirmed&unassigned=1" />
              <FocusRow label="Field jobs moving" value={stats.fieldActive} href="/admin/bookings?status=field" />
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#000D32]">Technician workload</h2>
                <p className="mt-1 text-sm font-medium text-[#45464F]">Balance active jobs before assigning more.</p>
              </div>
              <Link href="/admin/technicians" className="text-sm font-semibold text-[#00677D] hover:text-[#000D32]">
                Manage
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {workloadRows.map(({ technician, active }) => (
                <WorkloadMeter key={technician.id} technician={technician} active={active} max={Math.max(3, ...workloadRows.map((row) => row.active))} />
              ))}
              {workloadRows.length === 0 ? (
                <p className="rounded border border-dashed border-[#C5C6D0] p-4 text-sm font-medium text-[#45464F]">No technician profiles yet.</p>
              ) : null}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#000D32]">Zone load</h2>
                <p className="mt-1 text-sm font-medium text-[#45464F]">Address-based workload snapshot.</p>
              </div>
              <MapPin className="size-5 text-[#2EA9D6]" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-3">
              {zoneRows.map((zone) => (
                <div key={zone.name} className="flex items-center justify-between rounded border border-[#D8DADC] bg-[#F7F9FB] px-3 py-2">
                  <span className="text-sm font-semibold text-[#000D32]">{zone.name}</span>
                  <span className="rounded-full bg-[#D0E1FB] px-2.5 py-1 text-xs font-semibold text-[#12234D]">{zone.count}</span>
                </div>
              ))}
              {zoneRows.length === 0 ? (
                <p className="rounded border border-dashed border-[#C5C6D0] p-4 text-sm font-medium text-[#45464F]">No recent zone data.</p>
              ) : null}
            </div>
          </AdminCard>
        </aside>
      </section>

      <AdminCard className="mt-6">
        <AdminCardHeader
          title="Today’s Schedule"
          description="Customer-facing jobs scheduled for today. Use this list to prevent missed calls and late arrivals."
          icon={<Wrench className="size-4" aria-hidden="true" />}
          action={
            <Link href="/admin/bookings/new" className={adminButtonClass.primary}>
              <Plus className="size-4" aria-hidden="true" />
              Create phone order
            </Link>
          }
        />
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {todayJobs.slice(0, 6).map((booking) => (
            <Link key={booking.id} href={`/admin/bookings/${booking.order_id}`} className="rounded-lg border border-[#D8DADC] bg-[#F7F9FB] p-4 transition hover:border-[#2EA9D6] hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-[#000D32]">{booking.order_id}</p>
                  <p className="mt-2 truncate text-sm font-semibold text-[#191C1E]">{serviceTitle(booking)}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#45464F]">
                <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                {normalizeBdPhoneDisplay(booking.customer_phone)}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm font-medium text-[#45464F]">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                <span className="line-clamp-2">{booking.address}</span>
              </p>
            </Link>
          ))}
          {todayJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#C5C6D0] p-6 text-sm font-medium text-[#45464F]">
              No jobs scheduled today.
            </div>
          ) : null}
        </div>
      </AdminCard>
    </AdminShell>
  );
}

function KpiCard({
  label,
  value,
  helper,
  badge,
  tone,
  icon,
  href,
  urgent = false
}: {
  label: string;
  value: string | number;
  helper: string;
  badge: string;
  tone: 'info' | 'navy' | 'warning' | 'success';
  icon: React.ReactNode;
  href: string;
  urgent?: boolean;
}) {
  const tones = {
    info: 'bg-[#D0E1FB] text-[#12234D]',
    navy: 'bg-[#000D32] text-white',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <Link
      href={href}
      className={`group rounded-lg border bg-white p-5 shadow-[0_1px_2px_rgba(18,35,77,0.04)] transition hover:-translate-y-0.5 hover:border-[#2EA9D6] ${
        urgent ? 'border-l-4 border-l-[#BA1A1A]' : 'border-[#D8DADC]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded ${tones[tone]}`}>{icon}</span>
        <span className="rounded-full bg-[#F2F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#45464F]">{badge}</span>
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none text-[#000D32]">{value}</p>
      <p className="mt-4 border-t border-[#D8DADC] pt-3 text-sm font-medium leading-5 text-[#45464F]">{helper}</p>
    </Link>
  );
}

function DispatchLane({
  title,
  count,
  tone,
  bookings,
  technicians,
  activeCounts
}: {
  title: string;
  count: number;
  tone: 'warning' | 'info' | 'success';
  bookings: BookingRow[];
  technicians: TechnicianRow[];
  activeCounts: Map<string, number>;
}) {
  const toneClass = {
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }[tone];

  return (
    <section className="rounded-lg border border-[#D8DADC] bg-[#F7F9FB]">
      <div className="flex items-center justify-between gap-3 border-b border-[#D8DADC] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#000D32]">{title}</h2>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{count}</span>
      </div>
      <div className="space-y-3 p-3">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded border border-[#D8DADC] bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold text-[#000D32]">{booking.order_id}</p>
                <p className="mt-1 truncate text-sm font-semibold text-[#191C1E]">{booking.customer_name}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <p className="mt-2 truncate text-xs font-semibold text-[#45464F]">{serviceTitle(booking)}</p>
            <p className="mt-1 text-xs font-medium text-[#757680]">{formatDate(booking.preferred_date)} / {booking.preferred_time}</p>
            <div className="mt-3">
              <BookingQuickAction booking={booking} technicians={technicians} activeCounts={activeCounts} successHref="/admin/dashboard?action=updated" />
            </div>
          </article>
        ))}
        {bookings.length === 0 ? (
          <p className="rounded border border-dashed border-[#C5C6D0] bg-white p-4 text-sm font-medium text-[#45464F]">No jobs in this lane.</p>
        ) : null}
      </div>
    </section>
  );
}

function OrderCard({ booking, technicians, activeCounts }: { booking: BookingRow; technicians: TechnicianRow[]; activeCounts: Map<string, number> }) {
  return (
    <article className="rounded-lg border border-[#D8DADC] bg-[#F7F9FB] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-[#000D32]">{booking.order_id}</p>
          <p className="mt-1 text-sm font-semibold text-[#191C1E]">{booking.customer_name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-3 text-sm font-semibold text-[#191C1E]">{serviceTitle(booking)}</p>
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
  );
}

function FocusRow({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded border border-[#D8DADC] bg-[#F7F9FB] px-4 py-3 transition hover:border-[#2EA9D6] hover:bg-white">
      <span className="text-sm font-medium text-[#45464F]">{label}</span>
      <span className="text-lg font-semibold text-[#000D32]">{value}</span>
    </Link>
  );
}

function WorkloadMeter({ technician, active, max }: { technician: TechnicianRow; active: number; max: number }) {
  const percent = Math.min(100, Math.round((active / max) * 100));
  const initials = technician.display_name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded bg-[#000D32] text-xs font-semibold text-white">{initials}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#000D32]">{technician.display_name}</p>
            <p className="text-xs font-medium capitalize text-[#45464F]">{technician.availability_status.replaceAll('_', ' ')}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-[#000D32]">{active}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#E0E3E5]">
        <div className="h-2 rounded-full bg-[#000D32]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function serviceTitle(booking: BookingRow) {
  return booking.services?.title || booking.service_id || 'General Inquiry';
}

function serviceCode(booking: BookingRow) {
  const title = serviceTitle(booking).toLowerCase();
  if (title.includes('ac') || title.includes('air')) return 'HVAC';
  if (title.includes('wash')) return 'WASH';
  if (title.includes('fridge') || title.includes('refrigerator')) return 'FRIDGE';
  if (title.includes('geyser')) return 'GEYSER';
  if (title.includes('microwave')) return 'OVEN';
  return 'SERVICE';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function sortByDispatchPriority(a: BookingRow, b: BookingRow) {
  const priority: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    assigned: 2,
    accepted: 3,
    on_the_way: 4,
    in_progress: 5,
    completed: 6,
    cancelled: 7
  };

  const priorityDiff = (priority[a.status] ?? 8) - (priority[b.status] ?? 8);
  if (priorityDiff !== 0) return priorityDiff;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function getZoneRows(bookings: BookingRow[]) {
  const counts = new Map<string, number>();
  bookings.forEach((booking) => {
    const zone = extractZone(booking.address);
    counts.set(zone, (counts.get(zone) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function extractZone(address: string) {
  const first = address.split(',').map((part) => part.trim()).find(Boolean);
  return first || 'Dhaka';
}
