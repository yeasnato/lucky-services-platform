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
  const phoneFrameWidth = 'max-w-[430px]';

  return (
    <div className="min-h-screen bg-[#F7F9FB] font-['Work_Sans',Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#000D32]">
      <div data-wide-requested={wide ? 'true' : undefined} className={`relative mx-auto min-h-screen w-full ${phoneFrameWidth} bg-[#F7F9FB] shadow-[0_0_42px_rgba(18,35,77,0.10)]`}>
      <header className="sticky top-0 z-30 border-b border-[#D8DADC] bg-white/95 shadow-[0_1px_0_rgba(18,35,77,0.02)] backdrop-blur">
        {isPageHeader ? (
          <div className={`grid ${largeHeader ? 'min-h-[86px]' : 'min-h-[56px]'} grid-cols-[52px_1fr_52px] items-center px-3`}>
            <Link href={backHref || '/technician/dashboard'} className="flex size-11 items-center justify-center rounded text-[#000D32] transition hover:bg-[#F2F4F6]" aria-label="Go back">
              <ArrowLeft className={largeHeader ? 'size-8' : 'size-5'} strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <h1 className={`truncate font-semibold tracking-normal text-[#000D32] ${titleAlign === 'left' ? 'text-left' : 'text-center'} ${largeHeader ? 'text-[26px] leading-8' : 'text-[20px] leading-7'}`}>{title}</h1>
            <div className="flex justify-end">{headerAction}</div>
          </div>
        ) : (
          <div className="grid min-h-[72px] grid-cols-[48px_1fr_48px] items-center gap-2 px-4">
            <div className="flex min-w-0 items-center justify-start">
              {showMenu ? (
                <Link href="/technician/dashboard" className="flex size-11 shrink-0 items-center justify-center rounded text-[#000D32] transition hover:bg-[#F2F4F6]" aria-label="Open technician home">
                  <Menu className="size-7" strokeWidth={2.4} aria-hidden="true" />
                </Link>
              ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded border border-[#C5C6D0] bg-[#F2F4F6] text-[#191C1E] shadow-[inset_0_0_0_1px_rgba(0,13,50,0.04)]">
                  <UserRound className="size-6" strokeWidth={2.2} aria-hidden="true" />
                </div>
              )}
            </div>
            <Link href="/technician/dashboard" className={`truncate ${showMenu ? 'text-center' : 'text-left'} text-[24px] font-semibold leading-8 tracking-normal text-[#000D32]`}>
              {title}
            </Link>
            <div className="flex shrink-0 items-center justify-end">
              <Link href="/technician/alerts" className="relative flex size-11 items-center justify-center rounded text-[#000D32] transition hover:bg-[#F2F4F6]" aria-label="Open alerts">
                <Bell className="size-7" strokeWidth={2.2} aria-hidden="true" />
                <span className="absolute right-2 top-2 size-2.5 rounded-full bg-[#BA1A1A]" />
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="px-4 py-6 pb-24">{children}</main>
      {hideNav ? null : <TechnicianNav />}
      </div>
    </div>
  );
}
