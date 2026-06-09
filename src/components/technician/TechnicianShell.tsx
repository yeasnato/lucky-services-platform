import { LogoutButton } from '@/components/auth/LogoutButton';
import { Logo } from '@/components/marketing/Logo';
import { TechnicianNav } from '@/components/technician/TechnicianNav';

export function TechnicianShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FBFD] text-[#0B2A4A]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Technician</p>
              <p className="text-sm font-bold text-[#0B2A4A]">Field workspace</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <TechnicianNav variant="top" />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 lg:py-8">{children}</main>
      <TechnicianNav />
    </div>
  );
}
