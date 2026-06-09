import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, CalendarClock, MapPin, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { BookingRow } from '@/features/bookings/queries';

const activeStatuses = ['assigned', 'accepted', 'on_the_way', 'in_progress'];

export function TechnicianJobCard({ job, compact = false }: { job: BookingRow; compact?: boolean }) {
  const serviceTitle = job.services?.title || job.service_id || 'General Inquiry';
  const isActive = activeStatuses.includes(job.status);
  const isLate = isActive && isPastDate(job.preferred_date);
  const price = job.final_price ? `BDT ${job.final_price.toLocaleString('en')}` : 'Price pending';

  return (
    <Link
      href={`/technician/jobs/${job.order_id}`}
      className="group block rounded-lg border border-sky-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2EA9D6] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold tracking-wide text-[#0B2A4A]">{job.order_id}</p>
            {isLate ? (
              <span className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-600">Late</span>
            ) : null}
          </div>
          <h3 className="mt-1 text-base font-extrabold leading-6 text-[#0B2A4A]">{job.customer_name}</h3>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{serviceTitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={job.status} />
          <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#2EA9D6]" aria-hidden="true" />
        </div>
      </div>

      <div className={`mt-4 grid gap-2 text-sm font-semibold text-slate-600 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <Info icon={<CalendarClock className="size-4" />} text={`${formatDate(job.preferred_date)} / ${job.preferred_time}`} />
        <Info icon={<MapPin className="size-4" />} text={job.address} />
        {!compact ? <Info icon={<Phone className="size-4" />} text={job.customer_phone} /> : null}
        <Info icon={<BadgeDollarSign className="size-4" />} text={price} />
      </div>
    </Link>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 shrink-0 text-[#2EA9D6]">{icon}</span>
      <span className="line-clamp-2">{text}</span>
    </p>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function isPastDate(value: string) {
  const today = new Date().toISOString().slice(0, 10);
  return value < today;
}
