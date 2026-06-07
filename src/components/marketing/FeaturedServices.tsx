import Image from 'next/image';
import Link from 'next/link';
import { serviceCategories } from '@/data/services';

export function FeaturedServices() {
  return (
    <section id="services-section" className="w-full scroll-mt-28">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {serviceCategories.map((service, index) => (
          <div key={service.id} className={`flex flex-col items-center justify-center border-b border-white/10 px-6 py-12 text-center ${index % 2 === 0 ? 'bg-[#67C3EA]' : 'bg-[#5BBCE5]'}`}>
            <div className="mb-8 flex h-64 w-64 items-center justify-center rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5 transition hover:scale-105">
              <Image src={service.image} alt={service.alt} width={256} height={256} className="h-full w-full object-contain drop-shadow-sm" />
            </div>
            <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-[#0B2A4A]">{service.title}</h3>
            <p className="mb-8 text-sm font-bold uppercase tracking-widest text-[#0B2A4A]/80">{service.subtitle}</p>
            <Link href={`/services/${service.slug}`} className="rounded-xl bg-[#0B2A4A] px-10 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-1 hover:bg-[#154675]">
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
