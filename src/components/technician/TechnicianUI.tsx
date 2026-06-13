import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, { label: string; chip: string; accent: string }> = {
  assigned: {
    label: 'Pending',
    chip: 'bg-[#FFF3D8] text-[#B45309]',
    accent: 'bg-[#F59E0B]'
  },
  accepted: {
    label: 'Accepted',
    chip: 'bg-[#DBEAFE] text-[#2563EB]',
    accent: 'bg-[#3B82F6]'
  },
  on_the_way: {
    label: 'On The Way',
    chip: 'bg-[#DBEAFE] text-[#2563EB]',
    accent: 'bg-[#3B82F6]'
  },
  in_progress: {
    label: 'Ongoing',
    chip: 'bg-[#DBEAFE] text-[#2563EB]',
    accent: 'bg-[#3B82F6]'
  },
  completed: {
    label: 'Completed',
    chip: 'bg-[#D1FAE5] text-[#059669]',
    accent: 'bg-[#10B981]'
  },
  cancelled: {
    label: 'Cancelled',
    chip: 'bg-[#FEE2E2] text-[#DC2626]',
    accent: 'bg-[#EF4444]'
  },
  delayed: {
    label: 'Delayed',
    chip: 'bg-[#FFF3D8] text-[#D97706]',
    accent: 'bg-[#F59E0B]'
  },
  issue: {
    label: 'Issue',
    chip: 'bg-[#FEE2E2] text-[#DC2626]',
    accent: 'bg-[#EF4444]'
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
    <span className={cn('inline-flex min-h-[38px] items-center rounded-full px-4 text-[13px] font-extrabold uppercase tracking-[0.14em]', style.chip)}>
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
    <section className={cn('relative overflow-hidden rounded-[16px] border border-[#E0E3E5] bg-white shadow-[0_4px_12px_rgba(18,35,77,0.05)]', className)}>
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
      <h2 className="text-[28px] font-extrabold leading-9 tracking-normal text-[#000D32]">{title}</h2>
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
