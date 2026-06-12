'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

export function TechnicianShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-black text-[#000D32] transition hover:bg-white"
      aria-label="Share receipt"
      onClick={async () => {
        const url = window.location.href;

        if (navigator.share) {
          await navigator.share({ title, text, url });
          return;
        }

        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
    >
      <Share2 className="size-6" aria-hidden="true" />
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
