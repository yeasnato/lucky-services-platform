import Link from 'next/link';
import { TechnicianNav } from '@/components/technician/TechnicianNav';
import { ArrowLeft, Bell, Menu, UserRound } from 'lucide-react';

export function TechnicianShell({
  children,
  title = 'LSC',
  backHref,
  showMenu = false,
  hideNav = false,
  wide = false,
  largeHeader = false,
  headerAction,
  titleAlign = 'center'
}: {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  showMenu?: boolean;
  hideNav?: boolean;
  wide?: boolean;
  largeHeader?: boolean;
  headerAction?: React.ReactNode;
  titleAlign?: 'left' | 'center';
}) {
  const isPageHeader = Boolean(backHref);
  const maxWidth = wide ? 'max-w-[780px]' : 'max-w-[620px]';

  return (
    <div className="min-h-screen bg-[#F7F9FB] font-[Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#000D32]">
      <header className="sticky top-0 z-30 border-b border-[#E6E8EA] bg-white/95 shadow-[0_1px_0_rgba(18,35,77,0.02)] backdrop-blur">
        {isPageHeader ? (
          <div className={`mx-auto grid ${largeHeader ? 'min-h-[100px]' : 'min-h-[56px]'} ${maxWidth} grid-cols-[64px_1fr_64px] items-center px-4`}>
            <Link href={backHref || '/technician/dashboard'} className="flex size-11 items-center justify-center rounded-full text-[#000D32] transition hover:bg-slate-100" aria-label="Go back">
              <ArrowLeft className={largeHeader ? 'size-9' : 'size-5'} strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <h1 className={`truncate font-extrabold tracking-normal text-[#000D32] ${titleAlign === 'left' ? 'text-left' : 'text-center'} ${largeHeader ? 'text-[36px] leading-[44px]' : 'text-[20px] leading-7'}`}>{title}</h1>
            <div className="flex justify-end">{headerAction}</div>
          </div>
        ) : (
          <div className={`mx-auto grid min-h-[88px] ${maxWidth} grid-cols-[56px_1fr_56px] items-center gap-2 px-6`}>
            <div className="flex min-w-0 items-center justify-start">
              {showMenu ? (
                <Link href="/technician/dashboard" className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#000D32] transition hover:bg-slate-100" aria-label="Open technician home">
                  <Menu className="size-7" strokeWidth={2.4} aria-hidden="true" />
                </Link>
              ) : (
                <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full border border-[#C5C6D0] bg-[#E6E8EA] text-[#191C1E] shadow-[inset_0_0_0_1px_rgba(0,13,50,0.04)]">
                  <UserRound className="size-6" strokeWidth={2.2} aria-hidden="true" />
                </div>
              )}
            </div>
            <Link href="/technician/dashboard" className={`truncate ${showMenu ? 'text-center' : 'text-left'} text-[30px] font-extrabold leading-9 tracking-normal text-[#000D32]`}>
              {title}
            </Link>
            <div className="flex shrink-0 items-center justify-end">
              <Link href="/technician/alerts" className="relative flex size-11 items-center justify-center rounded-full text-[#000D32] transition hover:bg-slate-100" aria-label="Open alerts">
                <Bell className="size-8" strokeWidth={2.2} aria-hidden="true" />
                <span className="absolute right-2 top-2 size-2.5 rounded-full bg-[#EF4444]" />
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className={`mx-auto ${maxWidth} px-4 py-6 pb-28`}>{children}</main>
      {hideNav ? null : <TechnicianNav />}
    </div>
  );
}
