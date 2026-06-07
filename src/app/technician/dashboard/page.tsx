import Link from 'next/link';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { getTechnicianJobs } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianDashboardPage() {
  const profile = await requireRole(['technician']);
  const jobs = await getTechnicianJobs(profile.id);

  return (
    <TechnicianShell>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Technician</p>
        <h1 className="text-2xl font-extrabold text-[#0B2A4A]">Assigned Jobs</h1>
      </div>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/technician/jobs/${job.order_id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-[#0B2A4A]">{job.order_id}</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">{job.services?.title || job.service_id || 'General Inquiry'}</p>
                <p className="mt-1 text-sm text-gray-500">{job.address}</p>
              </div>
              <span className="rounded-full bg-[#F0F9FC] px-3 py-1 text-xs font-bold capitalize text-[#2EA9D6]">{job.status.replaceAll('_', ' ')}</span>
            </div>
          </Link>
        ))}
      </div>
    </TechnicianShell>
  );
}
