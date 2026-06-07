import Link from 'next/link';
import { Logo } from '@/components/marketing/Logo';
import { LogoutButton } from '@/components/auth/LogoutButton';

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Bookings', href: '/admin/bookings' },
  { label: 'Technicians', href: '/admin/technicians' },
  { label: 'Public Site', href: '/' }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-gray-200 bg-white p-6 lg:block">
        <Logo />
        <nav className="mt-10 space-y-2">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-[#F0F9FC] hover:text-[#2EA9D6]">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Operations</p>
              <h1 className="text-xl font-extrabold text-[#0B2A4A]">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#0B2A4A]">View site</Link>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
