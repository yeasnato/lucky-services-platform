import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Plus, ShieldCheck, Star, UserRound } from 'lucide-react';
import { AdminShell } from '@/components/admin/DashboardShell';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { getAdminBookings } from '@/features/bookings/queries';
import { createTechnician } from '@/features/technicians/actions';
import { getTechnicians } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function AdminTechniciansPage({
  searchParams
}: {
  searchParams?: Promise<{ created?: string; error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  await requireRole(['admin']);
  const [technicians, bookings] = await Promise.all([getTechnicians().catch(() => []), getAdminBookings().catch(() => [])]);
  const activeCounts = new Map<string, number>();
  bookings
    .filter((booking) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status) && booking.assigned_technician_id)
    .forEach((booking) => {
      activeCounts.set(booking.assigned_technician_id!, (activeCounts.get(booking.assigned_technician_id!) || 0) + 1);
    });

  return (
    <AdminShell
      title="Technician team"
      description="Create technician logins, review availability, and prepare the field team for assigned bookings."
    >
      {resolvedSearchParams.created === '1' ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-extrabold text-emerald-800">
          Technician login created successfully. Give the email and temporary password to the technician.
        </div>
      ) : null}

      {resolvedSearchParams.error ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-extrabold text-rose-800">
          Technician could not be created: {resolvedSearchParams.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#0B2A4A]">Field team</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Technicians available for admin assignment.</p>
            </div>
            <div className="rounded-lg bg-[#F0F9FC] px-3 py-2 text-sm font-extrabold text-[#0B2A4A]">{technicians.length} technicians</div>
          </div>
          <div className="divide-y divide-slate-100">
            {technicians.map((technician) => (
              <div key={technician.id} className="grid gap-4 p-5 md:grid-cols-[1fr_130px_130px_120px] md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#F0F9FC] text-[#2EA9D6]">
                    <UserRound className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0B2A4A]">{technician.display_name}</p>
                    <p className="text-sm font-medium text-slate-500">{technician.phone}</p>
                  </div>
                </div>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                  <BriefcaseBusiness className="size-4 text-[#2EA9D6]" aria-hidden="true" />
                  {activeCounts.get(technician.id) || 0} active
                </p>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {technician.rating || 'New'}
                </p>
                <span className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold capitalize text-sky-700">
                  {technician.availability_status.replaceAll('_', ' ')}
                </span>
                <Link href={`/admin/technicians/${technician.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6] hover:text-[#2EA9D6]">
                  Details
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
          {technicians.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-bold text-[#0B2A4A]">No technicians yet</p>
              <p className="mt-1 text-sm text-slate-500">Create the first technician login from the form.</p>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#F0F9FC] text-[#2EA9D6]">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0B2A4A]">Create login</h3>
              <p className="text-sm font-medium text-slate-500">Admin gives these credentials to the technician.</p>
            </div>
          </div>
          <form action={createTechnician} className="mt-5 space-y-4">
            <input name="fullName" required placeholder="Technician name" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <input name="phone" required placeholder="Phone" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <input name="password" required type="password" minLength={8} placeholder="Temporary password" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <SubmitButton
              pendingLabel="Creating technician..."
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create technician
            </SubmitButton>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}
