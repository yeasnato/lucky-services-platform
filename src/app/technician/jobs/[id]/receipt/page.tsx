import Link from 'next/link';
import { CalendarDays, CheckCircle2, MapPin, Tag } from 'lucide-react';
import { TechnicianPrintButton } from '@/components/technician/TechnicianPrintButton';
import { TechnicianShareButton } from '@/components/technician/TechnicianShareButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatTaka, getTechnicianStatusStyle, TechnicianCard } from '@/components/technician/TechnicianUI';
import { getTechnicianBookingByOrderId } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole(['technician']);
  const job = await getTechnicianBookingByOrderId(id, profile.id);
  const serviceTitle = job.services?.title || job.service_id || 'General Service';
  const total = job.final_price || 0;
  const partAmount = 0;
  const discount = 0;
  const status = getTechnicianStatusStyle(job.status === 'completed' ? 'completed' : job.status);

  return (
    <TechnicianShell
      title="Receipt"
      backHref={`/technician/jobs/${job.order_id}`}
      hideNav
      wide
      largeHeader
      headerAction={<TechnicianShareButton title={`Receipt ${job.order_id}`} text={`${serviceTitle} receipt for ${job.customer_name}`} />}
    >
      <TechnicianCard accent={status.accent} className="mt-2 p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Order ID</p>
            <h1 className="mt-3 whitespace-nowrap text-[24px] font-bold leading-7 text-[#000D32]">{shortOrderId(job.order_id)}</h1>
          </div>
          <span className="inline-flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-full bg-[#D1FAE5] px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10B981]">
            <CheckCircle2 className="size-4 fill-[#10B981] text-white" aria-hidden="true" />
            Completed
          </span>
        </div>
        <p className="mt-5 flex items-center gap-3 text-[15px] font-medium leading-6 text-[#45464F]">
          <CalendarDays className="size-5 shrink-0" aria-hidden="true" />
          {formatReceiptDate(job.completed_at || job.updated_at || job.preferred_date, job.preferred_time)}
        </p>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-6">
        <p className="text-[16px] font-medium uppercase tracking-[0.18em] text-[#45464F]">Customer Details</p>
        <div className="mt-5 border-t border-[#C5C6D0] pt-6">
          <div className="flex items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E9F0F8] text-[22px] font-extrabold text-[#000D32]">
              {initials(job.customer_name)}
            </div>
            <div>
              <h2 className="text-[24px] font-extrabold leading-8 text-[#000D32]">{job.customer_name}</h2>
              <p className="mt-2 flex items-center gap-2 text-[18px] font-medium leading-7 text-[#45464F]">
                <MapPin className="size-5" aria-hidden="true" />
                {job.address}
              </p>
            </div>
          </div>
        </div>
      </TechnicianCard>

      <TechnicianCard className="mt-6 p-0">
        <div className="p-6">
          <p className="text-[16px] font-medium uppercase tracking-[0.18em] text-[#45464F]">Service Breakdown</p>
        </div>
        <div className="space-y-7 border-t border-[#C5C6D0] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[18px] font-medium leading-7 text-[#191C1E]">{serviceTitle}</h2>
              <p className="mt-2 text-[14px] font-bold text-[#45464F]">Base Service</p>
            </div>
            <p className="shrink-0 text-right text-[20px] font-bold text-[#191C1E]">{formatTaka(total).replace(' ', '')}</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[18px] font-medium leading-7 text-[#191C1E]">Additional Part</h2>
              <p className="mt-2 text-[14px] font-bold text-[#45464F]">As needed</p>
            </div>
            <p className="shrink-0 text-right text-[20px] font-bold text-[#191C1E]">{formatTaka(partAmount).replace(' ', '')}</p>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#10B981]">
            <p className="flex min-w-0 items-center gap-3 text-[18px] font-medium">
              <Tag className="size-5 shrink-0" aria-hidden="true" />
              Discount Applied
            </p>
            <p className="shrink-0 text-[18px] font-medium">-{formatTaka(discount).replace(' ', '')}</p>
          </div>
        </div>
        <div className="bg-[#F2F4F6] p-5">
          <div className="grid gap-1 text-[15px] font-medium text-[#45464F]">
            <span>Payment Method</span>
            <span className="text-[17px] font-bold text-[#191C1E]">Cash on Delivery</span>
          </div>
          <div className="mt-7 flex items-end justify-between gap-3">
            <p className="shrink-0 text-[24px] font-bold text-[#000D32]">Total Paid</p>
            <p className="min-w-0 text-right text-[38px] font-bold leading-none text-[#000D32]">{formatTaka(total + partAmount - discount).replace(' ', '')}</p>
          </div>
        </div>
      </TechnicianCard>

      <div className="mt-10 space-y-4">
        <TechnicianPrintButton />
        <Link href="/technician/dashboard" className="inline-flex min-h-[60px] w-full items-center justify-center rounded-[20px] border border-[#C5C6D0] text-[20px] font-medium text-[#000D32]">
          Back to Dashboard
        </Link>
      </div>
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

function shortOrderId(orderId: string) {
  return orderId.replace(/^LSC-/, 'UQ-').slice(0, 9);
}

function formatReceiptDate(dateValue: string, timeValue: string) {
  const date = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
  const time = timeValue.includes('(') ? timeValue.split('(')[0].trim() : timeValue;
  return `${date} at ${time}`;
}
