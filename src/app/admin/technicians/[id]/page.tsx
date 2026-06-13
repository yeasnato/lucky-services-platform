import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Phone, Save, Star, UserRound } from 'lucide-react';
import { AdminCard, AdminCardHeader, adminButtonClass, adminInputClass, normalizeBdPhoneDisplay } from '@/components/admin/AdminUI';
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
        <div className="rounded border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-950">Technician profile could not be opened.</p>
          <Link href="/admin/technicians" className={`${adminButtonClass.primary} mt-4`}>
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
        <Link href="/admin/technicians" className={adminButtonClass.secondary}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Team
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AdminCard className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded bg-[#F0F9FC] text-[#2EA9D6]">
                  <UserRound className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#000D32]">{technician.display_name}</h2>
                  <a href={`tel:${technician.phone}`} className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#45464F] hover:text-[#00677D]">
                    <Phone className="size-4" aria-hidden="true" />
                    {normalizeBdPhoneDisplay(technician.phone)}
                  </a>
                </div>
              </div>
              <span className="inline-flex w-fit items-center justify-center rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-sky-800">
                {technician.availability_status.replaceAll('_', ' ')}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Metric icon={<BriefcaseBusiness className="size-5" />} label="Active jobs" value={activeJobs.length} />
              <Metric icon={<CheckCircle2 className="size-5" />} label="Completed" value={completedJobs.length} />
              <Metric icon={<Star className="size-5" />} label="Rating" value={technician.rating || 'New'} />
            </div>
          </AdminCard>

          <JobSection title="Active jobs" description="Jobs currently assigned to this technician." jobs={activeJobs} emptyText="No active jobs right now." />
          <JobSection title="Completed history" description="Recent completed jobs handled by this technician." jobs={completedJobs} emptyText="No completed jobs yet." />
        </div>

        <aside className="h-fit rounded-lg border border-[#D8DADC] bg-white p-5 shadow-[0_1px_2px_rgba(18,35,77,0.04)]">
          <h3 className="text-lg font-semibold text-[#000D32]">Availability</h3>
          <p className="mt-1 text-sm font-medium text-[#45464F]">Use this before assigning new jobs.</p>
          <form action={updateTechnicianAvailability} className="mt-5 space-y-3">
            <input type="hidden" name="technicianId" value={technician.id} />
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">Current status</span>
              <select
                name="availabilityStatus"
                defaultValue={technician.availability_status}
                className={adminInputClass}
              >
                <option value="available">Available</option>
                <option value="on_job">On job</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <SubmitButton
              pendingLabel="Saving..."
              className={`${adminButtonClass.cyan} w-full`}
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
    <div className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4">
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">
        <span className="text-[#2EA9D6]">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[#000D32]">{value}</p>
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
    <AdminCard>
      <AdminCardHeader title={title} description={description} />
      <div className="grid gap-3 p-5">
        {jobs.map((job) => (
          <Link key={job.id} href={`/admin/bookings/${job.order_id}`} className="rounded border border-[#D8DADC] bg-[#F7F9FB] p-4 transition hover:border-[#2EA9D6] hover:bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-[#000D32]">{job.order_id}</p>
                <p className="mt-1 text-sm font-semibold text-[#191C1E]">{job.services?.title || job.service_id || 'General Inquiry'}</p>
                <p className="mt-1 text-sm font-medium text-[#45464F]">{formatDate(job.preferred_date)} / {job.preferred_time}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
          </Link>
        ))}
        {jobs.length === 0 ? (
          <div className="rounded border border-dashed border-[#C5C6D0] p-5 text-sm font-medium text-[#45464F]">{emptyText}</div>
        ) : null}
      </div>
    </AdminCard>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
