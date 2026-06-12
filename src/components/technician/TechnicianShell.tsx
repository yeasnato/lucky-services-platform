import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { TechnicianNav } from '@/components/technician/TechnicianNav';
import { ArrowLeft, Bell, Menu, UserRound } from 'lucide-react';

export function TechnicianShell({
  children,
  title = 'LSC',
  backHref,
  showMenu = false,
  hideNav = false
}: {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  showMenu?: boolean;
  hideNav?: boolean;
}) {
  const isPageHeader = Boolean(backHref);

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#000D32]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 px-4 py-4 shadow-[0_4px_18px_rgba(18,35,77,0.04)] backdrop-blur">
        {isPageHeader ? (
          <div className="mx-auto grid max-w-[520px] grid-cols-[44px_1fr_44px] items-center">
            <Link href={backHref || '/technician/dashboard'} className="flex size-11 items-center justify-center rounded-full text-[#000D32] transition hover:bg-slate-100" aria-label="Go back">
              <ArrowLeft className="size-6" aria-hidden="true" />
            </Link>
            <h1 className="truncate text-center text-xl font-black tracking-normal text-[#000D32]">{title}</h1>
            <span />
          </div>
        ) : (
          <div className="mx-auto flex max-w-[620px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {showMenu ? (
                <Link href="/technician/dashboard" className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#000D32] transition hover:bg-slate-100" aria-label="Open technician home">
                  <Menu className="size-6" aria-hidden="true" />
                </Link>
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[#000D32]">
                  <UserRound className="size-6" aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-3xl font-black leading-9 tracking-normal text-[#000D32]">{title}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/technician/alerts" className="relative flex size-11 items-center justify-center rounded-full text-[#000D32] transition hover:bg-slate-100" aria-label="Open alerts">
                <Bell className="size-7" aria-hidden="true" />
                <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </Link>
              <LogoutButton variant="icon" redirectTo="/technician/login" />
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-[620px] px-4 py-6 pb-28">{children}</main>
      {hideNav ? null : <TechnicianNav />}
    </div>
  );
}
