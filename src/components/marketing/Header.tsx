'use client';

import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { business } from '@/data/business';
import { Logo } from './Logo';

export function Header() {
  const [open, setOpen] = useState(false);

  const nav = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/#services-section' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <>
      <div className="relative z-50 hidden bg-[#0B2A4A] py-2 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 text-xs font-medium tracking-wide">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin size={13} className="shrink-0 text-[#2EA9D6]" />
              <span>{business.address.full}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={13} className="shrink-0 text-[#2EA9D6]" />
              <span>{business.hours.display}</span>
            </div>
          </div>
          <a href={`tel:${business.phoneInternational}`} className="flex items-center gap-1.5 hover:text-[#2EA9D6]">
            <Phone size={13} className="text-[#2EA9D6]" />
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" aria-label="Lucky Services Centre home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <Link key={item.label} href={item.href} className="text-[13.5px] font-bold text-gray-600 hover:text-[#2EA9D6]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <div className="flex flex-col items-end gap-0.5 border-r border-gray-200 pr-5">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-gray-400">Emergency Call</span>
              <a href={`tel:${business.phoneInternational}`} className="text-[13.5px] font-extrabold text-[#0B2A4A] hover:text-[#2EA9D6]">
                {business.phoneDisplay}
              </a>
            </div>
            <Link href="/booking" className="flex items-center gap-2 rounded-xl bg-[#2EA9D6] px-6 py-[10px] text-[13.5px] font-bold text-white shadow-lg shadow-[#2EA9D6]/25 transition hover:-translate-y-0.5 hover:bg-[#259ac5]">
              Book Service
              <ArrowRight size={15} />
            </Link>
          </div>

          <button
            className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-[#0B2A4A] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-[320px] flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-full border border-gray-100 bg-white p-2 text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6">
              {nav.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="block rounded-xl p-4 font-bold text-[#0B2A4A] hover:bg-blue-50">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 bg-gray-50/40 p-6">
              <Link href="/booking" onClick={() => setOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2EA9D6] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200">
                Book Service Now
                <ArrowRight size={15} />
              </Link>
              <a href={`tel:${business.phoneInternational}`} className="mt-4 block text-center text-[19px] font-extrabold text-[#0B2A4A]">
                {business.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
