import { CalendarClock, Wrench } from 'lucide-react';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { formatDateShort, getTechnicianStatusStyle, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
import { rescheduleTechnicianJob } from '@/features/bookings/actions';
import { getTechnicianBookingByOrderId } from '@/features/bookings/queries';
import { requireRole } from '@/lib/auth/session';

export default async function TechnicianReschedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole(['technician']);
  const job = await getTechnicianBookingByOrderId(id, profile.id);
  const serviceTitle = job.services?.title || job.service_id || 'General Service';
  const days = nextDays(5);
  const times = ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'];
  const status = getTechnicianStatusStyle('delayed');

  return (
    <TechnicianShell title="Reschedule Service" backHref={`/technician/jobs/${job.order_id}`}>
      <TechnicianCard accent={status.accent} className="p-6 pl-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">Order ID</p>
            <h1 className="mt-4 text-3xl font-black text-[#191C1E]">{job.order_id}</h1>
            <p className="mt-4 flex items-center gap-3 text-2xl font-medium text-[#64748B]">
              <Wrench className="size-6" aria-hidden="true" />
              {serviceTitle}
            </p>
          </div>
          <TechnicianStatusBadge status="delayed" />
        </div>
      </TechnicianCard>

      <form action={rescheduleTechnicianJob} className="mt-8">
        <input type="hidden" name="bookingId" value={job.id} />

        <section>
          <h2 className="text-[30px] font-black leading-9 text-[#191C1E]">Select New Date</h2>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {days.map((day, index) => (
              <label key={day.value} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="preferredDate" value={day.value} defaultChecked={index === 0} required />
                <span className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl bg-white text-[#191C1E] shadow-sm ring-1 ring-slate-100 transition peer-checked:bg-[#000D32] peer-checked:text-white">
                  <span className="text-sm font-black uppercase tracking-[0.12em]">{day.weekday}</span>
                  <span className="mt-2 text-3xl font-black">{day.day}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-[30px] font-black leading-9 text-[#191C1E]">Available Time</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {times.map((time, index) => (
              <label key={time} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="preferredTime" value={time} defaultChecked={index === 1} required />
                <span className="flex min-h-[72px] items-center justify-center rounded-2xl bg-white text-2xl font-medium text-[#191C1E] shadow-sm ring-1 ring-slate-100 transition peer-checked:bg-[#000D32] peer-checked:text-white">
                  {time}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-[30px] font-black leading-9 text-[#191C1E]">Reason for Reschedule</h2>
          <select
            name="rescheduleReason"
            required
            defaultValue=""
            className="mt-5 min-h-16 w-full rounded-2xl border border-slate-200 bg-[#E9F0F8] px-5 text-2xl font-medium text-[#191C1E] outline-none focus:border-[#000D32]"
          >
            <option value="" disabled>Select a reason</option>
            <option value="Customer requested another time">Customer requested another time</option>
            <option value="Customer not reachable">Customer not reachable</option>
            <option value="Parts required before visit">Parts required before visit</option>
            <option value="Technician delayed due to previous job">Technician delayed due to previous job</option>
            <option value="Address or access issue">Address or access issue</option>
          </select>
          <textarea
            name="rescheduleDetails"
            rows={5}
            placeholder="Add additional notes..."
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-[#E9F0F8] p-5 text-2xl font-medium leading-9 text-[#191C1E] outline-none placeholder:text-[#64748B] focus:border-[#000D32]"
          />
        </section>

        <SubmitButton pendingLabel="Saving..." className="mt-12 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#000D32] text-2xl font-black text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]">
          <CalendarClock className="size-7" aria-hidden="true" />
          Confirm Reschedule
        </SubmitButton>
      </form>
    </TechnicianShell>
  );
}

function nextDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: date.toISOString().slice(0, 10),
      weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
      label: formatDateShort(date.toISOString())
    };
  });
}
