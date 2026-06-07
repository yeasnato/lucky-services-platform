import { AdminShell } from '@/components/admin/DashboardShell';
import { createTechnician } from '@/features/technicians/actions';
import { getTechnicians } from '@/features/technicians/queries';
import { requireRole } from '@/lib/auth/session';

export default async function AdminTechniciansPage() {
  await requireRole(['admin']);
  const technicians = await getTechnicians();

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-extrabold text-[#0B2A4A]">Technicians</h2>
            <p className="text-sm text-gray-500">Manage availability and assignment readiness.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {technicians.map((technician) => (
              <div key={technician.id} className="grid gap-3 p-5 md:grid-cols-[1fr_1fr_140px]">
                <div>
                  <p className="font-bold text-[#0B2A4A]">{technician.display_name}</p>
                  <p className="text-sm text-gray-500">{technician.phone}</p>
                </div>
                <p className="text-sm font-semibold text-gray-600">Rating: {technician.rating || 'New'}</p>
                <span className="rounded-full bg-[#F0F9FC] px-3 py-1 text-center text-xs font-bold capitalize text-[#2EA9D6]">
                  {technician.availability_status.replaceAll('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-[#0B2A4A]">Create Technician Login</h3>
          <p className="mt-1 text-sm text-gray-500">Admin creates the email/password and gives it to the technician.</p>
          <form action={createTechnician} className="mt-5 space-y-4">
            <input name="fullName" required placeholder="Technician name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <input name="email" required type="email" placeholder="Email" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <input name="phone" required placeholder="Phone" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <input name="password" required type="password" minLength={8} placeholder="Temporary password" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#2EA9D6]" />
            <button className="w-full rounded-xl bg-[#2EA9D6] py-3 text-sm font-bold text-white">Create Technician</button>
          </form>
        </aside>
      </div>
    </AdminShell>
  );
}
