import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Phone, Save, Star, UserRound } from 'lucide-react';
import { AdminShell } from '@/components/admin/DashboardShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { getAdminTechnicianJobs } from '@/features/bookings/queries';
import type { BookingRow } from '@/features/bookings/queries';
import { updateTechnicianAvailability } from '@/features/technicians/actions';
import { getTechnicianById } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

const activeStatuses = ['assigned', 'accepted', 'on_the_way', 'in_progress'];

export default async function AdminTechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(['admin']);
  const [technician, jobs] = await Promise.all([getTechnicianById(id), getAdminTechnicianJobs(id).catch(() => [])]);

  if (!technician) {
    return (
      <AdminShell title="Technician not found" description="This technician profile may have been deleted or is unavailable.">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-extrabold text-amber-950">Technician profile could not be opened.</p>
          <Link href="/admin/technicians" className="mt-4 inline-flex rounded-lg bg-[#0B2A4A] px-4 py-3 text-sm font-bold text-white">
            Back to technicians
          </Link>
        </div>
      </AdminShell>
    );
  }

  const activeJobs = jobs.filter((job) => activeStatuses.includes(job.status));
  const completedJobs = jobs.filter((job) => job.status === 'completed');

  return (
    <AdminShell
      title={technician.display_name}
      eyebrow="Technician profile"
      description="Review technician capacity, active work, completed jobs, and current availability."
      actions={
        <Link href="/admin/technicians" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A]">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Team
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#F0F9FC] text-[#2EA9D6]">
                  <UserRound className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0B2A4A]">{technician.display_name}</h2>
                  <a href={`tel:${technician.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2EA9D6]">
                    <Phone className="size-4" aria-hidden="true" />
                    {technician.phone}
                  </a>
                </div>
              </div>
              <span className="inline-flex w-fit items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold capitalize text-sky-700">
                {technician.availability_status.replaceAll('_', ' ')}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Metric icon={<BriefcaseBusiness className="size-5" />} label="Active jobs" value={activeJobs.length} />
              <Metric icon={<CheckCircle2 className="size-5" />} label="Completed" value={completedJobs.length} />
              <Metric icon={<Star className="size-5" />} label="Rating" value={technician.rating || 'New'} />
            </div>
          </section>

          <JobSection title="Active jobs" description="Jobs currently assigned to this technician." jobs={activeJobs} emptyText="No active jobs right now." />
          <JobSection title="Completed history" description="Recent completed jobs handled by this technician." jobs={completedJobs} emptyText="No completed jobs yet." />
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-[#0B2A4A]">Availability</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Use this before assigning new jobs.</p>
          <form action={updateTechnicianAvailability} className="mt-5 space-y-3">
            <input type="hidden" name="technicianId" value={technician.id} />
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Current status</span>
              <select
                name="availabilityStatus"
                defaultValue={technician.availability_status}
                className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]"
              >
                <option value="available">Available</option>
                <option value="on_job">On job</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <SubmitButton
              pendingLabel="Saving..."
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]"
            >
              <Save className="size-4" aria-hidden="true" />
              Save availability
            </SubmitButton>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <span className="text-[#2EA9D6]">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-[#0B2A4A]">{value}</p>
    </div>
  );
}

function JobSection({
  title,
  description,
  jobs,
  emptyText
}: {
  title: string;
  description: string;
  jobs: BookingRow[];
  emptyText: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-extrabold text-[#0B2A4A]">{title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      </div>
      <div className="grid gap-3 p-5">
        {jobs.map((job) => (
          <Link key={job.id} href={`/admin/bookings/${job.order_id}`} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-[#2EA9D6] hover:bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-extrabold text-[#0B2A4A]">{job.order_id}</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{job.services?.title || job.service_id || 'General Inquiry'}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{formatDate(job.preferred_date)} / {job.preferred_time}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
          </Link>
        ))}
        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm font-semibold text-slate-500">{emptyText}</div>
        ) : null}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
