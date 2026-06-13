import Link from 'next/link';
import { CalendarClock, MapPin, UserRound } from 'lucide-react';
import { formatTaka, getTechnicianStatusStyle, isDelayedJob, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import type { BookingRow } from '@/features/bookings/queries';

export function TechnicianJobCard({ job, compact = false }: { job: BookingRow; compact?: boolean }) {
  const serviceTitle = job.services?.title || job.service_id || 'General Service';
  const delayed = isDelayedJob(job.preferred_date, job.status);
  const visualStatus = delayed ? 'delayed' : job.status;
  const status = getTechnicianStatusStyle(visualStatus);
  const actionLabel = job.status === 'completed' ? 'Receipt' : 'View Details';
  const href = job.status === 'completed' ? `/technician/jobs/${job.order_id}/receipt` : `/technician/jobs/${job.order_id}`;

  if (compact) {
    return (
      <TechnicianCard accent={status.accent} className="p-0">
        <Link href={href} className="block p-5 pl-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#45464F]">#{shortOrderId(job.order_id)}</p>
              <h3 className="mt-3 line-clamp-1 text-[18px] font-semibold leading-6 tracking-normal text-[#000D32]">{serviceTitle}</h3>
            </div>
            <TechnicianStatusBadge status={visualStatus} />
          </div>
          <p className="mt-4 flex items-start gap-3 text-[14px] font-medium leading-6 text-[#45464F]">
            <MapPin className="mt-0.5 size-5 shrink-0 text-[#757680]" strokeWidth={2.2} aria-hidden="true" />
            <span className="line-clamp-1">{job.address}</span>
          </p>
          <p className="mt-5 flex items-start gap-3 border-t border-[#D8DADC] pt-4 text-[14px] font-medium leading-6 text-[#45464F]">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#757680]" strokeWidth={2.2} aria-hidden="true" />
            <span>{job.status === 'completed' ? `Finished: ${formatOrderSchedule(job.preferred_date, job.preferred_time)}` : `Scheduled: ${formatOrderSchedule(job.preferred_date, job.preferred_time)}`}</span>
          </p>
        </Link>
      </TechnicianCard>
    );
  }

  return (
    <TechnicianCard accent={status.accent} className="p-0">
      <div className={compact ? 'p-5 pl-6' : 'p-5 pl-6'}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[19px] font-semibold leading-6 tracking-normal text-[#000D32]">{serviceTitle}</h3>
            <p className="mt-2 text-[15px] font-medium tracking-[0.04em] text-[#45464F]">{shortOrderId(job.order_id)}</p>
          </div>
          <TechnicianStatusBadge status={visualStatus} />
        </div>

        <div className="mt-6 grid gap-3 border-b border-[#D8DADC] pb-6 text-[14px] font-medium leading-6 text-[#45464F]">
          <p className="flex items-start gap-4">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#757680]" strokeWidth={2.2} aria-hidden="true" />
            <span>{formatOrderSchedule(job.preferred_date, job.preferred_time)}</span>
          </p>
          <p className="flex items-start gap-4">
            <MapPin className="mt-0.5 size-5 shrink-0 text-[#757680]" strokeWidth={2.2} aria-hidden="true" />
            <span className="line-clamp-2">{job.address}</span>
          </p>
          <p className="flex items-center gap-4">
            <UserRound className="size-5 shrink-0 text-[#757680]" strokeWidth={2.2} aria-hidden="true" />
            <span>{job.customer_name}</span>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[21px] font-semibold tracking-normal text-[#000D32]">{formatTaka(job.final_price)}</p>
          <Link
            href={href}
            className={`inline-flex min-h-[48px] min-w-[118px] items-center justify-center rounded-[10px] px-4 text-[14px] font-bold tracking-normal transition ${
              job.status === 'completed' ? 'border border-[#C5C6D0] bg-[#F2F4F6] text-[#000D32] hover:border-[#2EA9D6]' : 'bg-[#000D32] text-white hover:bg-[#12234D]'
            }`}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </TechnicianCard>
  );
}

function shortOrderId(orderId: string) {
  return orderId;
}

function formatOrderSchedule(dateValue: string, timeValue: string) {
  const date = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(new Date(dateValue));
  const normalizedTime = timeValue.includes('(') ? timeValue.split('(')[0].trim() : timeValue;
  return `${normalizedTime}, ${date}`;
}
