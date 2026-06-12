import { LogoutButton } from '@/components/auth/LogoutButton';
import { TechnicianNav } from '@/components/technician/TechnicianNav';
import { Bell, Zap } from 'lucide-react';

export function TechnicianShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#0B2A4A]">
      <header className="sticky top-0 z-30 bg-[#0B2A4A] px-4 py-4 text-white shadow-lg shadow-slate-900/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2EA9D6] text-white">
              <Zap className="size-5 fill-current" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold leading-5">Lucky Services Centre</p>
              <p className="text-xs font-bold text-[#69D7F7]">Technician Panel</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <TechnicianNav variant="top" />
            <div className="hidden size-10 items-center justify-center rounded-full bg-white/10 text-white sm:flex">
              <Bell className="size-5" aria-hidden="true" />
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 lg:py-8">{children}</main>
      <TechnicianNav />
    </div>
  );
}
