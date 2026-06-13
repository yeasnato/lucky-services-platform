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

  return (
    <TechnicianShell title="LSC" showMenu>
      <h1 className="text-[30px] font-extrabold leading-9 tracking-normal text-[#000D32]">
        {view === 'delayed' ? 'Delayed' : view === 'completed' ? 'Completed' : 'All Orders'}
      </h1>

      <form className="mt-6 flex gap-3" action="/technician/jobs">
        <input type="hidden" name="view" value={view} />
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#64748B]" strokeWidth={2.1} aria-hidden="true" />
          <input
            name="q"
            defaultValue={params?.q || ''}
            placeholder="Search by ID, Customer, or Service"
            className="min-h-[54px] w-full rounded-[10px] border border-[#D7DEE8] bg-[#E9F0F8] py-3 pl-11 pr-2 text-[13px] font-medium text-[#000D32] outline-none transition placeholder:text-[#64748B] focus:border-[#000D32] focus:bg-white"
          />
        </label>
        <button type="submit" className="flex size-[54px] shrink-0 items-center justify-center rounded-[10px] border border-[#E0E3E5] bg-white text-[#000D32] shadow-[0_2px_8px_rgba(18,35,77,0.08)]" aria-label="Apply search">
          <SlidersHorizontal className="size-6" strokeWidth={2.2} aria-hidden="true" />
        </button>
      </form>

      <section className="mt-8 space-y-5">
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
