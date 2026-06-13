import Image from 'next/image';
import { BadgeCheck, ChevronRight, HelpCircle, LogOut, Mail, MapPin, Pencil, Phone, Settings, Star, Wrench } from 'lucide-react';
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
  const visibleSkills = capabilities.skills.slice(0, 1);
  const remainingSkills = Math.max(capabilities.skills.length - visibleSkills.length, 0);
  const visibleAreas = capabilities.areas.slice(0, 3);
  const remainingAreas = Math.max(capabilities.areas.length - visibleAreas.length, 0);

  return (
    <TechnicianShell title="Profile" backHref="/technician/dashboard" titleAlign="left">
      <TechnicianCard accent="bg-[#000D32]" className="mt-3 p-5 pl-6">
        <div className="relative">
          <div className="flex min-w-0 items-center gap-4 pr-9">
            <Image
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80"
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full border-4 border-white object-cover shadow-sm"
            />
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-bold leading-6 text-[#000D32]">{displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium tracking-[0.08em] text-[#45464F]">ID: {profile.id.slice(0, 6).toUpperCase()}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  Verified
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] font-bold text-[#45464F]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F6] px-3 py-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {technician?.rating || '5.0'}
                </span>
                <span>{completedJobs.length} Jobs Completed</span>
              </div>
            </div>
          </div>
          <Pencil className="absolute right-0 top-1 size-5 text-[#000D32]" aria-hidden="true" />
        </div>
      </TechnicianCard>

      <TechnicianCard accent="bg-[#2EA9D6]" className="mt-10 p-7 pl-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#45464F]">Contact Information</p>
        <div className="mt-6 grid gap-5">
          <Contact icon={<Phone className="size-6" />} label="Phone Number" value={phone} />
          <Contact icon={<Mail className="size-6" />} label="Email Address" value="Not provided" muted />
        </div>
      </TechnicianCard>

      <TechnicianCard accent="bg-[#2EA9D6]" className="mt-8 p-7 pl-8">
        <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.22em] text-[#45464F]">
          <Wrench className="size-5" aria-hidden="true" />
          Assigned Categories
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {visibleSkills.length ? visibleSkills.map((skill) => <Chip key={skill} label={skill} />) : <Chip label="No category assigned" />}
          {remainingSkills ? <Chip label={`+${remainingSkills} more`} muted /> : null}
        </div>
      </TechnicianCard>

      <TechnicianCard accent="bg-[#059669]" className="mt-8 p-7 pl-8">
        <p className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.22em] text-[#45464F]">
          <MapPin className="size-5" aria-hidden="true" />
          Assigned Areas
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {visibleAreas.length ? visibleAreas.map((area) => <Chip key={area} label={area} />) : <Chip label="No area assigned" />}
          {remainingAreas ? <Chip label={`+${remainingAreas} more`} muted /> : null}
        </div>
      </TechnicianCard>

      <section className="mt-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#45464F]">Performance Overview</p>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <Performance label="Completed" value={completedJobs.length} tone="text-emerald-600" />
          <Performance label="Cancelled" value={cancelled} tone="text-red-500" />
          <Performance label="Reviews" value={0} tone="text-[#191C1E]" />
          <Performance label="Complaint" value={issues} tone="text-amber-500" />
        </div>
      </section>

      <TechnicianCard className="mt-8 overflow-hidden p-0">
        <ProfileRow icon={<Settings className="size-7" />} label="Account Settings" href="/technician/profile" />
        <ProfileRow icon={<HelpCircle className="size-7" />} label="Help & Support" href={`mailto:${business.email}`} />
        <div className="grid grid-cols-[1fr_54px] items-center border-t border-[#D8DADC] p-5 text-red-600">
          <div className="flex items-center gap-4">
            <LogOut className="size-7" aria-hidden="true" />
            <span className="text-[18px] font-medium">Logout</span>
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
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#F2F4F6] text-[#000D32]">{icon}</div>
      <div>
        <p className="text-[12px] font-bold text-[#45464F]">{label}</p>
        <p className={`mt-1 text-[16px] font-bold ${muted ? 'italic text-[#45464F]' : 'text-[#191C1E]'}`}>{value}</p>
      </div>
    </div>
  );
}

function Chip({ label, muted }: { label: string; muted?: boolean }) {
  return <span className={`rounded-[8px] border border-[#C5C6D0] bg-[#F7F9FB] px-4 py-2 text-[13px] font-bold ${muted ? 'text-[#45464F]' : 'text-[#191C1E]'}`}>{label}</span>;
}

function Performance({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <TechnicianCard className="min-h-[132px] p-6 text-center">
      <p className={`text-[34px] font-bold leading-none ${tone}`}>{value}</p>
      <p className="mt-4 text-[13px] font-bold text-[#45464F]">{label}</p>
    </TechnicianCard>
  );
}

function ProfileRow({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex min-h-[72px] items-center justify-between border-t border-[#D8DADC] p-5 transition hover:bg-[#F7F9FB] first:border-t-0">
      <div className="flex items-center gap-4">
        <span className="text-[#45464F]">{icon}</span>
        <span className="text-[16px] font-medium text-[#191C1E]">{label}</span>
      </div>
      <ChevronRight className="size-6 text-[#C5C6D0]" aria-hidden="true" />
    </a>
  );
}
