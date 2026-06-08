import { Calendar, ClipboardPlus, Clock, FileText, MapPin, Phone, User } from 'lucide-react';
import { AdminShell } from '@/components/admin/DashboardShell';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { createAdminBooking } from '@/features/bookings/actions';
import { getServicesForSelect } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

const timeSlots = ['Morning (9AM - 12PM)', 'Afternoon (12PM - 4PM)', 'Evening (4PM - 8PM)'];

export default async function NewAdminBookingPage() {
  await requireRole(['admin']);
  const serviceOptions = await getServicesForSelect();

  return (
    <AdminShell title="New order" description="Create a booking from a phone call, walk-in request, or admin entry.">
      <section className="max-w-3xl rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#0B2A4A]">
            <ClipboardPlus className="size-5 text-[#2EA9D6]" aria-hidden="true" />
            Manual booking
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Phone and admin orders are created as confirmed, so you can assign a technician immediately.</p>
        </div>

        <form action={createAdminBooking} className="grid gap-5 p-5 md:grid-cols-2">
          <Field icon={<User size={18} />} name="customerName" placeholder="Customer full name" required />
          <Field icon={<Phone size={18} />} name="customerPhone" placeholder="Phone number, e.g. 017..." required type="tel" />

          <label className="relative block md:col-span-2">
            <span className="absolute left-4 top-3.5 text-slate-400">
              <MapPin size={18} />
            </span>
            <textarea
              name="address"
              required
              rows={2}
              placeholder="House, road, area, city"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600">Service</span>
            <select name="serviceId" className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]">
              <option value="">General inquiry</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600">Source</span>
            <select name="source" defaultValue="phone" className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]">
              <option value="phone">Phone order</option>
              <option value="admin">Admin entry</option>
              <option value="website">Website</option>
            </select>
          </label>

          <Field icon={<Calendar size={18} />} name="preferredDate" required type="date" min={new Date().toISOString().split('T')[0]} />

          <label className="relative block">
            <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
              <Clock size={18} />
            </span>
            <select name="preferredTime" required className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]">
              <option value="">Select time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>

          <label className="relative block md:col-span-2">
            <span className="absolute left-4 top-3.5 text-slate-400">
              <FileText size={18} />
            </span>
            <textarea name="notes" rows={3} placeholder="Notes or customer issue details" className={fieldClassName} />
          </label>

          <div className="md:col-span-2">
            <SubmitButton
              pendingLabel="Creating order..."
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#238FBA] md:w-auto"
            >
              <ClipboardPlus className="size-4" aria-hidden="true" />
              Create confirmed order
            </SubmitButton>
            <p className="mt-2 text-xs font-semibold text-slate-400">The button locks while saving to prevent duplicate orders.</p>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}

const fieldClassName =
  'min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-[#0B2A4A] outline-none transition placeholder:text-slate-400 focus:border-[#2EA9D6] focus:bg-white focus:ring-2 focus:ring-[#2EA9D6]/20';

function Field({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input {...props} className={fieldClassName} />
    </label>
  );
}
