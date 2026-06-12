import Link from 'next/link';
import { CalendarClock, MapPin, UserRound } from 'lucide-react';
import { formatDateShort, formatTaka, getTechnicianStatusStyle, isDelayedJob, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import type { BookingRow } from '@/features/bookings/queries';

export function TechnicianJobCard({ job, compact = false }: { job: BookingRow; compact?: boolean }) {
  const serviceTitle = job.services?.title || job.service_id || 'General Service';
  const delayed = isDelayedJob(job.preferred_date, job.status);
  const visualStatus = delayed ? 'delayed' : job.status;
  const status = getTechnicianStatusStyle(visualStatus);
  const actionLabel = job.status === 'completed' ? 'Receipt' : 'View Details';
  const href = job.status === 'completed' ? `/technician/jobs/${job.order_id}/receipt` : `/technician/jobs/${job.order_id}`;

  return (
    <TechnicianCard accent={status.accent} className="p-0">
      <div className="p-6 pl-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#64748B]">{job.order_id}</p>
            <h3 className="mt-2 line-clamp-2 text-[28px] font-black leading-8 tracking-normal text-[#000D32]">{serviceTitle}</h3>
          </div>
          <TechnicianStatusBadge status={visualStatus} />
        </div>

        <div className="mt-5 grid gap-3 border-b border-slate-200 pb-5 text-[16px] font-medium leading-6 text-[#64748B]">
          <p className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span>{compact ? formatDateShort(job.preferred_date) : `${job.preferred_time}, ${formatDateShort(job.preferred_date)}`}</span>
          </p>
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{job.address}</span>
          </p>
          <p className="flex items-center gap-3">
            <UserRound className="size-5 shrink-0" aria-hidden="true" />
            <span>{job.customer_name}</span>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[26px] font-black tracking-normal text-[#000D32]">{formatTaka(job.final_price)}</p>
          <Link
            href={href}
            className={`inline-flex min-h-14 min-w-[150px] items-center justify-center rounded-xl px-5 text-base font-black tracking-normal transition ${
              job.status === 'completed' ? 'bg-[#50D9FE] text-[#00677D] hover:bg-[#4CD6FB]' : 'bg-[#000D32] text-white hover:bg-[#12234D]'
            }`}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </TechnicianCard>
  );
}
