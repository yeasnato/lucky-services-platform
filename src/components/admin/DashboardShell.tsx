import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { AdminNavLinks } from '@/components/admin/AdminNavLinks';
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
    <div className="min-h-screen bg-[#F7FAFC]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="rounded-lg border border-slate-200 bg-[#F8FCFE] p-4">
          <Logo />
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#0B2A4A] shadow-sm">
            <ShieldCheck className="size-4 text-[#2EA9D6]" aria-hidden="true" />
            Admin control room
          </div>
        </div>
        <nav className="mt-6 space-y-1">
          <AdminNavLinks pendingCount={pendingCount} />
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#0B2A4A]">{title}</h1>
              {description ? <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0B2A4A] transition hover:border-[#2EA9D6] hover:text-[#2EA9D6]"
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
