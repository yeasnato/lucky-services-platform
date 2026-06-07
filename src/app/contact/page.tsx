import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/marketing/Footer';
import { Header } from '@/components/marketing/Header';
import { business } from '@/data/business';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Contact</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#0B2A4A]">Need urgent appliance repair?</h1>
          <p className="mt-3 text-gray-500">Call us or book a service request online. Admin will confirm and assign a technician.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Info icon={<Phone size={20} />} label="Phone" value={business.phoneDisplay} />
            <Info icon={<MapPin size={20} />} label="Address" value={business.address.full} />
            <Info icon={<ShieldCheck size={20} />} label="Hours" value={business.hours.display} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F0F9FC] p-5">
      <div className="mb-3 text-[#2EA9D6]">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold leading-relaxed text-[#0B2A4A]">{value}</p>
    </div>
  );
}
