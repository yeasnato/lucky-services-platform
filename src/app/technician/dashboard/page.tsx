import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CalendarClock, CheckCircle2, Clock3, MapPin, Phone, Route, WalletCards } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { TechnicianJobCard } from '@/components/technician/TechnicianJobCard';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { getTechnicianCompletedJobs, getTechnicianJobs } from '@/features/bookings/queries';
import { getTechnicianById } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianDashboardPage() {
  const profile = await requireRole(['technician']);
  const [jobs, completedJobs, technician] = await Promise.all([
    getTechnicianJobs(profile.id),
    getTechnicianCompletedJobs(profile.id, 10),
    getTechnicianById(profile.id)
  ]);
  const nextJob = jobs[0];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayJobs = jobs.filter((job) => job.preferred_date === todayKey);
  const pendingJobs = jobs.filter((job) => job.status === 'assigned');
  const inProgressJobs = jobs.filter((job) => ['accepted', 'on_the_way', 'in_progress'].includes(job.status));
  const completedValue = completedJobs.reduce((total, job) => total + (job.final_price || 0), 0);
  const displayName = technician?.display_name || profile.full_name;

  return (
    <TechnicianShell>
      <div className="mx-auto w-full max-w-[470px]">
        <section className="mb-5">
          <p className="text-sm font-medium text-slate-500">{getGreeting()}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2A4A]">{displayName}</h1>
        </section>

        <section className="overflow-hidden rounded-lg bg-[#2EA9D6] p-5 text-white shadow-xl shadow-[#2EA9D6]/25">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/20">
                <BriefcaseBusiness className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-extrabold">Today Focus</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/70">Field work status</p>
              </div>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">{technician?.availability_status || 'Active'}</span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/75">{nextJob ? 'Next service' : 'No active job'}</p>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight">{nextJob ? nextJob.services?.title || nextJob.service_id || 'General Inquiry' : 'All clear'}</h2>
            <p className="mt-2 text-sm font-semibold text-white/80">{nextJob ? `${nextJob.order_id} / ${nextJob.customer_name}` : 'New jobs will appear after admin assigns them.'}</p>
          </div>

          {nextJob ? (
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Link href={`/technician/jobs/${nextJob.order_id}`} className="inline-flex min-h-[46px] items-center justify-center rounded-lg bg-white px-3 text-sm font-extrabold text-[#0B2A4A]">
                Open
              </Link>
              <a href={`tel:${nextJob.customer_phone}`} className="inline-flex min-h-[46px] items-center justify-center gap-1 rounded-lg bg-white/15 px-3 text-sm font-extrabold text-white ring-1 ring-white/25">
                <Phone className="size-4" aria-hidden="true" />
                Call
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[46px] items-center justify-center gap-1 rounded-lg bg-white/15 px-3 text-sm font-extrabold text-white ring-1 ring-white/25"
              >
                <Route className="size-4" aria-hidden="true" />
                Map
              </a>
            </div>
          ) : null}
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <HighlightMetric icon={<WalletCards className="size-5" />} label="Completed Value" value={`৳${completedValue.toLocaleString('en')}`} helper="Recent completed" />
          <HighlightMetric icon={<BriefcaseBusiness className="size-5" />} label="Total Active" value={jobs.length.toString()} helper={`${todayJobs.length} today`} />
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <SmallMetric label="Pending" value={pendingJobs.length} tone="amber" />
          <SmallMetric label="In Progress" value={inProgressJobs.length} tone="sky" />
          <SmallMetric label="Done" value={completedJobs.length} tone="emerald" />
        </section>

        {nextJob ? (
          <section className="mt-6 rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Next action</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#0B2A4A]">{nextJob.customer_name}</h2>
              </div>
              <StatusBadge status={nextJob.status} />
            </div>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
              <Info icon={<CalendarClock className="size-4" />} text={`${formatDate(nextJob.preferred_date)} / ${nextJob.preferred_time}`} />
              <Info icon={<MapPin className="size-4" />} text={nextJob.address} />
            </div>
          </section>
        ) : null}

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#0B2A4A]">Order List</h2>
            <Link href="/technician/jobs" className="text-sm font-extrabold text-[#2EA9D6]">
              See All
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <TechnicianJobCard key={job.id} job={job} />
            ))}
            {jobs.length === 0 ? <EmptyPanel title="No active orders" text="Assigned jobs will appear here." /> : null}
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#0B2A4A]">Completed</h2>
            <Link href="/technician/jobs?view=completed" className="text-sm font-extrabold text-[#2EA9D6]">
              View Done
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {completedJobs.slice(0, 2).map((job) => (
              <TechnicianJobCard key={job.id} job={job} compact />
            ))}
            {completedJobs.length === 0 ? <EmptyPanel title="No completed orders yet" text="Completed jobs will appear after service." /> : null}
          </div>
        </section>
      </div>
    </TechnicianShell>
  );
}

function HighlightMetric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-lg bg-[#F0F9FC] text-[#2EA9D6]">{icon}</div>
      <p className="mt-4 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{value}</p>
      <p className="mt-2 text-xs font-bold text-[#2EA9D6]">{helper}</p>
    </div>
  );
}

function SmallMetric({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'sky' | 'emerald' }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-500',
    sky: 'bg-sky-50 text-[#2EA9D6]',
    emerald: 'bg-emerald-50 text-emerald-500'
  };

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 text-center shadow-sm">
      <div className={`mx-auto flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Clock3 className="size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 text-xl font-extrabold text-[#0B2A4A]">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-[#2EA9D6]">{icon}</span>
      <span className="line-clamp-2">{text}</span>
    </p>
  );
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center">
      <CheckCircle2 className="mx-auto size-9 text-emerald-500" aria-hidden="true" />
      <h3 className="mt-3 text-lg font-bold text-[#0B2A4A]">{title}</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
