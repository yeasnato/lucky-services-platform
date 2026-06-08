'use client';

export default function TechnicianError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F9FC] px-4">
      <div className="max-w-md rounded-lg border border-sky-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-[#2EA9D6]">Technician error</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#0B2A4A]">This technician page could not load</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Please retry or contact admin if the assigned job is missing.</p>
        <button onClick={reset} className="mt-5 rounded-lg bg-[#2EA9D6] px-5 py-3 text-sm font-bold text-white">
          Retry
        </button>
      </div>
    </main>
  );
}
