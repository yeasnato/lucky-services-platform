import { Wrench } from 'lucide-react';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { TechnicianShell } from '@/components/technician/TechnicianShell';
import { getTechnicianStatusStyle, TechnicianCard, TechnicianStatusBadge } from '@/components/technician/TechnicianUI';
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
    <TechnicianShell title="Reschedule Service" backHref={`/technician/jobs/${job.order_id}`} hideNav wide largeHeader titleAlign="left">
      <TechnicianCard accent={status.accent} className="mt-1 p-7 pl-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[18px] font-medium uppercase tracking-[0.22em] text-[#64748B]">Order ID</p>
            <h1 className="mt-7 text-[30px] font-extrabold leading-9 text-[#191C1E]">{shortOrderId(job.order_id)}</h1>
            <p className="mt-5 flex items-center gap-4 text-[26px] font-medium leading-8 text-[#64748B]">
              <Wrench className="size-6" strokeWidth={2.2} aria-hidden="true" />
              {serviceTitle}
            </p>
          </div>
          <TechnicianStatusBadge status="delayed" />
        </div>
      </TechnicianCard>

      <form action={rescheduleTechnicianJob} className="mt-9 pb-28">
        <input type="hidden" name="bookingId" value={job.id} />

        <section>
          <h2 className="text-[30px] font-extrabold leading-9 text-[#191C1E]">Select New Date</h2>
          <div className="mt-5 grid grid-cols-5 gap-4">
            {days.map((day, index) => (
              <label key={day.value} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="preferredDate" value={day.value} defaultChecked={index === 0} required />
                <span className="flex min-h-[130px] flex-col items-center justify-center rounded-[22px] bg-white text-[#191C1E] shadow-[0_4px_12px_rgba(18,35,77,0.05)] ring-1 ring-[#EEF0F2] transition peer-checked:bg-[#000D32] peer-checked:text-white">
                  <span className="text-[18px] font-extrabold uppercase tracking-[0.14em] text-inherit">{day.weekday}</span>
                  <span className="mt-5 text-[32px] font-extrabold leading-none">{day.day}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[30px] font-extrabold leading-9 text-[#191C1E]">Available Time</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {times.map((time, index) => (
              <label key={time} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="preferredTime" value={time} defaultChecked={index === 1} required />
                <span className="flex min-h-[84px] items-center justify-center rounded-[22px] bg-white text-[26px] font-medium tracking-[0.04em] text-[#191C1E] shadow-[0_4px_12px_rgba(18,35,77,0.05)] ring-1 ring-[#EEF0F2] transition peer-checked:bg-[#000D32] peer-checked:text-white">
                  {time}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[30px] font-extrabold leading-9 text-[#191C1E]">Reason for Reschedule</h2>
          <select
            name="rescheduleReason"
            required
            defaultValue=""
            className="mt-5 min-h-[86px] w-full rounded-[24px] border border-[#D7DEE8] bg-[#E9F0F8] px-7 text-[26px] font-medium text-[#191C1E] outline-none focus:border-[#000D32]"
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
            className="mt-4 min-h-[174px] w-full rounded-[24px] border border-[#D7DEE8] bg-[#E9F0F8] p-7 text-[26px] font-medium leading-9 text-[#191C1E] outline-none placeholder:text-[#64748B] focus:border-[#000D32]"
          />
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 bg-white/90 px-7 py-7 shadow-[0_-16px_30px_rgba(18,35,77,0.05)] backdrop-blur">
          <div className="mx-auto max-w-[780px]">
            <SubmitButton pendingLabel="Saving..." className="inline-flex min-h-[86px] w-full items-center justify-center rounded-[22px] bg-[#000D32] text-[30px] font-extrabold text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]">
          Confirm Reschedule
            </SubmitButton>
          </div>
        </div>
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
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)
    };
  });
}

function shortOrderId(orderId: string) {
  return orderId.replace(/^LSC-/, 'UQ-').slice(0, 9);
}
