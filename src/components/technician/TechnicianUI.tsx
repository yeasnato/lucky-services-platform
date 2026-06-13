import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, { label: string; chip: string; accent: string }> = {
  assigned: {
    label: 'Pending',
    chip: 'bg-amber-50 text-amber-700',
    accent: 'bg-[#D97706]'
  },
  accepted: {
    label: 'Accepted',
    chip: 'bg-[#D0E1FB] text-[#12234D]',
    accent: 'bg-[#2EA9D6]'
  },
  on_the_way: {
    label: 'On The Way',
    chip: 'bg-[#D0E1FB] text-[#12234D]',
    accent: 'bg-[#2EA9D6]'
  },
  in_progress: {
    label: 'Ongoing',
    chip: 'bg-[#D0E1FB] text-[#12234D]',
    accent: 'bg-[#2EA9D6]'
  },
  completed: {
    label: 'Completed',
    chip: 'bg-emerald-50 text-emerald-700',
    accent: 'bg-[#059669]'
  },
  cancelled: {
    label: 'Cancelled',
    chip: 'bg-rose-50 text-rose-700',
    accent: 'bg-[#BA1A1A]'
  },
  delayed: {
    label: 'Delayed',
    chip: 'bg-amber-50 text-amber-700',
    accent: 'bg-[#D97706]'
  },
  issue: {
    label: 'Issue',
    chip: 'bg-rose-50 text-rose-700',
    accent: 'bg-[#BA1A1A]'
  }
};

export function getTechnicianStatusStyle(status: string) {
  return statusStyles[status] || {
    label: titleCase(status.replaceAll('_', ' ')),
    chip: 'bg-[#F2F4F6] text-[#45464F]',
    accent: 'bg-[#C5C6D0]'
  };
}

export function TechnicianStatusBadge({ status, label }: { status: string; label?: string }) {
  const style = getTechnicianStatusStyle(status);

  return (
    <span className={cn('inline-flex min-h-[30px] items-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.10em]', style.chip)}>
      {label || style.label}
    </span>
  );
}

export function TechnicianCard({
  children,
  className,
  accent
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <section className={cn('relative overflow-hidden rounded-lg border border-[#D8DADC] bg-white shadow-[0_1px_2px_rgba(18,35,77,0.04)]', className)}>
      {accent ? <span className={cn('absolute inset-y-0 left-0 w-1', accent)} aria-hidden="true" /> : null}
      {children}
    </section>
  );
}

export function TechnicianSectionTitle({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[20px] font-semibold leading-7 tracking-normal text-[#000D32]">{title}</h2>
      {action}
    </div>
  );
}

export function formatTaka(value?: number | null) {
  if (!value) return '৳0';
  return `৳ ${value.toLocaleString('en')}`;
}

export function formatDateShort(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function formatDateLong(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function isDelayedJob(preferredDate: string, status: string) {
  if (['completed', 'cancelled'].includes(status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(preferredDate);
  scheduled.setHours(0, 0, 0, 0);
  return scheduled < today;
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}
