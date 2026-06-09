'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BriefcaseBusiness, CheckCircle2, LayoutDashboard, UserRound } from 'lucide-react';

const navItems = [
  { href: '/technician/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/technician/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/technician/jobs?view=completed', label: 'Done', icon: CheckCircle2 },
  { href: '/technician/profile', label: 'Profile', icon: UserRound }
];

export function TechnicianNav({ variant = 'bottom' }: { variant?: 'top' | 'bottom' }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');

  if (variant === 'top') {
    return (
      <nav className="hidden items-center gap-1 rounded-lg border border-sky-100 bg-[#F7FBFD] p-1 text-sm font-bold lg:flex">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname, currentView);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-md px-3 text-sm transition ${
                active ? 'bg-white text-[#0B2A4A] shadow-sm' : 'text-slate-500 hover:bg-white hover:text-[#0B2A4A]'
              }`}
            >
              <Icon className={`size-4 ${active ? 'text-[#2EA9D6]' : 'text-slate-400'}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-100 bg-white/95 px-3 py-2 shadow-[0_-10px_30px_rgba(11,42,74,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname, currentView);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-extrabold transition ${
                active ? 'bg-[#EAF8FD] text-[#0B2A4A]' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className={`size-5 ${active ? 'text-[#2EA9D6]' : 'text-slate-400'}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isActive(href: string, pathname: string, currentView: string | null) {
  if (href.includes('?view=completed')) {
    return pathname === '/technician/jobs' && currentView === 'completed';
  }

  if (href === '/technician/jobs') {
    return pathname === '/technician/jobs' && currentView !== 'completed';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
