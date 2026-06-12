'use client';

import { Download } from 'lucide-react';

export function TechnicianPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#000D32] text-2xl font-black text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]"
    >
      <Download className="size-7" aria-hidden="true" />
      Print Receipt
    </button>
  );
}
