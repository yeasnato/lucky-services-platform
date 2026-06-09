import Link from 'next/link';
import { ArrowRight, Filter, MapPin, Phone, Plus, Search } from 'lucide-react';
import { AutoRefreshNotice } from '@/components/admin/AutoRefreshNotice';
import { BookingQuickAction, getActiveBookingCounts } from '@/components/admin/BookingQuickAction';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAdminBookings, getBookingQueueCounts } from '@/features/bookings/queries';
import type { BookingRow } from '@/features/bookings/queries';
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
      title="Booking queue"
      description="Filter customer requests, confirm orders, assign technicians, and keep dispatch moving without unnecessary page hops."
      actions={
        <>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2EA9D6] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]"
          >
            <Plus className="size-4" aria-hidden="true" />
            New order
          </Link>
          <AutoRefreshNotice latestBookingId={bookings[0]?.id} />
        </>
      }
    >
      {resolvedSearchParams.deleted === '1' ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-extrabold text-emerald-800">
          Order deleted successfully.
        </div>
      ) : null}
      {resolvedSearchParams.action === 'updated' ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-extrabold text-emerald-800">
          Booking updated successfully.
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#0B2A4A]">Dispatch queue</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Latest 50 orders from Supabase, filtered for action.</p>
            </div>
            <form action="/admin/bookings" className="flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="status" value={activeFilter} />
              {unassigned ? <input type="hidden" name="unassigned" value="1" /> : null}
              <label className="relative block min-w-0 sm:w-[320px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search order, phone, name"
                  className="min-h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm font-semibold text-[#0B2A4A] outline-none transition focus:border-[#2EA9D6] focus:bg-white"
                />
              </label>
              <button className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#0B2A4A] px-4 text-sm font-bold text-white">
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
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
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
                <tr key={booking.id} className="transition hover:bg-[#F8FCFE]">
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-[#0B2A4A]">{booking.order_id}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{booking.source}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-700">{booking.customer_name}</p>
                    <a href={`tel:${booking.customer_phone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#2EA9D6]">
                      <Phone className="size-3" aria-hidden="true" />
                      {booking.customer_phone}
                    </a>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">{booking.services?.title || booking.service_id || 'General Inquiry'}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">{formatDate(booking.preferred_date)}</p>
                    <p className="mt-1 text-xs text-slate-500">{booking.preferred_time}</p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4">
                    <BookingQuickAction booking={booking} technicians={technicians} activeCounts={mergedActiveCounts} successHref={successHref} />
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
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[#0B2A4A]">{booking.order_id}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{booking.source}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
                <p>{booking.customer_name}</p>
                <a href={`tel:${booking.customer_phone}`} className="inline-flex items-center gap-2 text-[#0B2A4A]">
                  <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  {booking.customer_phone}
                </a>
                <p className="font-bold text-slate-700">{booking.services?.title || booking.service_id || 'General Inquiry'}</p>
                <p>{formatDate(booking.preferred_date)} / {booking.preferred_time}</p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#2EA9D6]" aria-hidden="true" />
                  <span>{booking.address}</span>
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                <BookingQuickAction booking={booking} technicians={technicians} activeCounts={mergedActiveCounts} successHref={successHref} />
                <Link href={`/admin/bookings/${booking.order_id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0B2A4A]">
                  Manage order
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-bold text-[#0B2A4A]">No bookings found</p>
            <p className="mt-1 text-sm text-slate-500">Try another queue tab or search term.</p>
          </div>
        ) : null}

        {totalFiltered > pageSize ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Page {page} of {totalPages} / {totalFiltered} orders
            </p>
            <div className="flex gap-2">
              <Link
                href={page > 1 ? queueHref(activeFilter, query, unassigned, page - 1) : '#'}
                aria-disabled={page <= 1}
                className={`inline-flex min-h-[40px] items-center rounded-lg border px-4 text-sm font-bold ${
                  page <= 1
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-slate-200 text-[#0B2A4A] hover:border-[#2EA9D6] hover:text-[#2EA9D6]'
                }`}
              >
                Previous
              </Link>
              <Link
                href={page < totalPages ? queueHref(activeFilter, query, unassigned, page + 1) : '#'}
                aria-disabled={page >= totalPages}
                className={`inline-flex min-h-[40px] items-center rounded-lg border px-4 text-sm font-bold ${
                  page >= totalPages
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-slate-200 text-[#0B2A4A] hover:border-[#2EA9D6] hover:text-[#2EA9D6]'
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}

function QueueTab({ label, count, href, active }: { label: string; count: number; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-extrabold transition ${
        active
          ? 'border-[#2EA9D6] bg-[#F0F9FC] text-[#0B2A4A]'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#2EA9D6] hover:text-[#0B2A4A]'
      }`}
    >
      {label}
      <span className={active ? 'text-[#2EA9D6]' : 'text-slate-400'}>{count}</span>
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
