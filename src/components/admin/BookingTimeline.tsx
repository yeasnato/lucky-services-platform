import { Activity, CheckCircle2, Clock3, UserRound } from 'lucide-react';
import type { BookingEventRow } from '@/features/bookings/queries';

export function BookingTimeline({ events }: { events: BookingEventRow[] }) {
  return (
    <section className="rounded-lg border border-[#D8DADC] bg-white p-5 shadow-[0_1px_2px_rgba(18,35,77,0.04)]">
      <div className="flex items-center gap-2">
        <Activity className="size-5 text-[#2EA9D6]" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-[#000D32]">Activity timeline</h3>
      </div>
      <div className="mt-5 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3">
            <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#D0E1FB] text-[#12234D]">
              {event.event_type === 'status_changed' ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Clock3 className="size-4" aria-hidden="true" />}
            </div>
            <div className="min-w-0 border-b border-[#D8DADC] pb-4 last:border-b-0">
              <p className="text-sm font-semibold capitalize text-[#000D32]">{event.event_type.replaceAll('_', ' ')}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-[#45464F]">{event.note || statusCopy(event.from_status, event.to_status)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#757680]">
                <span>{formatDateTime(event.created_at)}</span>
                {event.profiles ? (
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="size-3" aria-hidden="true" />
                    {event.profiles.full_name}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 ? <p className="text-sm font-medium text-[#45464F]">No activity has been recorded yet.</p> : null}
      </div>
    </section>
  );
}

function statusCopy(from: string | null, to: string | null) {
  if (from && to) return `Status changed from ${from.replaceAll('_', ' ')} to ${to.replaceAll('_', ' ')}.`;
  if (to) return `Status set to ${to.replaceAll('_', ' ')}.`;
  return 'Booking activity recorded.';
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
