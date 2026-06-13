import Link from 'next/link';
import { AlertTriangle, History, MessageSquareText } from 'lucide-react';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatTaka, isDelayedJob, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import { getTechnicianAllJobs } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianAlertsPage() {
  const profile = await requireRole(['technician']);
  const allJobs = await getTechnicianAllJobs(profile.id, 100);
  const issueJobs = allJobs.filter((job) => isDelayedJob(job.preferred_date, job.status) || hasIssueNote(job.notes || ''));

  return (
    <TechnicianShell title="Complaints" backHref="/technician/dashboard">
      {issueJobs.length > 0 ? (
        <div className="rounded-lg border border-red-300 bg-[#FEE2E2] p-5 text-[16px] font-medium text-[#BA1A1A]">
          <AlertTriangle className="mr-3 inline size-6 align-[-5px]" aria-hidden="true" />
          {issueJobs.length} open {issueJobs.length === 1 ? 'complaint needs' : 'complaints need'} attention
        </div>
      ) : null}

      <section className="mt-7 space-y-6">
        {issueJobs.map((job) => {
          const delayed = isDelayedJob(job.preferred_date, job.status);
          const serviceTitle = job.services?.title || job.service_id || 'General Service';

          return (
            <TechnicianCard key={job.id} accent={delayed ? 'bg-[#BA1A1A]' : 'bg-[#C5C6D0]'} className="p-6 pl-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#45464F]">TKT-{job.order_id.slice(-5)}</p>
                  <div className="mt-3">
                    <span className={`inline-flex min-h-7 items-center rounded px-3 text-[12px] font-semibold ${delayed ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      ! {delayed ? 'Super Urgent' : 'Urgent'} • {delayed ? '17 min' : '2 days ago'}
                    </span>
                  </div>
                </div>
                <TechnicianStatusBadge status={job.status} />
              </div>
              <h2 className="mt-6 text-[20px] font-semibold leading-7 text-[#000D32]">{delayed ? 'Error' : 'Cooling Issue'}</h2>
              <p className="mt-2 text-[15px] font-medium leading-6 tracking-[0.04em] text-[#45464F]">
                {delayed ? 'Error after service, customer reporting issue and needs update.' : lastNote(job.notes || 'Customer reported a service issue.')}
              </p>

              <div className="mt-5 rounded-lg border border-[#D8DADC] bg-white p-4">
                <Info label="Order" value={shortOrderId(job.order_id)} />
                <Info label="Customer" value={job.customer_name} />
                <Info label="Phone" value={job.customer_phone} />
                <Info label="Address" value={job.address} />
                <Info label="Schedule" value={`${formatComplaintDate(job.preferred_date)} • ${shortTime(job.preferred_time)}`} />
                <Info label="Service" value={serviceTitle} />
                <Info label="Amount" value={formatTaka(job.final_price)} />
                <Info label="Due" value={delayed ? formatTaka(500) : formatTaka(0)} tone={delayed ? 'text-red-500' : 'text-emerald-600'} />
                <p className="mt-4 text-right text-[12px] font-semibold text-[#45464F]">{formatComplaintDate(job.updated_at || job.preferred_date)}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href={`/technician/jobs/${job.order_id}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#000D32] text-[13px] font-medium tracking-[0.08em] text-[#000D32]">
                  <History className="size-5" aria-hidden="true" />
                  View History
                </Link>
                <Link href={`/technician/jobs/${job.order_id}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#000D32] text-[13px] font-medium tracking-[0.08em] text-white">
                  <MessageSquareText className="size-5" aria-hidden="true" />
                  Chat & Update
                </Link>
              </div>
            </TechnicianCard>
          );
        })}

        {issueJobs.length === 0 ? (
          <TechnicianCard className="p-10 text-center">
            <AlertTriangle className="mx-auto size-12 text-emerald-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-[#000D32]">No open alerts</h2>
            <p className="mt-2 text-base font-medium text-[#45464F]">Delayed jobs and field issues will appear here.</p>
          </TechnicianCard>
        ) : null}
      </section>
    </TechnicianShell>
  );
}

function Info({ label, value, tone = 'text-[#191C1E]' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="grid grid-cols-[82px_1fr] gap-3 py-2 text-[15px]">
      <span className="font-medium text-[#45464F]">{label}</span>
      <span className={`text-right font-medium leading-6 ${tone}`}>{value}</span>
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

function shortOrderId(orderId: string) {
  return orderId;
}

function shortTime(value: string) {
  return value.includes('(') ? value.split('(')[0].trim() : value;
}

function formatComplaintDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(new Date(value));
}
