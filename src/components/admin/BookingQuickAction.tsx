import { redirect } from 'next/navigation';
import { CheckCircle2, UserRoundCheck } from 'lucide-react';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { assignTechnician, updateBookingStatus } from '@/features/bookings/actions';
import type { BookingRow } from '@/features/bookings/queries';
import type { TechnicianRow } from '@/features/technicians/queries';

const reassignableStatuses = ['confirmed', 'assigned', 'accepted', 'on_the_way', 'in_progress'];

export function BookingQuickAction({
  booking,
  technicians,
  activeCounts,
  successHref
}: {
  booking: BookingRow;
  technicians: TechnicianRow[];
  activeCounts: Map<string, number>;
  successHref?: string;
}) {
  if (booking.status === 'pending') {
    return (
      <form
        action={async () => {
          'use server';
          await updateBookingStatus(booking.id, 'confirmed');
          if (successHref) redirect(successHref);
        }}
      >
        <SubmitButton
          pendingLabel="Confirming..."
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-[#2EA9D6] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#238FBA] md:w-auto"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Confirm
        </SubmitButton>
      </form>
    );
  }

  if (reassignableStatuses.includes(booking.status)) {
    return (
      <form
        action={async (formData) => {
          'use server';
          await assignTechnician(formData);
          if (successHref) redirect(successHref);
        }}
        className="flex min-w-[240px] flex-col gap-2 lg:flex-row"
      >
        <input type="hidden" name="bookingId" value={booking.id} />
        <select
          name="technicianId"
          required
          defaultValue={booking.assigned_technician_id || ''}
          className="min-h-[42px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6]"
        >
          <option value="">{booking.assigned_technician_id ? 'Reassign technician' : 'Assign technician'}</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.display_name} - {technician.availability_status.replaceAll('_', ' ')} - {activeCounts.get(technician.id) || 0} active
            </option>
          ))}
        </select>
        <SubmitButton
          pendingLabel={booking.assigned_technician_id ? 'Reassigning...' : 'Assigning...'}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#0B2A4A] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#123B64]"
        >
          <UserRoundCheck className="size-4" aria-hidden="true" />
          {booking.assigned_technician_id ? 'Reassign' : 'Assign'}
        </SubmitButton>
      </form>
    );
  }

  return <span className="text-sm font-semibold text-slate-400">Open details</span>;
}

export function getActiveBookingCounts(bookings: { status: string; assigned_technician_id: string | null }[]) {
  const counts = new Map<string, number>();
  bookings
    .filter((booking) => ['assigned', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status) && booking.assigned_technician_id)
    .forEach((booking) => {
      counts.set(booking.assigned_technician_id!, (counts.get(booking.assigned_technician_id!) || 0) + 1);
    });
  return counts;
}
