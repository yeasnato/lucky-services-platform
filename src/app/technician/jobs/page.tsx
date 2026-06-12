import Link from 'next/link';
import { CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';
import { TechnicianJobCard } from '@/components/technician/TechnicianJobCard';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { isDelayedJob, TechnicianCard } from '@/components/technician/TechnicianUI';
import { getTechnicianAllJobs } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianJobsPage({ searchParams }: { searchParams?: Promise<{ view?: string; q?: string }> }) {
  const params = await searchParams;
  const view = params?.view || 'all';
  const query = (params?.q || '').trim().toLowerCase();
  const profile = await requireRole(['technician']);
  const allJobs = await getTechnicianAllJobs(profile.id, 100);

  const filteredByView = allJobs.filter((job) => {
    if (view === 'active') return ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(job.status);
    if (view === 'completed') return job.status === 'completed';
    if (view === 'delayed') return isDelayedJob(job.preferred_date, job.status);
    return true;
  });

  const visibleJobs = filteredByView.filter((job) => {
    if (!query) return true;
    return [job.order_id, job.customer_name, job.customer_phone, job.address, job.services?.title, job.service_id, job.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const counts = {
    all: allJobs.length,
    active: allJobs.filter((job) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(job.status)).length,
    delayed: allJobs.filter((job) => isDelayedJob(job.preferred_date, job.status)).length,
    completed: allJobs.filter((job) => job.status === 'completed').length
  };

  return (
    <TechnicianShell title="LSC" showMenu>
      <h1 className="text-[44px] font-black leading-[52px] tracking-normal text-[#000D32]">All Orders</h1>

      <form className="mt-6 flex gap-3" action="/technician/jobs">
        <input type="hidden" name="view" value={view} />
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-7 -translate-y-1/2 text-[#64748B]" aria-hidden="true" />
          <input
            name="q"
            defaultValue={params?.q || ''}
            placeholder="Search by ID, Customer, or Service"
            className="min-h-16 w-full rounded-xl border border-slate-200 bg-[#E9F0F8] py-3 pl-14 pr-4 text-[20px] font-medium text-[#000D32] outline-none transition placeholder:text-[#64748B] focus:border-[#000D32] focus:bg-white"
          />
        </label>
        <button type="submit" className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#000D32] shadow-sm" aria-label="Apply search">
          <SlidersHorizontal className="size-7" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <FilterChip href="/technician/jobs" active={view === 'all'} label="All" count={counts.all} />
        <FilterChip href="/technician/jobs?view=active" active={view === 'active'} label="Active" count={counts.active} />
        <FilterChip href="/technician/jobs?view=delayed" active={view === 'delayed'} label="Delayed" count={counts.delayed} />
        <FilterChip href="/technician/jobs?view=completed" active={view === 'completed'} label="Completed" count={counts.completed} />
      </div>

      <section className="mt-7 space-y-6">
        {visibleJobs.map((job) => (
          <TechnicianJobCard key={job.id} job={job} />
        ))}
        {visibleJobs.length === 0 ? (
          <TechnicianCard className="p-10 text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black text-[#000D32]">No orders found</h2>
            <p className="mt-2 text-base font-medium text-[#64748B]">Try another search or filter.</p>
          </TechnicianCard>
        ) : null}
      </section>
    </TechnicianShell>
  );
}

function FilterChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black transition ${
        active ? 'bg-[#000D32] text-white' : 'border border-slate-200 bg-white text-[#64748B]'
      }`}
    >
      {label}
      <span className={active ? 'text-white/75' : 'text-[#00677D]'}>{count}</span>
    </Link>
  );
}
