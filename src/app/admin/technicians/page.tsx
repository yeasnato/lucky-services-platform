import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, KeyRound, MapPin, Plus, ShieldCheck, Star, UserRound, Wrench } from 'lucide-react';
import { AdminCard, AdminCardHeader, AdminFieldLabel, adminButtonClass, adminInputClass, normalizeBdPhoneDisplay } from '@/components/admin/AdminUI';
import { AdminShell } from '@/components/admin/DashboardShell';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { getAdminBookings } from '@/features/bookings/queries';
import { createTechnician } from '@/features/technicians/actions';
import {
  getServiceAreasForTechnicianSelect,
  getServiceCategoriesForTechnicianSelect,
  getTechnicianCapabilities,
  getTechnicians
} from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function AdminTechniciansPage({
  searchParams
}: {
  searchParams?: Promise<{ created?: string; error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  await requireRole(['admin']);
  const [technicians, bookings, categoryOptions, areaOptions] = await Promise.all([
    getTechnicians().catch(() => []),
    getAdminBookings().catch(() => []),
    getServiceCategoriesForTechnicianSelect().catch(() => []),
    getServiceAreasForTechnicianSelect().catch(() => [])
  ]);
  const capabilities = await Promise.all(technicians.map((technician) => getTechnicianCapabilities(technician.id).catch(() => ({ skills: [], areas: [] }))));
  const capabilitiesByTechnician = new Map(technicians.map((technician, index) => [technician.id, capabilities[index]]));
  const activeCounts = new Map<string, number>();
  bookings
    .filter((booking) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status) && booking.assigned_technician_id)
    .forEach((booking) => {
      activeCounts.set(booking.assigned_technician_id!, (activeCounts.get(booking.assigned_technician_id!) || 0) + 1);
    });
  const availableCount = technicians.filter((technician) => technician.availability_status === 'available').length;

  return (
    <AdminShell
      title="Technician Onboarding"
      description="Create technician logins, map specializations, assign operation zones, and review field capacity."
    >
      {resolvedSearchParams.created === '1' ? (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Technician login created successfully. Give the email and temporary password to the technician.
        </div>
      ) : null}

      {resolvedSearchParams.error ? (
        <div className="mb-4 rounded border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          Technician could not be created: {resolvedSearchParams.error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AdminCard>
          <AdminCardHeader
            title="Field team"
            description="Technicians available for admin assignment and zone balancing."
            icon={<Wrench className="size-4" aria-hidden="true" />}
            action={<span className="rounded bg-[#F0F9FC] px-3 py-2 text-sm font-semibold text-[#000D32]">{availableCount}/{technicians.length} available</span>}
          />
          <div className="divide-y divide-[#D8DADC]">
            {technicians.map((technician) => {
              const capability = capabilitiesByTechnician.get(technician.id);

              return (
                <div key={technician.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_120px_120px_110px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-[#F0F9FC] text-[#2EA9D6]">
                        <UserRound className="size-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#000D32]">{technician.display_name}</p>
                        <p className="text-sm font-medium text-[#45464F]">{normalizeBdPhoneDisplay(technician.phone)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(capability?.skills || []).slice(0, 2).map((skill) => (
                        <span key={skill} className="rounded-full bg-[#D0E1FB] px-3 py-1 text-[11px] font-semibold text-[#12234D]">
                          {skill}
                        </span>
                      ))}
                      {(capability?.areas || []).slice(0, 2).map((area) => (
                        <span key={area} className="rounded-full bg-[#F2F4F6] px-3 py-1 text-[11px] font-semibold text-[#45464F]">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#45464F]">
                    <BriefcaseBusiness className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                    {activeCounts.get(technician.id) || 0} active
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#45464F]">
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {technician.rating || 'New'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-sky-800">
                      {technician.availability_status.replaceAll('_', ' ')}
                    </span>
                    <Link href={`/admin/technicians/${technician.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#00677D] hover:text-[#000D32]">
                      Details
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {technicians.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-[#000D32]">No technicians yet</p>
              <p className="mt-1 text-sm text-[#45464F]">Create the first technician login from the onboarding form.</p>
            </div>
          ) : null}
        </AdminCard>

        <aside className="h-fit space-y-5">
          <form action={createTechnician} className="space-y-5">
            <AdminCard>
              <AdminCardHeader title="Identity Details" icon={<UserRound className="size-4" aria-hidden="true" />} />
              <div className="space-y-4 p-5">
                <label className="block">
                  <AdminFieldLabel>Full name</AdminFieldLabel>
                  <input name="fullName" required placeholder="e.g. Robert Smith" className={adminInputClass} />
                </label>
                <label className="block">
                  <AdminFieldLabel>Email address</AdminFieldLabel>
                  <input name="email" required type="email" placeholder="r.smith@lsc-technician.com" className={adminInputClass} />
                </label>
                <label className="block">
                  <AdminFieldLabel>Mobile number</AdminFieldLabel>
                  <input name="phone" required placeholder="+8801712345678" className={adminInputClass} />
                </label>
              </div>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader title="Access Credentials" icon={<KeyRound className="size-4" aria-hidden="true" />} />
              <div className="space-y-4 p-5">
                <label className="block">
                  <AdminFieldLabel>Access password</AdminFieldLabel>
                  <input name="password" required type="password" minLength={8} placeholder="Temporary password" className={adminInputClass} />
                  <p className="mt-2 text-xs font-medium text-[#45464F]">Minimum 8 characters. Admin provides this directly to the technician.</p>
                </label>
              </div>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader title="Service Configuration" icon={<ShieldCheck className="size-4" aria-hidden="true" />} />
              <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-1">
                <label className="block">
                  <AdminFieldLabel>Primary category</AdminFieldLabel>
                  <select name="primaryCategory" className={adminInputClass} defaultValue="">
                    <option value="">Select specialization</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <AdminFieldLabel>Assigned area zone</AdminFieldLabel>
                  <select name="serviceAreaId" className={adminInputClass} defaultValue="">
                    <option value="">Select operations area</option>
                    {areaOptions.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </AdminCard>

            <AdminCard className="bg-[#000D32] p-5 text-white">
              <h3 className="text-lg font-semibold">Registration Preview</h3>
              <p className="mt-2 text-sm leading-6 text-white/80">Privileged field account for technician dashboard access.</p>
              <div className="mt-5 space-y-4 border-t border-white/15 pt-5 text-sm">
                <PreviewRow label="Role" value="Senior Field Technician" />
                <PreviewRow label="Join date" value="Today (auto-assigned)" />
                <PreviewRow label="Account status" value="Awaiting initial login" />
              </div>
            </AdminCard>

            <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#D8DADC] bg-white/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
              <SubmitButton pendingLabel="Creating technician..." className={`${adminButtonClass.primary} w-full`}>
                <Plus className="size-4" aria-hidden="true" />
                Create Account
              </SubmitButton>
            </div>
          </form>

          <div className="rounded border border-dashed border-[#C5C6D0] bg-white p-6 text-center">
            <ShieldCheck className="mx-auto size-9 text-[#757680]" aria-hidden="true" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#45464F]">LSC Operations</p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <MapPin className="mt-0.5 size-4 shrink-0 text-[#B6C5F9]" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
        <p className="mt-1 font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
