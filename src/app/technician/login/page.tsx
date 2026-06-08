import { Suspense } from 'react';
import { Wrench } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/marketing/Logo';

export default function TechnicianLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F9FC] px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl md:grid-cols-[1fr_1.1fr]">
        <section className="bg-[#2EA9D6] p-8 text-white">
          <Logo inverted />
          <div className="mt-10 flex size-12 items-center justify-center rounded-lg bg-white/15">
            <Wrench className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-white/70">Technician Panel</p>
          <h1 className="mt-2 text-3xl font-extrabold">Field team login</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-white/80">
            View assigned jobs, accept work, update job progress, and complete service tasks.
          </p>
          <Link href="/admin/login" className="mt-8 inline-block text-sm font-bold text-white">
            Admin login
          </Link>
        </section>
        <section className="p-6 md:p-8">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
            <LoginForm allowedRole="technician" fallbackPath="/technician/dashboard" />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
