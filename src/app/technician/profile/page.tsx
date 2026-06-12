import { BadgeCheck, HelpCircle, Mail, MapPin, Phone, ShieldCheck, Star, UserRound, Wrench } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { isDelayedJob, TechnicianCard } from '@/components/technician/TechnicianUI';
import { business } from '@/data/business';
import { getTechnicianAllJobs, getTechnicianCompletedJobs } from '@/features/bookings/queries';
import { getTechnicianById, getTechnicianCapabilities } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianProfilePage() {
  const profile = await requireRole(['technician']);
  const [technician, capabilities, allJobs, completedJobs] = await Promise.all([
    getTechnicianById(profile.id),
    getTechnicianCapabilities(profile.id),
    getTechnicianAllJobs(profile.id, 100),
    getTechnicianCompletedJobs(profile.id, 100)
  ]);
  const displayName = technician?.display_name || profile.full_name;
  const phone = technician?.phone || profile.phone || 'Not provided';
  const cancelled = allJobs.filter((job) => job.status === 'cancelled').length;
  const issues = allJobs.filter((job) => isDelayedJob(job.preferred_date, job.status) || (job.notes || '').toLowerCase().includes('not reachable')).length;

  return (
    <TechnicianShell title="Profile" backHref="/technician/dashboard">
      <TechnicianCard accent="bg-[#000D32]" className="p-6 pl-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#E9F0F8] text-3xl font-black text-[#000D32] ring-4 ring-white">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black text-[#000D32]">{displayName}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[#64748B]">ID: {profile.id.slice(0, 6).toUpperCase()}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                  Verified
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-black text-[#64748B]">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {technician?.rating || '5.0'}
                </span>
                <span>{completedJobs.length} Jobs Completed</span>
              </div>
            </div>
          </div>
          <UserRound className="size-6 shrink-0 text-[#000D32]" aria-hidden="true" />
        </div>
      </TechnicianCard>

      <TechnicianCard accent="bg-[#50D9FE]" className="mt-7 p-6 pl-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Contact Information</p>
        <div className="mt-6 grid gap-5">
          <Contact icon={<Phone className="size-6" />} label="Phone Number" value={phone} />
          <Contact icon={<Mail className="size-6" />} label="Email Address" value="Not provided" muted />
        </div>
      </TechnicianCard>

      <TechnicianCard accent="bg-blue-500" className="mt-7 p-6 pl-8">
        <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
          <Wrench className="size-5" aria-hidden="true" />
          Assigned Categories
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {capabilities.skills.length ? capabilities.skills.map((skill) => <Chip key={skill} label={skill} />) : <Chip label="No category assigned" />}
        </div>
      </TechnicianCard>

      <TechnicianCard accent="bg-emerald-500" className="mt-7 p-6 pl-8">
        <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
          <MapPin className="size-5" aria-hidden="true" />
          Assigned Areas
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {capabilities.areas.length ? capabilities.areas.map((area) => <Chip key={area} label={area} />) : <Chip label="No area assigned" />}
        </div>
      </TechnicianCard>

      <section className="mt-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Performance Overview</p>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <Performance label="Completed" value={completedJobs.length} tone="text-emerald-600" />
          <Performance label="Cancelled" value={cancelled} tone="text-red-500" />
          <Performance label="Reviews" value={0} tone="text-[#191C1E]" />
          <Performance label="Issues" value={issues} tone="text-amber-500" />
        </div>
      </section>

      <TechnicianCard className="mt-8 overflow-hidden p-0">
        <ProfileRow icon={<Phone className="size-7" />} label="Call Admin Support" href={`tel:${business.phoneInternational}`} />
        <ProfileRow icon={<HelpCircle className="size-7" />} label="Email Support" href={`mailto:${business.email}`} />
        <div className="flex items-center justify-between border-t border-slate-100 p-5 text-red-600">
          <div className="flex items-center gap-4">
            <ShieldCheck className="size-7" aria-hidden="true" />
            <span className="text-lg font-medium">Logout</span>
          </div>
          <LogoutButton variant="icon" redirectTo="/technician/login" />
        </div>
      </TechnicianCard>
    </TechnicianShell>
  );
}

function Contact({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#E9F0F8] text-[#000D32]">{icon}</div>
      <div>
        <p className="text-sm font-black text-[#64748B]">{label}</p>
        <p className={`mt-1 text-lg font-black ${muted ? 'italic text-[#64748B]' : 'text-[#191C1E]'}`}>{value}</p>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return <span className="rounded-xl border border-slate-200 bg-[#F7F9FB] px-4 py-2 text-sm font-black text-[#191C1E]">{label}</span>;
}

function Performance({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <TechnicianCard className="p-8 text-center">
      <p className={`text-[42px] font-black leading-none ${tone}`}>{value}</p>
      <p className="mt-5 text-sm font-black text-[#64748B]">{label}</p>
    </TechnicianCard>
  );
}

function ProfileRow({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center justify-between border-t border-slate-100 p-5 transition hover:bg-[#F7F9FB] first:border-t-0">
      <div className="flex items-center gap-4">
        <span className="text-[#64748B]">{icon}</span>
        <span className="text-lg font-medium text-[#191C1E]">{label}</span>
      </div>
      <span className="text-sm font-black text-[#00677D]">Open</span>
    </a>
  );
}

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
