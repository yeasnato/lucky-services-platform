import Link from 'next/link';
import { ArrowRight, Filter, MapPin, Phone, Plus, Search } from 'lucide-react';
import { AutoRefreshNotice } from '@/components/admin/AutoRefreshNotice';
import { BookingQuickAction, getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { AdminCard, AdminCardHeader, adminButtonClass, adminInputWithIconClass, normalizeBdPhoneDisplay } from '@/components/admin/AdminUI';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAdminBookings, getBookingQueueCounts } from '@/features/bookings/queries';
import { getTechnicians } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

type QueueSearchParams = {
  deleted?: string;
  status?: string;
  unassigned?: string;
  q?: string;
  action?: string;
  page?: string;
};

const pageSize = 50;

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams?: Promise<QueueSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  await requireRole(['admin']);
  const activeFilter = resolvedSearchParams.status || 'all';
  const query = (resolvedSearchParams.q || '').trim();
  const page = Math.max(1, Number(resolvedSearchParams.page || '1') || 1);
  const unassigned = resolvedSearchParams.unassigned === '1';
  const [bookings, tabCounts, activeCountBookings, technicians] = await Promise.all([
    getAdminBookings({ page, pageSize, status: activeFilter, unassigned, query }),
    getBookingQueueCounts(query),
    getAdminBookings({ pageSize: 100, status: 'field' }),
    getTechnicians()
  ]);
  const activeCounts = getActiveBookingCounts(bookings);
  const loadCounts = getActiveBookingCounts(activeCountBookings);
  const mergedActiveCounts = new Map([...loadCounts, ...activeCounts]);
  const totalFiltered = getCountForFilter(tabCounts, activeFilter, unassigned);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const successHref = queueHref(activeFilter, query, unassigned, 1, 'updated');

  return (
    <AdminShell
      title="Order Command Center"
      description="Filter customer requests, confirm orders, assign technicians, and keep dispatch moving without unnecessary page hops."
      actions={
        <>
          <Link
            href="/admin/bookings/new"
            className={adminButtonClass.cyan}
          >
            <Plus className="size-4" aria-hidden="true" />
            New order
          </Link>
          <AutoRefreshNotice latestBookingId={bookings[0]?.id} />
        </>
      }
    >
      {resolvedSearchParams.deleted === '1' ? (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Order deleted successfully.
        </div>
      ) : null}
      {resolvedSearchParams.action === 'updated' ? (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Booking updated successfully.
        </div>
      ) : null}

      <AdminCard>
        <div className="border-b border-[#D8DADC] p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <AdminCardHeader
              title="Dispatch queue"
              description="Orders from Supabase, filtered for confirmation, assignment, and field tracking."
              className="border-0 p-0"
            />
            <form action="/admin/bookings" className="flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="status" value={activeFilter} />
              {unassigned ? <input type="hidden" name="unassigned" value="1" /> : null}
              <label className="relative block min-w-0 sm:w-[320px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search order, phone, name"
                  className={adminInputWithIconClass}
                />
              </label>
              <button className={adminButtonClass.primary}>
                <Filter className="size-4" aria-hidden="true" />
                Search
              </button>
            </form>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <QueueTab label="All" count={tabCounts.all} href={queueHref('all', query)} active={activeFilter === 'all'} />
            <QueueTab label="Pending" count={tabCounts.pending} href={queueHref('pending', query)} active={activeFilter === 'pending'} />
            <QueueTab
              label="Ready to assign"
              count={tabCounts.ready}
              href={queueHref('confirmed', query, true)}
              active={activeFilter === 'confirmed' && unassigned}
            />
            <QueueTab label="In field" count={tabCounts.field} href={queueHref('field', query)} active={activeFilter === 'field'} />
            <QueueTab label="Completed" count={tabCounts.completed} href={queueHref('completed', query)} active={activeFilter === 'completed'} />
            <QueueTab label="Cancelled" count={tabCounts.cancelled} href={queueHref('cancelled', query)} active={activeFilter === 'cancelled'} />
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[980px] text-left text-sm">
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
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-[#F7F9FB]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#000D32]">{booking.order_id}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#757680]">{booking.source}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#191C1E]">{booking.customer_name}</p>
                    <a href={`tel:${booking.customer_phone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#45464F] hover:text-[#00677D]">
                      <Phone className="size-3" aria-hidden="true" />
                      {normalizeBdPhoneDisplay(booking.customer_phone)}
                    </a>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#191C1E]">{booking.services?.title || booking.service_id || 'General Inquiry'}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#191C1E]">{formatDate(booking.preferred_date)}</p>
                    <p className="mt-1 text-xs text-[#45464F]">{booking.preferred_time}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4">
                    <BookingQuickAction booking={booking} technicians={technicians} activeCounts={mergedActiveCounts} successHref={successHref} />
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
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#000D32]">{booking.order_id}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#757680]">{booking.source}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm font-medium text-[#45464F]">
                <p>{booking.customer_name}</p>
                <a href={`tel:${booking.customer_phone}`} className="inline-flex items-center gap-2 text-[#000D32]">
                  <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  {normalizeBdPhoneDisplay(booking.customer_phone)}
                </a>
                <p className="font-semibold text-[#191C1E]">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
                <p>{formatDate(booking.preferred_date)} / {booking.preferred_time}</p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                  <span>{booking.address}</span>
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                <BookingQuickAction booking={booking} technicians={technicians} activeCounts={mergedActiveCounts} successHref={successHref} />
                <Link href={`/admin/bookings/${booking.order_id}`} className={adminButtonClass.secondary}>
                  Manage order
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-[#000D32]">No bookings found</p>
            <p className="mt-1 text-sm text-[#45464F]">Try another queue tab or search term.</p>
          </div>
        ) : null}

        {totalFiltered > pageSize ? (
          <div className="flex flex-col gap-3 border-t border-[#D8DADC] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#45464F]">
              Page {page} of {totalPages} / {totalFiltered} orders
            </p>
            <div className="flex gap-2">
              <Link
                href={page > 1 ? queueHref(activeFilter, query, unassigned, page - 1) : '#'}
                aria-disabled={page <= 1}
                className={`inline-flex min-h-10 items-center rounded border px-4 text-sm font-semibold ${
                  page <= 1
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-[#C5C6D0] text-[#000D32] hover:border-[#2EA9D6] hover:text-[#00677D]'
                }`}
              >
                Previous
              </Link>
              <Link
                href={page < totalPages ? queueHref(activeFilter, query, unassigned, page + 1) : '#'}
                aria-disabled={page >= totalPages}
                className={`inline-flex min-h-10 items-center rounded border px-4 text-sm font-semibold ${
                  page >= totalPages
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-[#C5C6D0] text-[#000D32] hover:border-[#2EA9D6] hover:text-[#00677D]'
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </AdminCard>
    </AdminShell>
  );
}

function QueueTab({ label, count, href, active }: { label: string; count: number; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
        active
          ? 'border-[#000D32] bg-[#000D32] text-white'
          : 'border-[#C5C6D0] bg-white text-[#45464F] hover:border-[#2EA9D6] hover:text-[#000D32]'
      }`}
    >
      {label}
      <span className={active ? 'text-white/80' : 'text-[#757680]'}>{count}</span>
    </Link>
  );
}

function queueHref(status: string, query: string, unassigned = false, page = 1, action?: string) {
  const params = new URLSearchParams();
  params.set('status', status);
  if (unassigned) params.set('unassigned', '1');
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  if (action) params.set('action', action);
  return `/admin/bookings?${params.toString()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getCountForFilter(
  counts: Awaited<ReturnType<typeof getBookingQueueCounts>>,
  status: string,
  unassigned: boolean
) {
  if (status === 'pending') return counts.pending;
  if (status === 'confirmed' && unassigned) return counts.ready;
  if (status === 'field') return counts.field;
  if (status === 'completed') return counts.completed;
  if (status === 'cancelled') return counts.cancelled;
  return counts.all;
}
