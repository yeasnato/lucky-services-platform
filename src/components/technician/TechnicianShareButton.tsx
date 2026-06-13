'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

export function TechnicianShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="flex size-11 items-center justify-center rounded-full text-[#000D32] transition hover:bg-white"
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
      <Share2 className="size-6" strokeWidth={2.8} aria-hidden="true" />
      <span className="sr-only">{copied ? 'Copied' : 'Share'}</span>
    </button>
  );
}
