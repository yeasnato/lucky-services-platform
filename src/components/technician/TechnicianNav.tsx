'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bell, ClipboardList, Clock3, Home, UserRound } from 'lucide-react';

const navItems = [
  { href: '/technician/dashboard', label: 'Home', icon: Home },
  { href: '/technician/jobs', label: 'Orders', icon: ClipboardList },
  { href: '/technician/jobs?view=delayed', label: 'Delayed', icon: Clock3 },
  { href: '/technician/alerts', label: 'Alerts', icon: Bell },
  { href: '/technician/profile', label: 'Profile', icon: UserRound }
];

export function TechnicianNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-8px_24px_rgba(18,35,77,0.06)] backdrop-blur">
      <div className="mx-auto grid max-w-[620px] grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname, currentView);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl text-[12px] font-bold tracking-wide transition ${
                active ? 'bg-[#50D9FE] text-[#000D32] shadow-[0_8px_18px_rgba(80,217,254,0.28)]' : 'text-[#45464F] hover:bg-slate-50'
              }`}
            >
              <span className="relative">
                <Icon className="size-6" strokeWidth={2.2} aria-hidden="true" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isActive(href: string, pathname: string, currentView: string | null) {
  if (href.includes('?view=delayed')) {
    return pathname === '/technician/jobs' && currentView === 'delayed';
  }

  if (href === '/technician/jobs') {
    return pathname === '/technician/jobs' && currentView !== 'delayed';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
