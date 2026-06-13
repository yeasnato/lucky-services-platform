'use client';

import { Download } from 'lucide-react';

export function TechnicianPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-[62px] w-full items-center justify-center gap-4 rounded-[20px] bg-[#000D32] text-[20px] font-medium tracking-[0.04em] text-white shadow-[0_8px_18px_rgba(0,13,50,0.18)]"
    >
      <Download className="size-6" aria-hidden="true" />
      Download PDF Receipt
    </button>
  );
}
