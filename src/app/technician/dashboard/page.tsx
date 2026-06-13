import Link from 'next/link';
import { CheckCircle2, ClipboardClock, History, LoaderCircle, WalletCards } from 'lucide-react';
import { TechnicianJobCard } from '@/components/technician/TechnicianJobCard';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatTaka, TechnicianCard } from '@/components/technician/TechnicianUI';
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
  const completedValue = completedJobs.reduce((total, job) => total + (job.final_price || 0), 0);
  const orderPreview = allJobs.slice(0, 2);
  const activeJobLabel = activeJobs.length === 1 ? 'job' : 'jobs';
  const dashboardSubtitle = `You have ${activeJobs.length} active ${activeJobLabel} today.\u00a0Let's get to work.`;

  return (
    <TechnicianShell title="LSC">
      <section>
        <h1 className="text-[36px] font-extrabold leading-[44px] tracking-normal text-[#000D32]">Good {getDayPart()}, {firstName(displayName)}</h1>
        <p className="mt-4 text-[22px] font-medium leading-8 text-[#64748B]">{dashboardSubtitle}</p>
      </section>

      <TechnicianCard className="mt-10 bg-[#12234D] p-6 text-white shadow-[0_10px_24px_rgba(0,13,50,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-[14px] bg-white/14">
              <WalletCards className="size-8" strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[28px] font-extrabold leading-8">My Wallet</h2>
            </div>
          </div>
          <span className="rounded-full bg-white/18 px-5 py-2 text-[16px] font-extrabold">Active</span>
        </div>
        <div className="mt-8">
          <p className="text-[16px] font-extrabold uppercase tracking-[0.12em] text-white/80">Available Balance</p>
          <p className="mt-3 text-[48px] font-extrabold leading-none tracking-normal drop-shadow">{formatTaka(completedValue)}</p>
        </div>
        <Link href="/technician/jobs?view=completed" className="mt-10 inline-flex min-h-[66px] w-full items-center justify-center gap-4 rounded-[12px] border border-white/25 bg-white/10 text-[20px] font-extrabold tracking-[0.08em] text-white transition hover:bg-white/15">
          <History className="size-7" strokeWidth={2.2} aria-hidden="true" />
          History
        </Link>
      </TechnicianCard>

      <section className="mt-10 grid grid-cols-3 gap-5">
        <Metric icon={<ClipboardClock className="size-7" />} label="Pending" value={pendingJobs.length} tone="amber" />
        <Metric icon={<LoaderCircle className="size-7" />} label="In Progress" value={inProgressJobs.length} tone="blue" />
        <Metric icon={<CheckCircle2 className="size-7" />} label="Done" value={completedJobs.length} tone="green" />
      </section>

      <section className="mt-11">
        <div className="flex items-center justify-between">
          <h2 className="text-[28px] font-extrabold leading-9 text-[#000D32]">Order List</h2>
          <Link href="/technician/jobs" className="text-[20px] font-extrabold text-[#00677D]">
            See All
          </Link>
        </div>
        <div className="mt-6 space-y-7">
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
    <TechnicianCard className="min-h-[194px] p-5 text-center">
      <div className={`mx-auto flex size-[50px] items-center justify-center rounded-[12px] ${tones[tone]}`}>{icon}</div>
      <p className="mt-6 text-[48px] font-extrabold leading-none text-[#000D32]">{value}</p>
      <p className="mt-3 text-[16px] font-extrabold uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
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
