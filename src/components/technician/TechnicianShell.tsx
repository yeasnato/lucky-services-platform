import Link from 'next/link';
import { BriefcaseBusiness, LayoutDashboard } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Logo } from '@/components/marketing/Logo';

export function TechnicianShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo />
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-bold">
            <Link href="/technician/dashboard" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-[#F0F9FC]">
              <LayoutDashboard className="size-4 text-[#2EA9D6]" aria-hidden="true" />
              Dashboard
            </Link>
            <Link href="/technician/jobs" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-[#F0F9FC]">
              <BriefcaseBusiness className="size-4 text-[#2EA9D6]" aria-hidden="true" />
              Jobs
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
