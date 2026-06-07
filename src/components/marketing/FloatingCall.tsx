import { Phone } from 'lucide-react';
import { business } from '@/data/business';

export function FloatingCall() {
  return (
    <a
      href={`tel:${business.phoneInternational}`}
      className="group fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-[#2EA9D6] p-4 text-white shadow-2xl transition hover:scale-110 hover:bg-[#259ac5]"
      aria-label={`Call ${business.name} at ${business.phoneDisplay}`}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2EA9D6] opacity-30" />
      <Phone size={28} className="relative z-10 fill-current" />
    </a>
  );
}
