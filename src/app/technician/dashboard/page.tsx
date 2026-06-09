import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CalendarClock, CheckCircle2, MapPin, Phone, Route, WalletCards } from 'lucide-react';
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
  const inProgressJobs = jobs.filter((job) => ['accepted', 'on_the_way', 'in_progress'].includes(job.status));
  const completedValue = completedJobs.reduce((total, job) => total + (job.final_price || 0), 0);

  return (
    <TechnicianShell>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg bg-[#0B2A4A] p-5 text-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl font-extrabold">
              {getInitials(technician?.display_name || profile.full_name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">Lucky field expert</p>
              <h1 className="mt-1 truncate text-2xl font-extrabold">{technician?.display_name || profile.full_name}</h1>
              <p className="mt-1 text-sm font-semibold text-cyan-100">{technician?.availability_status || 'available'}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Score label="Active" value={jobs.length} />
            <Score label="Today" value={todayJobs.length} />
            <Score label="Done" value={completedJobs.length} />
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-100">Completed value</p>
                <p className="mt-1 text-2xl font-extrabold">BDT {completedValue.toLocaleString('en')}</p>
              </div>
              <WalletCards className="size-7 text-[#69D7F7]" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Today command</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">Start from the next job</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                Call, route, update status, reschedule, and add field notes from the job screen.
              </p>
            </div>
            <Link href="/technician/jobs" className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#EAF8FD] px-4 text-sm font-extrabold text-[#0B2A4A]">
              All jobs
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {nextJob ? (
            <div className="mt-5 rounded-lg border border-[#B9E7F5] bg-[#F7FCFE] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Next action</p>
                  <h3 className="mt-1 text-xl font-extrabold text-[#0B2A4A]">{nextJob.services?.title || nextJob.service_id || 'General Inquiry'}</h3>
                </div>
                <StatusBadge status={nextJob.status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                <Info icon={<CalendarClock className="size-4" />} text={`${formatDate(nextJob.preferred_date)} / ${nextJob.preferred_time}`} />
                <Info icon={<Phone className="size-4" />} text={nextJob.customer_phone} href={`tel:${nextJob.customer_phone}`} />
                <Info icon={<MapPin className="size-4" />} text={nextJob.address} />
                <Info icon={<BriefcaseBusiness className="size-4" />} text={nextJob.customer_name} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Link href={`/technician/jobs/${nextJob.order_id}`} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 text-sm font-extrabold text-white">
                  Open job
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a href={`tel:${nextJob.customer_phone}`} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white px-4 text-sm font-extrabold text-[#0B2A4A]">
                  <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  Call
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white px-4 text-sm font-extrabold text-[#0B2A4A]"
                >
                  <Route className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  Map
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-sky-100 bg-[#F7FCFE] p-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-emerald-500" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-extrabold text-[#0B2A4A]">No assigned jobs right now</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">New assigned work will appear here after admin assigns it.</p>
            </div>
          )}
        </section>
      </div>

      {jobs.length > 0 ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-800">
          {inProgressJobs.length > 0
            ? `${inProgressJobs.length} job${inProgressJobs.length === 1 ? '' : 's'} already moving in the field. Keep status and notes updated.`
            : `${jobs.length} active job${jobs.length === 1 ? '' : 's'} waiting for action.`}
        </div>
      ) : null}

      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Assigned queue</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#0B2A4A]">Active jobs</h2>
          </div>
          <Link href="/technician/jobs" className="text-sm font-extrabold text-[#2EA9D6] hover:text-[#0B2A4A]">
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {jobs.slice(0, 6).map((job) => (
            <TechnicianJobCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 ? <EmptyState text="No active jobs are assigned to you." /> : null}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">History</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#0B2A4A]">Recently completed</h2>
          </div>
          <Link href="/technician/jobs?view=completed" className="text-sm font-extrabold text-[#2EA9D6] hover:text-[#0B2A4A]">
            View done
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {completedJobs.slice(0, 4).map((job) => (
            <TechnicianJobCard key={job.id} job={job} compact />
          ))}
          {completedJobs.length === 0 ? <EmptyState text="Completed jobs will appear here after you finish work." /> : null}
        </div>
      </section>
    </TechnicianShell>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-100">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function Info({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
  const content = (
    <>
      <span className="mt-0.5 shrink-0 text-[#2EA9D6]">{icon}</span>
      <span className="line-clamp-2">{text}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex items-start gap-2 text-[#0B2A4A]">
        {content}
      </a>
    );
  }

  return <p className="flex items-start gap-2">{content}</p>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-sky-100 bg-white p-5 text-sm font-semibold text-slate-500">{text}</div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
