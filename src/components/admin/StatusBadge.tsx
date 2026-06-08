const statusStyles: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-700',
  assigned: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  accepted: 'border-blue-200 bg-blue-50 text-blue-700',
  on_the_way: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  in_progress: 'border-purple-200 bg-purple-50 text-purple-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700'
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'border-gray-200 bg-gray-50 text-gray-600';

  return (
    <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${style}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
