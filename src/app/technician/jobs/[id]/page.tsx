import { StatusBadge } from '@/components/admin/StatusBadge';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { updateBookingStatus } from '@/features/bookings/actions';
import { getBookingByOrderId } from '@/features/bookings/queries';
import { getAllowedStatusTransitions } from '@/features/bookings/status-machine';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(['technician']);
  const job = await getBookingByOrderId(id);
  const allowedActions = getAllowedStatusTransitions(job.status, 'technician');

  return (
    <TechnicianShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Assigned Job</p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{job.order_id}</h1>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p><strong className="text-[#0B2A4A]">Service:</strong> {job.services?.title || job.service_id || 'General Inquiry'}</p>
            <p><strong className="text-[#0B2A4A]">Customer:</strong> {job.customer_name}</p>
            <p><strong className="text-[#0B2A4A]">Phone:</strong> {job.customer_phone}</p>
            <p><strong className="text-[#0B2A4A]">Address:</strong> {job.address}</p>
            <p><strong className="text-[#0B2A4A]">Schedule:</strong> {job.preferred_date} / {job.preferred_time}</p>
          </div>
        </section>
        <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-[#0B2A4A]">Update Status</h2>
          {allowedActions.includes('accepted') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'accepted'); }} className="mt-4">
              <button className="w-full rounded-xl bg-[#2EA9D6] py-3 text-sm font-bold text-white">Accept Job</button>
            </form>
          ) : null}
          {allowedActions.includes('on_the_way') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'on_the_way'); }} className="mt-3">
              <button className="w-full rounded-xl bg-[#0B2A4A] py-3 text-sm font-bold text-white">On The Way</button>
            </form>
          ) : null}
          {allowedActions.includes('in_progress') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'in_progress'); }} className="mt-3">
              <button className="w-full rounded-xl bg-[#0B2A4A] py-3 text-sm font-bold text-white">Start Work</button>
            </form>
          ) : null}
          {allowedActions.includes('completed') ? (
            <form action={async () => { 'use server'; await updateBookingStatus(job.id, 'completed'); }} className="mt-3">
              <button className="w-full rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white">Complete Job</button>
            </form>
          ) : null}
          {allowedActions.length === 0 ? (
            <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm font-semibold text-gray-500">No technician action is available for this status.</p>
          ) : null}
        </aside>
      </div>
    </TechnicianShell>
  );
}
