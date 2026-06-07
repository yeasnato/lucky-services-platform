'use client';

import Image from 'next/image';
import { CheckCircle, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const images = [
  { src: '/slider-1.jpg', alt: 'Lucky Services Centre home appliance repair service in Dhaka' },
  { src: '/slider-2.jpg', alt: 'Verified expert technicians for appliance repair in Dhaka' },
  { src: '/slider-3.jpg', alt: 'Trusted home appliance service marketplace in Dhaka' }
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [area, setArea] = useState('');
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((value) => (value + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col bg-white">
      <h1 className="sr-only">Lucky Services Centre - Home Appliance Repair Service in Dhaka</h1>

      <div className="group relative w-full overflow-hidden bg-[#0B2A4A] md:aspect-[16/5]">
        <Image src={images[0].src} alt="" width={1568} height={504} className="block w-full invisible md:hidden" priority />
        {images.map((image, index) => (
          <div key={image.src} className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}>
            <Image src={image.src} alt={image.alt} fill priority={index === 0} className="object-cover object-center" sizes="100vw" />
          </div>
        ))}
        <button onClick={() => setCurrent((current - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/30 p-2 text-[#0B2A4A] opacity-0 shadow-sm backdrop-blur-md transition group-hover:opacity-100 md:left-8 md:p-3" aria-label="Previous slide">
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => setCurrent((current + 1) % images.length)} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/30 p-2 text-[#0B2A4A] opacity-0 shadow-sm backdrop-blur-md transition group-hover:opacity-100 md:right-8 md:p-3" aria-label="Next slide">
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="relative z-30 mb-10 mt-0 w-full px-4 md:-mt-16 md:mb-16 md:px-6">
        <div className="mx-auto mt-3 max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/60 md:mt-0 md:p-8">
          <div className="mb-6 text-center">
            <h2 className="mb-1.5 text-xl font-bold text-[#0B2A4A] md:text-2xl">Service Availability</h2>
            <p className="text-sm text-gray-500">Check if our experts are available in your area.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={area} onChange={(event) => { setArea(event.target.value); setAvailable(false); }} placeholder="Enter your location (e.g. Mirpur)" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white focus:ring-2 focus:ring-[#2EA9D6]/20" />
            </div>
            <button onClick={() => area.trim() && setAvailable(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#0B2A4A] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0B2A4A]/20 transition hover:bg-[#0f355c]">
              <Search size={18} /> Check Now
            </button>
          </div>
          {available ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm font-medium text-green-700">
              <CheckCircle size={16} className="text-green-600" />
              Service is available in your area.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
