'use client';

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FB] px-4">
      <div className="max-w-md rounded-lg border border-rose-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-rose-500">Admin error</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#000D32]">This admin page could not load</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Please retry. If it repeats, check the Supabase environment variables in Vercel.</p>
        <button onClick={reset} className="mt-5 rounded-lg bg-[#2EA9D6] px-5 py-3 text-sm font-bold text-white">
          Retry
        </button>
      </div>
    </main>
  );
}
