import Link from 'next/link';
import { AlertTriangle, History, MessageSquareText } from 'lucide-react';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatDateLong, formatTaka, isDelayedJob, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import { getTechnicianAllJobs } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianAlertsPage() {
  const profile = await requireRole(['technician']);
  const allJobs = await getTechnicianAllJobs(profile.id, 100);
  const issueJobs = allJobs.filter((job) => isDelayedJob(job.preferred_date, job.status) || hasIssueNote(job.notes || ''));

  return (
    <TechnicianShell title="Alerts" backHref="/technician/dashboard">
      {issueJobs.length > 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-base font-black text-red-700">
          <AlertTriangle className="mr-2 inline size-6 align-[-5px]" aria-hidden="true" />
          {issueJobs.length} open {issueJobs.length === 1 ? 'issue needs' : 'issues need'} attention
        </div>
      ) : null}

      <section className="mt-6 space-y-6">
        {issueJobs.map((job) => {
          const delayed = isDelayedJob(job.preferred_date, job.status);
          const serviceTitle = job.services?.title || job.service_id || 'General Service';

          return (
            <TechnicianCard key={job.id} accent={delayed ? 'bg-red-500' : 'bg-amber-500'} className="p-6 pl-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#64748B]">{job.order_id}</p>
                  <div className="mt-3">
                    <TechnicianStatusBadge status={delayed ? 'issue' : 'delayed'} label={delayed ? 'Delayed' : 'Ongoing'} />
                  </div>
                </div>
                <TechnicianStatusBadge status={job.status} />
              </div>
              <h2 className="mt-6 text-2xl font-black text-[#000D32]">{delayed ? 'Schedule Attention Needed' : 'Technician Update'}</h2>
              <p className="mt-3 text-base font-medium leading-7 text-[#45464F]">
                {delayed ? 'This job is past the preferred date and should be updated or rescheduled.' : lastNote(job.notes || 'Technician added a field update.')}
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <Info label="Order" value={job.order_id} />
                <Info label="Customer" value={job.customer_name} />
                <Info label="Phone" value={job.customer_phone} />
                <Info label="Address" value={job.address} />
                <Info label="Schedule" value={`${formatDateLong(job.preferred_date)} • ${job.preferred_time}`} />
                <Info label="Service" value={serviceTitle} />
                <Info label="Amount" value={formatTaka(job.final_price)} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href={`/technician/jobs/${job.order_id}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#000D32] text-sm font-black text-[#000D32]">
                  <History className="size-5" aria-hidden="true" />
                  View History
                </Link>
                <Link href={`/technician/jobs/${job.order_id}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#000D32] text-sm font-black text-white">
                  <MessageSquareText className="size-5" aria-hidden="true" />
                  Update Job
                </Link>
              </div>
            </TechnicianCard>
          );
        })}

        {issueJobs.length === 0 ? (
          <TechnicianCard className="p-10 text-center">
            <AlertTriangle className="mx-auto size-12 text-emerald-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black text-[#000D32]">No open alerts</h2>
            <p className="mt-2 text-base font-medium text-[#64748B]">Delayed jobs and field issues will appear here.</p>
          </TechnicianCard>
        ) : null}
      </section>
    </TechnicianShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3 py-2 text-base">
      <span className="font-medium text-[#64748B]">{label}</span>
      <span className="text-right font-medium text-[#191C1E]">{value}</span>
    </div>
  );
}

function hasIssueNote(notes: string) {
  const normalized = notes.toLowerCase();
  return ['not reachable', 'parts required', 'requested change', 'extra work', 'reschedule'].some((keyword) => normalized.includes(keyword));
}

function lastNote(notes: string) {
  return notes.split('\n').filter(Boolean).at(-1) || notes;
}
