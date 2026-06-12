import Link from 'next/link';
import { CalendarClock, Fan, MapPin, Monitor, Snowflake, Wrench } from 'lucide-react';
import type { BookingRow } from '@/features/bookings/queries';

const statusStyles: Record<string, string> = {
  assigned: 'bg-amber-50 text-amber-600',
  accepted: 'bg-sky-50 text-[#2EA9D6]',
  on_the_way: 'bg-sky-50 text-[#2EA9D6]',
  in_progress: 'bg-sky-50 text-[#2EA9D6]',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-rose-50 text-rose-600'
};

export function TechnicianJobCard({ job, compact = false }: { job: BookingRow; compact?: boolean }) {
  const serviceTitle = job.services?.title || job.service_id || 'General Inquiry';
  const price = job.final_price ? `৳${job.final_price.toLocaleString('en')}` : '৳ TBD';
  const statusLabel = formatStatus(job.status);
  const Icon = getServiceIcon(job.service_id || serviceTitle);
  const disabled = ['completed', 'cancelled'].includes(job.status);

  return (
    <Link
      href={`/technician/jobs/${job.order_id}`}
      className="block rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2EA9D6] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${disabled ? 'bg-emerald-50 text-emerald-500' : 'bg-[#F0F9FC] text-[#2EA9D6]'}`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-[#0B2A4A]">{serviceTitle}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400">Order #{job.order_id}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold capitalize ${statusStyles[job.status] || 'bg-slate-100 text-slate-500'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
        <Info icon={<MapPin className="size-4" />} text={job.address} />
        <Info icon={<CalendarClock className="size-4" />} text={compact ? formatDate(job.preferred_date) : job.preferred_time} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-extrabold text-[#0B2A4A]">{price}</p>
          <span className={`inline-flex min-h-[42px] items-center rounded-2xl px-4 text-sm font-extrabold ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-[#0B2A4A] text-white'}`}>
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span className="max-w-[220px] truncate">{text}</span>
    </span>
  );
}

function getServiceIcon(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('ac')) return Snowflake;
  if (normalized.includes('fan') || normalized.includes('hood')) return Fan;
  if (normalized.includes('tv')) return Monitor;
  return Wrench;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatStatus(value: string) {
  if (value === 'assigned') return 'pending';
  if (value === 'on_the_way') return 'on way';
  return value.replaceAll('_', ' ');
}
