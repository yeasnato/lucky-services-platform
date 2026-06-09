'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function AutoRefreshNotice({ latestBookingId }: { latestBookingId?: string }) {
  const router = useRouter();
  const previousLatestId = useRef(latestBookingId);
  const [hasNewBooking, setHasNewBooking] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (previousLatestId.current && latestBookingId && previousLatestId.current !== latestBookingId) {
      setHasNewBooking(true);
    }
    previousLatestId.current = latestBookingId;
  }, [latestBookingId]);

  return (
    <button
      type="button"
      onClick={() => {
        setHasNewBooking(false);
        router.refresh();
      }}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-extrabold transition ${
        hasNewBooking
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#2EA9D6] hover:text-[#0B2A4A]'
      }`}
    >
      <RefreshCw className="size-3.5" aria-hidden="true" />
      {hasNewBooking ? 'New booking detected' : 'Auto-refresh 30s'}
    </button>
  );
}
