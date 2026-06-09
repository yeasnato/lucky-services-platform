import { BadgeCheck, BriefcaseBusiness, CheckCircle2, MapPin, Phone, ShieldCheck, Star, WalletCards, Wrench } from 'lucide-react';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { getTechnicianCompletedJobs, getTechnicianJobs } from '@/features/bookings/queries';
import { getTechnicianById, getTechnicianCapabilities } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianProfilePage() {
  const profile = await requireRole(['technician']);
  const [technician, capabilities, activeJobs, completedJobs] = await Promise.all([
    getTechnicianById(profile.id),
    getTechnicianCapabilities(profile.id),
    getTechnicianJobs(profile.id),
    getTechnicianCompletedJobs(profile.id, 50)
  ]);
  const displayName = technician?.display_name || profile.full_name;
  const phone = technician?.phone || profile.phone || 'Not added';
  const completedValue = completedJobs.reduce((total, job) => total + (job.final_price || 0), 0);

  return (
    <TechnicianShell>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#EAF8FD] text-2xl font-bold text-[#0B2A4A]">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Technician profile</p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2A4A]">{displayName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EAF8FD] px-2 py-1 text-[#0B2A4A]">
                <ShieldCheck className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                Technician
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                <BadgeCheck className="size-4" aria-hidden="true" />
                {technician?.availability_status || 'available'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                <Star className="size-4 fill-current" aria-hidden="true" />
                {technician?.rating ? technician.rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<BriefcaseBusiness className="size-5" />} label="Active jobs" value={activeJobs.length.toString()} />
        <Metric icon={<CheckCircle2 className="size-5" />} label="Completed" value={completedJobs.length.toString()} />
        <Metric icon={<WalletCards className="size-5" />} label="Completed value" value={`BDT ${completedValue.toLocaleString('en')}`} />
        <Metric icon={<Phone className="size-5" />} label="Phone" value={phone} />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Assigned service skills" icon={<Wrench className="size-5" />}>
          {capabilities.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {capabilities.skills.map((skill) => (
                <Chip key={skill} label={skill} />
              ))}
            </div>
          ) : (
            <EmptyLine text="Admin has not assigned service skills yet." />
          )}
        </Panel>

        <Panel title="Assigned service areas" icon={<MapPin className="size-5" />}>
          {capabilities.areas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {capabilities.areas.map((area) => (
                <Chip key={area} label={area} />
              ))}
            </div>
          ) : (
            <EmptyLine text="Admin has not assigned service areas yet." />
          )}
        </Panel>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Field guidance</p>
        <h2 className="mt-1 text-xl font-bold text-[#0B2A4A]">Keep every visit easy to dispatch</h2>
        <div className="mt-4 grid gap-3 text-sm font-medium leading-6 text-slate-600 lg:grid-cols-3">
          <Guidance text="Call customer before moving and use map route from the job screen." />
          <Guidance text="If schedule changes, update the new date/time with a clear reason." />
          <Guidance text="Before completing, confirm final price and add the work completion note." />
        </div>
      </section>
    </TechnicianShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF8FD] text-[#2EA9D6]">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 truncate text-lg font-bold text-[#0B2A4A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="inline-flex items-center gap-2 text-lg font-bold text-[#0B2A4A]">
        <span className="text-[#2EA9D6]">{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Chip({ label }: { label: string }) {
  return <span className="rounded-full bg-[#EAF8FD] px-3 py-2 text-sm font-semibold text-[#0B2A4A]">{label}</span>;
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">{text}</p>;
}

function Guidance({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <CheckCircle2 className="mb-2 size-5 text-[#2EA9D6]" aria-hidden="true" />
      {text}
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
