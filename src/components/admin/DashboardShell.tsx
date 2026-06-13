import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';
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
        <nav className="mt-6 space-y-1">
          <AdminNavLinks pendingCount={pendingCount} />
        </nav>
      </aside>
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-[#D8DADC] bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2EA9D6]">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold leading-8 text-[#000D32] lg:text-[30px] lg:leading-[38px]">{title}</h1>
              {description ? <p className="mt-1 max-w-3xl text-sm font-medium leading-5 text-[#45464F]">{description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <Link
                href="/"
                className={adminButtonClass.secondary}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                <span>View site</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            <AdminNavLinks pendingCount={pendingCount} mobile />
          </nav>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
