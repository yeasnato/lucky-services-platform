'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, ExternalLink, LayoutDashboard, UsersRound } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
  { label: 'Technicians', href: '/admin/technicians', icon: UsersRound },
  { label: 'Public Site', href: '/', icon: ExternalLink }
];

export function AdminNavLinks({ pendingCount = 0, mobile = false }: { pendingCount?: number; mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {adminNav.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const showBadge = item.href === '/admin/bookings' && pendingCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              mobile
                ? `inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
                    isActive
                      ? 'border-[#2EA9D6] bg-[#F0F9FC] text-[#0B2A4A]'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`
                : `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                    isActive
                      ? 'bg-[#F0F9FC] text-[#0B2A4A]'
                      : 'text-slate-600 hover:bg-[#F0F9FC] hover:text-[#0B2A4A]'
                  }`
            }
          >
            <item.icon className="size-4 text-[#2EA9D6]" aria-hidden="true" />
            <span>{item.label}</span>
            {showBadge ? (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-700">
                {pendingCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
