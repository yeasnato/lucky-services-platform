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
  const displayName = technician?.display_name || profile.full_name;

  return (
    <TechnicianShell>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Field dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0B2A4A] sm:text-3xl">Hi, {displayName}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Your assigned jobs, next visit, and completion history are organized here for the day.
          </p>
        </div>
        <Link
          href="/technician/jobs"
          className="inline-flex min-h-[42px] w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6]"
        >
          View all jobs
          <ArrowRight className="size-4 text-[#2EA9D6]" aria-hidden="true" />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Active jobs" value={jobs.length.toString()} helper={`${inProgressJobs.length} in field`} />
        <Metric label="Today" value={todayJobs.length.toString()} helper="Scheduled visits" />
        <Metric label="Completed" value={completedJobs.length.toString()} helper="Recent history" />
        <Metric label="Collected value" value={`BDT ${completedValue.toLocaleString('en')}`} helper="Completed jobs" />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Next job</p>
              <h2 className="mt-1 text-xl font-bold text-[#0B2A4A]">Start here</h2>
            </div>
            {nextJob ? <StatusBadge status={nextJob.status} /> : null}
          </div>

          {nextJob ? (
            <div className="mt-5">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
                <p className="text-sm font-bold tracking-wide text-[#0B2A4A]">{nextJob.order_id}</p>
                <h3 className="text-2xl font-bold leading-8 text-[#0B2A4A]">{nextJob.services?.title || nextJob.service_id || 'General Inquiry'}</h3>
                <p className="text-sm font-medium text-slate-500">{nextJob.customer_name}</p>
              </div>

              <div className="mt-4 grid gap-3 text-sm font-medium text-slate-600 sm:grid-cols-2">
                <Info icon={<CalendarClock className="size-4" />} text={`${formatDate(nextJob.preferred_date)} / ${nextJob.preferred_time}`} />
                <Info icon={<Phone className="size-4" />} text={nextJob.customer_phone} href={`tel:${nextJob.customer_phone}`} />
                <Info icon={<MapPin className="size-4" />} text={nextJob.address} />
                <Info icon={<BriefcaseBusiness className="size-4" />} text={nextJob.source} />
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <Link href={`/technician/jobs/${nextJob.order_id}`} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 text-sm font-bold text-white">
                  Open job
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a href={`tel:${nextJob.customer_phone}`} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-[#0B2A4A]">
                  <Phone className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  Call
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-[#0B2A4A]"
                >
                  <Route className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  Route
                </a>
              </div>
            </div>
          ) : (
            <EmptyPanel title="No assigned jobs right now" text="New assigned work will appear here after admin assigns it." />
          )}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Today summary</p>
          <div className="mt-4 space-y-3">
            <SummaryRow icon={<CalendarClock className="size-4" />} label="Today schedule" value={`${todayJobs.length} job${todayJobs.length === 1 ? '' : 's'}`} />
            <SummaryRow icon={<Route className="size-4" />} label="In field" value={`${inProgressJobs.length} active`} />
            <SummaryRow icon={<WalletCards className="size-4" />} label="Completed value" value={`BDT ${completedValue.toLocaleString('en')}`} />
          </div>
          {jobs.length > 0 ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
              Keep status updated after each customer interaction so admin can dispatch accurately.
            </div>
          ) : null}
        </aside>
      </section>

      <section className="mt-7">
        <SectionHeader title="Active jobs" eyebrow="Assigned queue" href="/technician/jobs" linkLabel="View all" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {jobs.slice(0, 6).map((job) => (
            <TechnicianJobCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 ? <EmptyPanel title="No active jobs" text="Assigned jobs will appear in this queue." /> : null}
        </div>
      </section>

      <section className="mt-7">
        <SectionHeader title="Recently completed" eyebrow="History" href="/technician/jobs?view=completed" linkLabel="View done" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {completedJobs.slice(0, 4).map((job) => (
            <TechnicianJobCard key={job.id} job={job} compact />
          ))}
          {completedJobs.length === 0 ? <EmptyPanel title="No completed jobs yet" text="Completed work will appear here." /> : null}
        </div>
      </section>
    </TechnicianShell>
  );
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#0B2A4A]">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{helper}</p>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[#2EA9D6]">{icon}</span>
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-[#0B2A4A]">{value}</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-bold text-[#0B2A4A]">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-bold text-[#2EA9D6] hover:text-[#0B2A4A]">
        {linkLabel}
      </Link>
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
