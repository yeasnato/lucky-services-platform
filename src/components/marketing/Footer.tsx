import Link from 'next/link';
import { MapPin, ShieldCheck } from 'lucide-react';
import { business } from '@/data/business';
import { serviceCategories } from '@/data/services';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t-4 border-[#2EA9D6] bg-[#0B2A4A] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/">
              <Logo inverted />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Dhaka&apos;s trusted home appliance repair service. We bring professional expertise right to your doorstep with guaranteed satisfaction.
            </p>
          </div>

          <div>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              Our Services <span className="h-1 w-8 rounded-full bg-[#2EA9D6]" />
            </h3>
            <ul className="space-y-3">
              {serviceCategories.map((service) => (
                <li key={service.id}>
                  <Link href={`/services/${service.slug}`} className="text-sm font-medium text-gray-400 hover:text-[#2EA9D6]">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              Company <span className="h-1 w-8 rounded-full bg-[#2EA9D6]" />
            </h3>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/">About Us</Link></li>
              <li><Link href="/#services-section">All Services</Link></li>
              <li><Link href="/booking">Book Service</Link></li>
              <li><Link href="/contact">Contact Support</Link></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#153859] p-6 shadow-xl">
            <h4 className="relative z-10 mb-1 font-bold text-white">Need Urgent Help?</h4>
            <p className="relative z-10 mb-4 text-xs font-medium uppercase tracking-wider text-[#2EA9D6]">Support Available</p>
            <a href={`tel:${business.phoneInternational}`} className="mb-4 block text-2xl font-extrabold text-white hover:text-[#2EA9D6]">
              {business.phoneDisplay}
            </a>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 shrink-0 text-[#2EA9D6]" />
                <p className="text-xs leading-relaxed text-gray-300">{business.address.full}</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="mt-1 shrink-0 text-[#25D366]" />
                <p className="text-xs leading-relaxed text-gray-300">Working Hours: {business.hours.display}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-center text-xs text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[#2EA9D6]/30 bg-[#153859] px-4 py-2 shadow-sm">
            <ShieldCheck size={14} className="text-[#25D366]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">Verified Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
