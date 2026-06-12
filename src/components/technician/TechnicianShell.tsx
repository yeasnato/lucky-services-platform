import { LogoutButton } from '@/components/auth/LogoutButton';
import { TechnicianNav } from '@/components/technician/TechnicianNav';
import { business } from '@/data/business';
import { Bell, MessageCircle, Zap } from 'lucide-react';

export function TechnicianShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0B2A4A]">
      <header className="sticky top-0 z-30 bg-[#0B2A4A] px-4 py-4 text-white shadow-[0_8px_26px_rgba(11,42,74,0.18)]">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2EA9D6] text-white shadow-lg shadow-[#2EA9D6]/30">
              <Zap className="size-5 fill-current" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold leading-5">Your Lucky Services</p>
              <p className="text-xs font-bold text-[#69D7F7]">Technician Panel</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <TechnicianNav variant="top" />
            <div className="relative flex size-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
              <Bell className="size-5" aria-hidden="true" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-[#0B2A4A]" />
            </div>
            <LogoutButton variant="icon" redirectTo="/technician/login" />
          </div>
        </div>
      </header>
      <main className="mx-auto px-4 py-6 pb-32 lg:py-8">{children}</main>
      <a
        href={`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent('Hello Lucky Services admin, I need support with my technician dashboard.')}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-[#1DB95A]"
        aria-label="Contact admin on WhatsApp"
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </a>
      <TechnicianNav />
    </div>
  );
}
