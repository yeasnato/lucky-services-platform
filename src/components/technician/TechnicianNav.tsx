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
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[#C5C6D0] bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname, currentView);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-[0.04em] transition ${navItemClass(item.href, active)}`}
            >
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={2.2} aria-hidden="true" />
                {item.href === '/technician/alerts' ? <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-[#EF4444]" /> : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function navItemClass(href: string, active: boolean) {
  if (!active) return 'rounded-[16px] text-[#191C1E] hover:bg-[#F2F4F6]';
  if (href === '/technician/dashboard') return 'rounded-[16px] bg-[#000D32] text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]';
  return 'rounded-full bg-[#50D9FE] text-[#005C70] shadow-[0_8px_18px_rgba(80,217,254,0.28)]';
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
