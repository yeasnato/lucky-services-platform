import Link from 'next/link';
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Hourglass,
  LoaderCircle,
  MapPin,
  Phone,
  Route,
  Zap
} from 'lucide-react';
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
  const dashboardJobs = [...jobs.slice(0, 4), ...completedJobs.slice(0, Math.max(0, 5 - jobs.slice(0, 4).length))];

  return (
    <TechnicianShell>
      <div className="mx-auto w-full max-w-[470px]">
        <section className="mb-5">
          <p className="text-sm font-semibold text-slate-500">{getGreeting()}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2A4A]">{displayName}</h1>
        </section>

        <section className="rounded-[22px] bg-[#2EA9D6] p-5 text-white shadow-xl shadow-[#2EA9D6]/25">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/20">
                <CalendarClock className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-extrabold">Today Focus</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/70">Assigned schedule</p>
              </div>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold capitalize">{technician?.availability_status || 'Active'}</span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/75">Jobs today</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-black leading-none">{todayJobs.length}</span>
              <span className="pb-1 text-lg font-extrabold text-white/80">scheduled</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm font-semibold text-white/80">
              {nextJob ? `${nextJob.services?.title || nextJob.service_id || 'General Inquiry'} / ${nextJob.customer_name}` : 'New jobs will appear after admin assigns them.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href={nextJob ? `/technician/jobs/${nextJob.order_id}` : '/technician/jobs'}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-3 text-sm font-extrabold text-[#2EA9D6]"
            >
              <Zap className="size-4 fill-current" aria-hidden="true" />
              {nextJob ? 'Open Next' : 'View Orders'}
            </Link>
            {nextJob ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white/15 px-3 text-sm font-extrabold text-white ring-1 ring-white/30"
              >
                <Route className="size-4" aria-hidden="true" />
                Route
              </a>
            ) : (
              <Link href="/technician/profile" className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white/15 px-3 text-sm font-extrabold text-white ring-1 ring-white/30">
                Profile
              </Link>
            )}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <HighlightMetric icon={<BadgeDollarSign className="size-5" />} label="Completed Value" value={`৳${completedValue.toLocaleString('en')}`} helper="Recent completed" />
          <HighlightMetric icon={<BriefcaseBusiness className="size-5" />} label="Total Orders" value={(jobs.length + completedJobs.length).toString()} helper={`${todayJobs.length} today`} />
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <SmallMetric icon={<Hourglass className="size-4" />} label="Pending" value={pendingJobs.length} tone="amber" />
          <SmallMetric icon={<LoaderCircle className="size-4" />} label="In Progress" value={inProgressJobs.length} tone="sky" />
          <SmallMetric icon={<CheckCircle2 className="size-4" />} label="Done" value={completedJobs.length} tone="emerald" />
        </section>

        {nextJob ? (
          <section className="mt-6 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Next action</p>
                <h2 className="mt-1 text-lg font-extrabold text-[#0B2A4A]">{nextJob.customer_name}</h2>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold capitalize text-[#2EA9D6]">{formatStatus(nextJob.status)}</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
              <Info icon={<Clock3 className="size-4" />} text={`${formatDate(nextJob.preferred_date)} / ${nextJob.preferred_time}`} />
              <Info icon={<MapPin className="size-4" />} text={nextJob.address} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href={`tel:${nextJob.customer_phone}`} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-extrabold text-[#0B2A4A]">
                <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                Call
              </a>
              <Link href={`/technician/jobs/${nextJob.order_id}`} className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[#0B2A4A] text-sm font-extrabold text-white">
                View Details
              </Link>
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
            {dashboardJobs.map((job) => (
              <TechnicianJobCard key={job.id} job={job} />
            ))}
            {dashboardJobs.length === 0 ? <EmptyPanel title="No active orders" text="Assigned jobs will appear here." /> : null}
          </div>
        </section>

        <footer className="mt-8 pb-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0B2A4A]">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#2EA9D6] text-white">
              <Zap className="size-4 fill-current" aria-hidden="true" />
            </span>
            Your Lucky Services
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400">2026 Technician Dashboard</p>
        </footer>
      </div>
    </TechnicianShell>
  );
}

function HighlightMetric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F0F9FC] text-[#2EA9D6]">{icon}</div>
      <p className="mt-4 text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{value}</p>
      <p className="mt-2 text-xs font-bold text-[#2EA9D6]">{helper}</p>
    </div>
  );
}

function SmallMetric({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'amber' | 'sky' | 'emerald';
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-500',
    sky: 'bg-sky-50 text-[#2EA9D6]',
    emerald: 'bg-emerald-50 text-emerald-500'
  };

  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-4 text-center shadow-sm">
      <div className={`mx-auto flex size-9 items-center justify-center rounded-2xl ${tones[tone]}`}>{icon}</div>
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
    <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-6 text-center">
      <CheckCircle2 className="mx-auto size-9 text-emerald-500" aria-hidden="true" />
      <h3 className="mt-3 text-lg font-bold text-[#0B2A4A]">{title}</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatStatus(status: string) {
  if (status === 'assigned') return 'pending';
  return status.replaceAll('_', ' ');
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
