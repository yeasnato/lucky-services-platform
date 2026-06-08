import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/marketing/Logo';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7FAFC] px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1fr_1.1fr]">
        <section className="bg-[#0B2A4A] p-8 text-white">
          <Logo inverted />
          <div className="mt-10 flex size-12 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck className="size-6 text-[#2EA9D6]" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-extrabold">Operations login</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-white/70">
            Confirm bookings, assign technicians, edit orders, and manage the service workflow.
          </p>
          <Link href="/technician/login" className="mt-8 inline-block text-sm font-bold text-[#2EA9D6]">
            Technician login
          </Link>
        </section>
        <section className="p-6 md:p-8">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
            <LoginForm allowedRole="admin" fallbackPath="/admin/dashboard" />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
