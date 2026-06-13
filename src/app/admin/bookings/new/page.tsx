import Link from 'next/link';
import { Calendar, ClipboardPlus, Clock, FileText, MapPin, Phone, User } from 'lucide-react';
import { AdminCard, AdminCardHeader, AdminFieldLabel, adminButtonClass, adminInputClass, adminInputWithIconClass } from '@/components/admin/AdminUI';
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
    <AdminShell title="New Order Entry" description="Create a booking from a phone call, walk-in request, or admin entry.">
      <form action={createAdminBooking} className="max-w-4xl space-y-5">
        <AdminCard>
          <AdminCardHeader title="Customer Information" icon={<User className="size-4" aria-hidden="true" />} />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Field label="Full name" icon={<User size={18} />} name="customerName" placeholder="Enter customer name" required />
            <Field label="Phone number" icon={<Phone size={18} />} name="customerPhone" placeholder="+880 1XXX-XXXXXX" required type="tel" />

            <label className="relative block md:col-span-2">
              <AdminFieldLabel>Service address</AdminFieldLabel>
              <span className="absolute left-4 top-[42px] text-[#757680]">
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
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Service Details" icon={<ClipboardPlus className="size-4" aria-hidden="true" />} />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <label className="block">
              <AdminFieldLabel>Service category</AdminFieldLabel>
              <select name="serviceId" className={adminInputClass}>
              <option value="">General inquiry</option>
              {serviceOptions.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
              </select>
            </label>

            <label className="block">
              <AdminFieldLabel>Order source</AdminFieldLabel>
              <select name="source" defaultValue="phone" className={adminInputClass}>
              <option value="phone">Phone order</option>
              <option value="admin">Admin entry</option>
              <option value="website">Website</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <AdminFieldLabel>Create status</AdminFieldLabel>
              <select name="createStatus" defaultValue="pending" className={adminInputClass}>
              <option value="pending">Pending confirmation</option>
              <option value="confirmed">Confirmed by customer</option>
              </select>
              <p className="mt-2 text-xs font-medium text-[#45464F]">Use confirmed only when the customer confirms schedule and service during the call.</p>
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Scheduling" icon={<Calendar className="size-4" aria-hidden="true" />} />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            <Field label="Preferred date" icon={<Calendar size={18} />} name="preferredDate" required type="date" min={new Date().toISOString().split('T')[0]} />

            <label className="relative block">
              <AdminFieldLabel>Priority slot</AdminFieldLabel>
              <span className="absolute left-4 top-[42px] z-10 text-[#757680]">
              <Clock size={18} />
              </span>
              <select name="preferredTime" required className={adminInputWithIconClass}>
              <option value="">Select time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
              </select>
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Operational Notes" icon={<FileText className="size-4" aria-hidden="true" />} />
          <div className="p-5">
            <label className="relative block">
              <AdminFieldLabel>Internal instructions</AdminFieldLabel>
              <span className="absolute left-4 top-[42px] text-[#757680]">
                <FileText size={18} />
              </span>
              <textarea name="notes" rows={4} placeholder="Provide details for dispatch or field technician..." className={fieldClassName} />
            </label>
          </div>
        </AdminCard>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[#D8DADC] bg-white/95 p-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href="/admin/bookings" className={adminButtonClass.secondary}>
              Cancel
            </Link>
            <SubmitButton
              pendingLabel="Creating order..."
              className={`${adminButtonClass.primary} w-full sm:w-auto`}
            >
              <ClipboardPlus className="size-4" aria-hidden="true" />
              Create order
            </SubmitButton>
          </div>
          <p className="mt-2 text-right text-xs font-medium text-[#45464F]">The button locks while saving to prevent duplicate orders.</p>
        </div>
      </form>
    </AdminShell>
  );
}

const fieldClassName =
  'min-h-11 w-full rounded border border-[#C5C6D0] bg-[#F7F9FB] py-2 pl-11 pr-3 text-sm font-medium text-[#000D32] outline-none transition placeholder:text-[#757680] focus:border-[#000D32] focus:bg-white focus:ring-2 focus:ring-[#000D32]/10';

function Field({
  icon,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label className="relative block">
      <AdminFieldLabel>{label}</AdminFieldLabel>
      <span className="absolute left-4 top-[42px] text-[#757680]">{icon}</span>
      <input {...props} className={fieldClassName} />
    </label>
  );
}
