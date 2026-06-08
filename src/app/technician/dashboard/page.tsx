import Link from 'next/link';
import { ArrowRight, CalendarClock, CheckCircle2, MapPin, Phone, Route, Wrench } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { getTechnicianCompletedJobs, getTechnicianJobs } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianDashboardPage() {
  const profile = await requireRole(['technician']);
  const [jobs, completedJobs] = await Promise.all([getTechnicianJobs(profile.id), getTechnicianCompletedJobs(profile.id, 10)]);
  const nextJob = jobs[0];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayJobs = jobs.filter((job) => job.preferred_date === todayKey);
  const acceptedJobs = jobs.filter((job) => ['accepted', 'on_the_way', 'in_progress'].includes(job.status));

  return (
    <TechnicianShell>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Technician</p>
        <h1 className="text-2xl font-extrabold text-[#0B2A4A]">My work dashboard</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">Start with the next job, then keep each status updated for admin.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Assigned" value={jobs.length} />
        <Metric label="Today" value={todayJobs.length} />
        <Metric label="Completed" value={completedJobs.length} />
      </div>

      {nextJob ? (
        <section className="mt-6 rounded-lg border border-[#B9E7F5] bg-white shadow-sm">
          <div className="border-b border-sky-100 bg-[#F0F9FC] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Next action</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#0B2A4A]">{nextJob.services?.title || nextJob.service_id || 'General Inquiry'}</h2>
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_220px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-extrabold text-[#0B2A4A]">{nextJob.order_id}</p>
                <StatusBadge status={nextJob.status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-gray-600 sm:grid-cols-2">
                <Info icon={<CalendarClock className="size-4" />} text={`${formatDate(nextJob.preferred_date)} / ${nextJob.preferred_time}`} />
                <Info icon={<Phone className="size-4" />} text={nextJob.customer_phone} href={`tel:${nextJob.customer_phone}`} />
                <Info icon={<MapPin className="size-4" />} text={nextJob.address} />
                <Info icon={<Wrench className="size-4" />} text={nextJob.customer_name} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`/technician/jobs/${nextJob.order_id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white">
                Open job
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-[#0B2A4A]"
              >
                <Route className="size-4" aria-hidden="true" />
                Map route
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto size-10 text-emerald-500" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-extrabold text-[#0B2A4A]">No assigned jobs right now</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">New assigned work will appear here after admin assigns it.</p>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-lg font-extrabold text-[#0B2A4A]">Assigned job list</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">{acceptedJobs.length} jobs are currently moving in the field.</p>
        </div>
        <div className="grid gap-4 p-5">
          {jobs.map((job) => (
            <Link key={job.id} href={`/technician/jobs/${job.order_id}`} className="rounded-lg border border-gray-100 bg-gray-50 p-5 transition hover:border-[#2EA9D6] hover:bg-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-[#0B2A4A]">{job.order_id}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-600">{job.services?.title || job.service_id || 'General Inquiry'}</p>
                  <p className="mt-1 text-sm text-gray-500">{job.address}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-lg font-extrabold text-[#0B2A4A]">Completed history</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">Recent jobs you completed.</p>
        </div>
        <div className="grid gap-4 p-5">
          {completedJobs.map((job) => (
            <Link key={job.id} href={`/technician/jobs/${job.order_id}`} className="rounded-lg border border-gray-100 bg-gray-50 p-5 transition hover:border-[#2EA9D6] hover:bg-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-[#0B2A4A]">{job.order_id}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-600">{job.services?.title || job.service_id || 'General Inquiry'}</p>
                  <p className="mt-1 text-sm text-gray-500">{job.final_price ? `BDT ${job.final_price}` : 'Final price not set'}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </Link>
          ))}
          {completedJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-5 text-sm font-semibold text-gray-500">No completed jobs yet.</div>
          ) : null}
        </div>
      </section>
    </TechnicianShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-[#0B2A4A]">{value}</p>
    </div>
  );
}

function Info({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
  const content = (
    <>
      <span className="text-[#2EA9D6]">{icon}</span>
      <span>{text}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="inline-flex items-start gap-2 text-[#0B2A4A]">
        {content}
      </a>
    );
  }

  return <p className="inline-flex items-start gap-2">{content}</p>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
