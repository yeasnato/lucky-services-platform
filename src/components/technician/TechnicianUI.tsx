import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, { label: string; chip: string; accent: string }> = {
  assigned: {
    label: 'Pending',
    chip: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500'
  },
  accepted: {
    label: 'Accepted',
    chip: 'bg-blue-100 text-blue-700',
    accent: 'bg-blue-500'
  },
  on_the_way: {
    label: 'On The Way',
    chip: 'bg-blue-100 text-blue-700',
    accent: 'bg-blue-500'
  },
  in_progress: {
    label: 'Ongoing',
    chip: 'bg-blue-100 text-blue-700',
    accent: 'bg-blue-500'
  },
  completed: {
    label: 'Completed',
    chip: 'bg-emerald-100 text-emerald-700',
    accent: 'bg-emerald-500'
  },
  cancelled: {
    label: 'Cancelled',
    chip: 'bg-red-100 text-red-700',
    accent: 'bg-red-500'
  },
  delayed: {
    label: 'Delayed',
    chip: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500'
  },
  issue: {
    label: 'Issue',
    chip: 'bg-red-100 text-red-700',
    accent: 'bg-red-500'
  }
};

export function getTechnicianStatusStyle(status: string) {
  return statusStyles[status] || {
    label: titleCase(status.replaceAll('_', ' ')),
    chip: 'bg-slate-100 text-slate-600',
    accent: 'bg-slate-300'
  };
}

export function TechnicianStatusBadge({ status, label }: { status: string; label?: string }) {
  const style = getTechnicianStatusStyle(status);

  return (
    <span className={cn('inline-flex min-h-8 items-center rounded-full px-4 text-xs font-extrabold uppercase tracking-[0.16em]', style.chip)}>
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
    <section className={cn('relative overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(18,35,77,0.05)]', className)}>
      {accent ? <span className={cn('absolute inset-y-0 left-0 w-1.5', accent)} aria-hidden="true" /> : null}
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
      <h2 className="text-[28px] font-black leading-9 tracking-normal text-[#000D32]">{title}</h2>
      {action}
    </div>
  );
}

export function formatTaka(value?: number | null) {
  if (!value) return '৳0';
  return `৳${value.toLocaleString('en')}`;
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
