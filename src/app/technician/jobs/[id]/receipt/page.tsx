import Link from 'next/link';
import { CalendarDays, Check, MapPin } from 'lucide-react';
import { TechnicianPrintButton } from '@/components/technician/TechnicianPrintButton';
import { TechnicianShareButton } from '@/components/technician/TechnicianShareButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatDateLong, formatTaka, getTechnicianStatusStyle, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import { getTechnicianBookingByOrderId } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole(['technician']);
  const job = await getTechnicianBookingByOrderId(id, profile.id);
  const serviceTitle = job.services?.title || job.service_id || 'General Service';
  const total = job.final_price || 0;
  const status = getTechnicianStatusStyle(job.status === 'completed' ? 'completed' : job.status);

  return (
    <TechnicianShell title="Receipt" backHref={`/technician/jobs/${job.order_id}`} hideNav>
      <div className="mb-4 flex justify-end">
        <TechnicianShareButton title={`Receipt ${job.order_id}`} text={`${serviceTitle} receipt for ${job.customer_name}`} />
      </div>

      <TechnicianCard accent={status.accent} className="p-6 pl-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Order ID</p>
            <h1 className="mt-3 text-3xl font-black text-[#000D32]">{job.order_id}</h1>
            <p className="mt-6 flex items-center gap-4 text-2xl font-medium text-[#45464F]">
              <CalendarDays className="size-8" aria-hidden="true" />
              {formatDateLong(job.completed_at || job.updated_at || job.preferred_date)}
            </p>
          </div>
          <TechnicianStatusBadge status={job.status === 'completed' ? 'completed' : job.status} />
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#45464F]">Customer Details</p>
        <div className="mt-5 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#E9F0F8] text-3xl font-black text-[#000D32]">
              {initials(job.customer_name)}
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#000D32]">{job.customer_name}</h2>
              <p className="mt-2 flex items-center gap-2 text-2xl font-medium text-[#45464F]">
                <MapPin className="size-6" aria-hidden="true" />
                {job.address}
              </p>
            </div>
          </div>
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-0">
        <div className="p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#45464F]">Service Breakdown</p>
        </div>
        <div className="border-t border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium leading-8 text-[#191C1E]">{serviceTitle}</h2>
              <p className="mt-2 text-lg font-black text-[#45464F]">Base Service</p>
            </div>
            <p className="text-2xl font-black text-[#191C1E]">{formatTaka(total)}</p>
          </div>
        </div>
        <div className="bg-[#F2F4F6] p-6">
          <div className="flex items-center justify-between text-2xl font-medium text-[#45464F]">
            <span>Payment Method</span>
            <span className="font-black text-[#191C1E]">Cash on Delivery</span>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <p className="text-3xl font-black text-[#000D32]">Total Value</p>
            <p className="text-[52px] font-black leading-none text-[#000D32]">{formatTaka(total)}</p>
          </div>
        </div>
      </TechnicianCard>

      <div className="mt-8 space-y-4">
        <TechnicianPrintButton />
        <Link href="/technician/dashboard" className="inline-flex min-h-16 w-full items-center justify-center rounded-2xl border border-slate-300 text-2xl font-medium text-[#000D32]">
          Back to Dashboard
        </Link>
      </div>

      {job.status === 'completed' ? (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-emerald-700">
          <Check className="size-5" aria-hidden="true" />
          Completion saved
        </p>
      ) : null}
    </TechnicianShell>
  );
}

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
