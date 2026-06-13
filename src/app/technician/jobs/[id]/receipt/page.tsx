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
      <TechnicianCard accent={status.accent} className="mt-2 p-6 pl-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[16px] font-medium uppercase tracking-[0.18em] text-[#45464F]">Order ID</p>
            <h1 className="mt-4 text-[26px] font-extrabold leading-8 text-[#000D32]">{shortOrderId(job.order_id)}</h1>
            <p className="mt-6 flex items-center gap-4 text-[18px] font-medium leading-7 text-[#45464F]">
              <CalendarDays className="size-6" aria-hidden="true" />
              {formatReceiptDate(job.completed_at || job.updated_at || job.preferred_date, job.preferred_time)}
            </p>
          </div>
          <span className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#D1FAE5] px-4 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#10B981]">
            <CheckCircle2 className="size-5 fill-[#10B981] text-white" aria-hidden="true" />
            Completed
          </span>
        </div>
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
        <div className="space-y-7 border-t border-[#C5C6D0] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-medium leading-7 text-[#191C1E]">{serviceTitle}</h2>
              <p className="mt-2 text-[16px] font-extrabold text-[#45464F]">Base Service</p>
            </div>
            <p className="text-[22px] font-extrabold text-[#191C1E]">{formatTaka(total)}</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-medium leading-7 text-[#191C1E]">Additional Part</h2>
              <p className="mt-2 text-[16px] font-extrabold text-[#45464F]">As needed</p>
            </div>
            <p className="text-[22px] font-extrabold text-[#191C1E]">{formatTaka(partAmount)}</p>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#10B981]">
            <p className="flex items-center gap-3 text-[20px] font-medium">
              <Tag className="size-6" aria-hidden="true" />
              Discount Applied
            </p>
            <p className="text-[20px] font-medium">-{formatTaka(discount)}</p>
          </div>
        </div>
        <div className="bg-[#F2F4F6] p-6">
          <div className="flex items-center justify-between text-[18px] font-medium text-[#45464F]">
            <span>Payment Method</span>
            <span className="font-extrabold text-[#191C1E]">Cash on Delivery</span>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <p className="text-[26px] font-extrabold text-[#000D32]">Total Paid</p>
            <p className="text-[46px] font-extrabold leading-none text-[#000D32]">{formatTaka(total + partAmount - discount).replace(' ', '')}</p>
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
