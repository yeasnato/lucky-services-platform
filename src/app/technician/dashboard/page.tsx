import Link from 'next/link';
import { CheckCircle2, ClipboardClock, History, LoaderCircle, WalletCards } from 'lucide-react';
import { TechnicianJobCard } from '@/components/technician/TechnicianJobCard';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatTaka, isDelayedJob, TechnicianCard } from '@/components/technician/TechnicianUI';
import { getTechnicianAllJobs, getTechnicianCompletedJobs, getTechnicianJobs } from '@/features/bookings/queries';
import { getTechnicianById } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianDashboardPage() {
  const profile = await requireRole(['technician']);
  const [activeJobs, allJobs, completedJobs, technician] = await Promise.all([
    getTechnicianJobs(profile.id),
    getTechnicianAllJobs(profile.id, 50),
    getTechnicianCompletedJobs(profile.id, 50),
    getTechnicianById(profile.id)
  ]);
  const displayName = technician?.display_name || profile.full_name;
  const pendingJobs = activeJobs.filter((job) => job.status === 'assigned');
  const inProgressJobs = activeJobs.filter((job) => ['accepted', 'on_the_way', 'in_progress'].includes(job.status));
  const delayedJobs = activeJobs.filter((job) => isDelayedJob(job.preferred_date, job.status));
  const completedValue = completedJobs.reduce((total, job) => total + (job.final_price || 0), 0);
  const orderPreview = allJobs.slice(0, 2);

  return (
    <TechnicianShell title="LSC">
      <section>
        <h1 className="text-[36px] font-black leading-[44px] tracking-normal text-[#000D32]">Good {getDayPart()}, {firstName(displayName)}</h1>
        <p className="mt-3 text-[22px] font-medium leading-8 text-[#64748B]">
          You have {activeJobs.length} active {activeJobs.length === 1 ? 'job' : 'jobs'} on your board.
        </p>
      </section>

      <TechnicianCard className="mt-8 bg-[#12234D] p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/14">
              <WalletCards className="size-8" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[28px] font-black leading-8">Job Value</h2>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">Completed services</p>
            </div>
          </div>
          <span className="rounded-full bg-white/18 px-5 py-2 text-base font-black">Active</span>
        </div>
        <div className="mt-7">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-white/70">Total completed value</p>
          <p className="mt-2 text-[46px] font-black leading-none tracking-normal drop-shadow">{formatTaka(completedValue)}</p>
        </div>
        <Link href="/technician/jobs?view=completed" className="mt-7 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-xl border border-white/25 bg-white/10 text-xl font-black text-white transition hover:bg-white/15">
          <History className="size-7" aria-hidden="true" />
          History
        </Link>
      </TechnicianCard>

      <section className="mt-8 grid grid-cols-3 gap-5">
        <Metric icon={<ClipboardClock className="size-7" />} label="Pending" value={pendingJobs.length} tone="amber" />
        <Metric icon={<LoaderCircle className="size-7" />} label="In Progress" value={inProgressJobs.length} tone="blue" />
        <Metric icon={<CheckCircle2 className="size-7" />} label="Done" value={completedJobs.length} tone="green" />
      </section>

      {delayedJobs.length > 0 ? (
        <Link href="/technician/jobs?view=delayed" className="mt-6 block rounded-2xl border border-amber-200 bg-amber-50 p-4 text-base font-black text-amber-800">
          {delayedJobs.length} delayed {delayedJobs.length === 1 ? 'job needs' : 'jobs need'} attention
        </Link>
      ) : null}

      <section className="mt-9">
        <div className="flex items-center justify-between">
          <h2 className="text-[28px] font-black leading-9 text-[#000D32]">Order List</h2>
          <Link href="/technician/jobs" className="text-lg font-black text-[#00677D]">
            See All
          </Link>
        </div>
        <div className="mt-5 space-y-6">
          {orderPreview.map((job) => (
            <TechnicianJobCard key={job.id} job={job} compact />
          ))}
          {orderPreview.length === 0 ? (
            <TechnicianCard className="p-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-emerald-500" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-black text-[#000D32]">No assigned jobs</h3>
              <p className="mt-2 text-base font-medium text-[#64748B]">New work appears here after admin assigns it.</p>
            </TechnicianCard>
          ) : null}
        </div>
      </section>
    </TechnicianShell>
  );
}

function Metric({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'amber' | 'blue' | 'green';
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700'
  };

  return (
    <TechnicianCard className="p-5 text-center">
      <div className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${tones[tone]}`}>{icon}</div>
      <p className="mt-5 text-[36px] font-black leading-none text-[#000D32]">{value}</p>
      <p className="mt-3 text-sm font-black uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
    </TechnicianCard>
  );
}

function firstName(value: string) {
  return value.split(' ').filter(Boolean)[0] || value;
}

function getDayPart() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
