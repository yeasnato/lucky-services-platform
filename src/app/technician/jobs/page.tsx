import Link from 'next/link';
import { CalendarDays, CheckCircle2, ListChecks } from 'lucide-react';
import { TechnicianJobCard } from '@/components/technician/TechnicianJobCard';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { getTechnicianCompletedJobs, getTechnicianJobs } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianJobsPage({ searchParams }: { searchParams?: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const view = params?.view || 'active';
  const profile = await requireRole(['technician']);
  const [activeJobs, completedJobs] = await Promise.all([getTechnicianJobs(profile.id), getTechnicianCompletedJobs(profile.id, 50)]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayJobs = activeJobs.filter((job) => job.preferred_date === todayKey);
  const visibleJobs = view === 'completed' ? completedJobs : view === 'today' ? todayJobs : activeJobs;

  return (
    <TechnicianShell>
      <div className="mx-auto w-full max-w-[470px]">
        <section className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Order list</p>
          <div className="mt-2">
            <h1 className="text-2xl font-extrabold text-[#0B2A4A]">Assigned work orders</h1>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">Filter your active work, today schedule, and completed jobs.</p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-slate-50 p-1 text-sm font-semibold">
            <Tab href="/technician/jobs" active={view === 'active'} icon={<ListChecks className="size-4" />} label="Active" count={activeJobs.length} />
            <Tab href="/technician/jobs?view=today" active={view === 'today'} icon={<CalendarDays className="size-4" />} label="Today" count={todayJobs.length} />
            <Tab href="/technician/jobs?view=completed" active={view === 'completed'} icon={<CheckCircle2 className="size-4" />} label="Done" count={completedJobs.length} />
          </div>
        </section>

        <section className="mt-5 space-y-4">
          {visibleJobs.map((job) => (
            <TechnicianJobCard key={job.id} job={job} />
          ))}
          {visibleJobs.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto size-9 text-emerald-500" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-[#0B2A4A]">No jobs in this view</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">When admin assigns or completes work, it will appear here.</p>
            </div>
          ) : null}
        </section>
      </div>
    </TechnicianShell>
  );
}

function Tab({
  href,
  active,
  icon,
  label,
  count
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl px-2 transition sm:gap-2 sm:px-3 ${
        active ? 'bg-white text-[#0B2A4A] shadow-sm' : 'text-slate-500 hover:bg-white hover:text-[#0B2A4A]'
      }`}
    >
      <span className={active ? 'text-[#2EA9D6]' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
      <span className="rounded-full bg-[#EAF8FD] px-2 py-0.5 text-[11px] font-bold text-[#0B2A4A]">{count}</span>
    </Link>
  );
}
