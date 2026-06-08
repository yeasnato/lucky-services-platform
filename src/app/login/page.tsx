import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/marketing/Logo';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-[#0B2A4A] px-6 py-6">
          <Logo inverted />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Staff Access</p>
          <h1 className="mt-1 text-2xl font-extrabold text-white">Sign in to dashboard</h1>
        </div>
        <div className="p-6 md:p-8">
          <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
            <LoginForm />
          </Suspense>
          <p className="mt-5 text-center text-xs text-gray-400">
            Customers do not need an account. This login is only for admin and technicians.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs font-bold text-[#2EA9D6]">
            <Link href="/admin/login">Admin login</Link>
            <Link href="/technician/login">Technician login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
