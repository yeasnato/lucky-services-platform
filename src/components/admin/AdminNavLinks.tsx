'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, ExternalLink, LayoutDashboard, UsersRound } from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/bookings', icon: ClipboardList },
  { label: 'Technicians', href: '/admin/technicians', icon: UsersRound },
  { label: 'Website', href: '/', icon: ExternalLink }
];

export function AdminNavLinks({ pendingCount = 0, mobile = false }: { pendingCount?: number; mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {adminNav.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const showBadge = item.href === '/admin/bookings' && pendingCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded border px-2 text-[11px] font-semibold transition ${
                isActive
                  ? 'border-[#000D32] bg-[#000D32] text-white'
                  : 'border-[#D8DADC] bg-white text-[#45464F] hover:border-[#2EA9D6] hover:text-[#000D32]'
              }`}
            >
              <item.icon className={isActive ? 'size-4 text-white' : 'size-4 text-[#2EA9D6]'} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              {showBadge ? (
                <span className={`absolute right-1.5 top-1.5 rounded-full px-1.5 text-[10px] font-semibold ${isActive ? 'bg-white text-[#000D32]' : 'bg-amber-100 text-amber-700'}`}>
                  {pendingCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {adminNav.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const showBadge = item.href === '/admin/bookings' && pendingCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex min-h-11 items-center gap-3 rounded px-3 text-sm font-semibold transition ${
              isActive
                ? 'bg-[#F2F4F6] text-[#000D32] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-[#000D32]'
                : 'text-[#45464F] hover:bg-[#F2F4F6] hover:text-[#000D32]'
            }`}
          >
            <item.icon className={isActive ? 'size-4 text-[#000D32]' : 'size-4 text-[#2EA9D6]'} aria-hidden="true" />
            <span>{item.label}</span>
            {showBadge ? (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {pendingCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
