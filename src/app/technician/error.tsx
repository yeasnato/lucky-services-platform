'use client';

export default function TechnicianError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FB] px-4">
      <div className="max-w-md rounded-lg border border-[#D8DADC] bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#2EA9D6]">Technician error</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#000D32]">This technician page could not load</h1>
        <p className="mt-2 text-sm font-medium text-[#45464F]">Please retry or contact admin if the assigned job is missing.</p>
        <button onClick={reset} className="mt-5 rounded bg-[#000D32] px-5 py-3 text-sm font-semibold text-white">
          Retry
        </button>
      </div>
    </main>
  );
}
