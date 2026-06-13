import { Suspense } from 'react';
import { Wrench } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/marketing/Logo';

export default function TechnicianLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FB] px-4 py-8 font-['Work_Sans',Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      <div className="w-full max-w-[430px] overflow-hidden rounded-lg border border-[#D8DADC] bg-white shadow-[0_20px_50px_rgba(18,35,77,0.12)]">
        <section className="bg-[#000D32] p-8 text-white">
          <Logo inverted />
          <div className="mt-10 flex size-12 items-center justify-center rounded-lg bg-white/15">
            <Wrench className="size-6 text-[#2EA9D6]" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#2EA9D6]">Technician Panel</p>
          <h1 className="mt-2 text-3xl font-semibold">Field team login</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-white/80">
            View assigned jobs, accept work, update job progress, and complete service tasks.
          </p>
          <Link href="/admin/login" className="mt-8 inline-block text-sm font-semibold text-[#2EA9D6]">
            Admin login
          </Link>
        </section>
        <section className="p-6">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
            <LoginForm allowedRole="technician" fallbackPath="/technician/dashboard" />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
