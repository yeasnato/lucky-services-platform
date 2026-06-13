import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const adminColors = {
  navy: '#12234D',
  ink: '#000D32',
  surface: '#F7F9FB',
  surfaceLow: '#F2F4F6',
  border: '#D8DADC',
  cyan: '#2EA9D6'
};

export const adminButtonClass = {
  primary:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#000D32] bg-[#000D32] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12234D]',
  cyan:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#2EA9D6] bg-[#2EA9D6] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#238FBA]',
  secondary:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#C5C6D0] bg-white px-4 text-sm font-semibold text-[#000D32] transition hover:border-[#2EA9D6] hover:text-[#00677D]',
  danger:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100'
};

export const adminInputClass =
  'min-h-11 w-full rounded border border-[#C5C6D0] bg-[#F7F9FB] px-3 py-2 text-sm font-medium text-[#000D32] outline-none transition placeholder:text-[#757680] focus:border-[#000D32] focus:bg-white focus:ring-2 focus:ring-[#000D32]/10';

export const adminInputWithIconClass =
  'min-h-11 w-full rounded border border-[#C5C6D0] bg-[#F7F9FB] py-2 pl-11 pr-3 text-sm font-medium text-[#000D32] outline-none transition placeholder:text-[#757680] focus:border-[#000D32] focus:bg-white focus:ring-2 focus:ring-[#000D32]/10';

export function AdminCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-lg border border-[#D8DADC] bg-white shadow-[0_1px_2px_rgba(18,35,77,0.04)]', className)}>
      {children}
    </section>
  );
}

export function AdminCardHeader({
  title,
  description,
  icon,
  action,
  className
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-[#D8DADC] p-5 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-xl font-semibold leading-7 text-[#000D32]">
          {icon ? <span className="flex size-8 shrink-0 items-center justify-center rounded bg-[#000D32] text-white">{icon}</span> : null}
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm font-medium leading-5 text-[#45464F]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'info',
  href
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'navy';
  href?: string;
}) {
  const toneClass = {
    info: 'bg-[#D0E1FB] text-[#12234D]',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    navy: 'bg-[#12234D] text-white'
  }[tone];

  const content = (
    <div className="rounded-lg border border-[#D8DADC] bg-white p-5 shadow-[0_1px_2px_rgba(18,35,77,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none text-[#000D32]">{value}</p>
        </div>
        {icon ? <span className={cn('flex size-11 shrink-0 items-center justify-center rounded', toneClass)}>{icon}</span> : null}
      </div>
      {helper ? <p className="mt-4 border-t border-[#D8DADC] pt-3 text-sm font-medium text-[#45464F]">{helper}</p> : null}
    </div>
  );

  if (!href) return content;
  return (
    <a href={href} className="block transition hover:-translate-y-0.5 hover:shadow-sm">
      {content}
    </a>
  );
}

export function AdminFieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#191C1E]">{children}</span>;
}

export function formatBdt(value?: number | null) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`;
}

export function normalizeBdPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return `+${digits}`;
  if (digits.startsWith('0')) return `+88${digits}`;
  if (digits.startsWith('1')) return `+880${digits}`;
  return phone;
}
