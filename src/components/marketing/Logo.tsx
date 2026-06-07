import { business } from '@/data/business';

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="relative inline-flex flex-col items-start px-4 py-[11px] select-none">
      <div className="absolute left-0 top-0 h-[58%] w-1/2 rounded-tl-[11px] border-l-[2.5px] border-t-[2.5px] border-[#5ab9ea]" />
      <div
        className={`absolute bottom-0 right-0 h-[55%] w-[65%] rounded-br-[11px] border-b-[2.5px] border-r-[2.5px] ${
          inverted ? 'border-white/50' : 'border-[#0B2A4A]'
        }`}
      />
      <span
        className="relative z-10 text-[30px] leading-none text-[#5ab9ea] md:text-[34px]"
        style={{
          fontFamily: '"Arial Rounded MT Bold", "Nunito", "Varela Round", sans-serif',
          fontWeight: 900,
          letterSpacing: '0.015em'
        }}
      >
        Lucky
      </span>
      <span
        className={`relative z-10 mt-[5px] w-full text-[8px] font-extrabold uppercase tracking-[0.21em] md:text-[9px] ${
          inverted ? 'text-white/75' : 'text-[#0B2A4A]'
        }`}
      >
        Services Centre
      </span>
      <span className="sr-only">{business.name}</span>
    </div>
  );
}
