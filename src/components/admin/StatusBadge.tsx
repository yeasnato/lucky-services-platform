const statusStyles: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-100 text-amber-800',
  confirmed: 'border-sky-200 bg-sky-100 text-sky-800',
  assigned: 'border-violet-200 bg-violet-100 text-violet-800',
  accepted: 'border-blue-200 bg-blue-100 text-blue-800',
  on_the_way: 'border-cyan-200 bg-cyan-100 text-cyan-800',
  in_progress: 'border-purple-200 bg-purple-100 text-purple-800',
  completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  cancelled: 'border-rose-200 bg-rose-100 text-rose-800'
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'border-gray-200 bg-gray-50 text-gray-600';

  return (
    <span className={`inline-flex min-h-7 items-center justify-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.06em] ${style}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
