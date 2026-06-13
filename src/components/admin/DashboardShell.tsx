import Link from 'next/link';
import { Activity, Bell, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdminNavLinks } from '@/components/admin/AdminNavLinks';
import { adminButtonClass } from '@/components/admin/AdminUI';
import { Logo } from '@/components/marketing/Logo';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { getDashboardStats } from '@/features/bookings/queries';

export async function AdminShell({
  children,
  title = 'Admin Dashboard',
  eyebrow = 'Operations',
  description,
  actions
}: {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  const stats = await getDashboardStats().catch(() => null);
  const pendingCount = stats?.pending || 0;
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Dhaka'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F7F9FB] font-['Work_Sans',Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#000D32]">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-[#D8DADC] bg-white p-5 lg:block">
        <div className="rounded-lg border border-[#D8DADC] bg-[#F7F9FB] p-4">
          <Logo />
          <div className="mt-4 flex min-h-11 items-center gap-2 rounded border border-[#D8DADC] bg-white px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#12234D]">
            <ShieldCheck className="size-4 text-[#2EA9D6]" aria-hidden="true" />
            Control room
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-[#D8DADC] bg-[#000D32] p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Live Ops</p>
              <p className="mt-1 text-2xl font-semibold leading-none">{pendingCount}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded bg-white/10">
              <Activity className="size-5 text-[#2EA9D6]" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-xs font-medium leading-5 text-white/70">Pending orders that need admin action.</p>
        </div>
        <nav className="mt-5 space-y-1">
          <AdminNavLinks pendingCount={pendingCount} />
        </nav>
        <div className="absolute inset-x-5 bottom-5 rounded-lg border border-[#D8DADC] bg-[#F7F9FB] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45464F]">Session</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/" className={adminButtonClass.secondary}>
              <ExternalLink className="size-4" aria-hidden="true" />
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-[#D8DADC] bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2EA9D6]">{eyebrow}</p>
                <span className="hidden h-1 w-1 rounded-full bg-[#D8DADC] sm:inline-block" aria-hidden="true" />
                <p className="hidden items-center gap-1.5 text-[12px] font-semibold text-[#45464F] sm:inline-flex">
                  <CalendarDays className="size-3.5 text-[#2EA9D6]" aria-hidden="true" />
                  {today}
                </p>
              </div>
              <h1 className="mt-1 text-2xl font-semibold leading-8 text-[#000D32] lg:text-[30px] lg:leading-[38px]">{title}</h1>
              {description ? <p className="mt-1 max-w-3xl text-sm font-medium leading-5 text-[#45464F]">{description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <Link href="/" className={`${adminButtonClass.secondary} lg:hidden`}>
                <ExternalLink className="size-4" aria-hidden="true" />
                <span>View site</span>
              </Link>
              <Link
                href="/admin/bookings?status=pending"
                className="relative hidden min-h-11 items-center justify-center rounded border border-[#D8DADC] bg-[#F7F9FB] px-3 text-[#000D32] transition hover:border-[#2EA9D6] lg:inline-flex"
                aria-label={`${pendingCount} pending orders`}
              >
                <Bell className="size-4" aria-hidden="true" />
                {pendingCount > 0 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white">
                    {pendingCount}
                  </span>
                ) : null}
              </Link>
              <div className="lg:hidden">
                <LogoutButton />
              </div>
            </div>
          </div>
          <nav className="mt-4 lg:hidden">
            <AdminNavLinks pendingCount={pendingCount} mobile />
          </nav>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
