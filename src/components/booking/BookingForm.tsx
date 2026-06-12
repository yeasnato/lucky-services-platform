'use client';

import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock, FileText, MapPin, MessageCircle, Minus, Phone, Plus, User, Wrench } from 'lucide-react';
import { business } from '@/data/business';
import { serviceCategories, services } from '@/data/services';
import type { ServiceCategory } from '@/types/core';

const timeSlots = [
  'Morning (9AM - 12PM)',
  'Afternoon (12PM - 4PM)',
  'Evening (4PM - 8PM)'
];

const addons = [
  { id: 'urgent', label: 'Urgent visit request', helper: 'Admin confirms slot', price: 0 },
  { id: 'extra-diagnosis', label: 'Extra fault diagnosis', helper: 'For multiple issues', price: 350 },
  { id: 'parts-check', label: 'Parts / warranty check', helper: 'Technician will quote parts', price: 0 }
];

const applianceOptions: Record<ServiceCategory, { typeLabel: string; detailLabel: string; types: string[]; details: string[] }> = {
  ac: {
    typeLabel: 'AC type',
    detailLabel: 'AC capacity',
    types: ['Split AC', 'Window AC', 'Cassette / Commercial AC', 'Not sure'],
    details: ['1 ton', '1.5 ton', '2 ton', 'More than 2 ton', 'Not sure']
  },
  fridge: {
    typeLabel: 'Fridge type',
    detailLabel: 'Fridge size',
    types: ['Single door', 'Double door', 'Deep freezer', 'Showcase / Commercial', 'Not sure'],
    details: ['Small', 'Medium', 'Large', 'Commercial', 'Not sure']
  },
  washing: {
    typeLabel: 'Machine type',
    detailLabel: 'Load type',
    types: ['Top load', 'Front load', 'Semi automatic', 'Not sure'],
    details: ['6-8 kg', '9-12 kg', 'More than 12 kg', 'Not sure']
  },
  microwave: {
    typeLabel: 'Oven type',
    detailLabel: 'Issue type',
    types: ['Solo', 'Grill', 'Convection', 'Not sure'],
    details: ['Not heating', 'Spark issue', 'Button/display issue', 'General servicing', 'Not sure']
  },
  geyser: {
    typeLabel: 'Geyser type',
    detailLabel: 'Capacity',
    types: ['Electric geyser', 'Gas geyser', 'Instant geyser', 'Not sure'],
    details: ['10-15 litre', '20-30 litre', 'More than 30 litre', 'Not sure']
  },
  hood: {
    typeLabel: 'Hood type',
    detailLabel: 'Service need',
    types: ['Wall mounted', 'Island hood', 'Built-in hood', 'Not sure'],
    details: ['General cleaning', 'Deep cleaning', 'Motor issue', 'Filter issue', 'Not sure']
  }
};

export function BookingForm({ selectedServiceId }: { selectedServiceId?: string }) {
  const initialService = services.find((service) => service.id === selectedServiceId) || services.find((service) => service.popular) || services[0];
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [category, setCategory] = useState<ServiceCategory>(initialService.category);
  const [serviceId, setServiceId] = useState(initialService.id);
  const [quantity, setQuantity] = useState(1);
  const [applianceType, setApplianceType] = useState('');
  const [applianceCapacity, setApplianceCapacity] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const categoryServices = useMemo(() => services.filter((service) => service.category === category), [category]);
  const selectedService = services.find((service) => service.id === serviceId) || categoryServices[0];
  const currentApplianceOptions = applianceOptions[category];
  const selectedAddonItems = addons.filter((addon) => selectedAddons.includes(addon.id));
  const basePrice = typeof selectedService.price === 'number' ? selectedService.price : 0;
  const addonPrice = selectedAddonItems.reduce((total, addon) => total + addon.price, 0);
  const estimatedPrice = basePrice ? basePrice * quantity + addonPrice : 0;

  function changeCategory(nextCategory: ServiceCategory) {
    const nextService = services.find((service) => service.category === nextCategory);
    setCategory(nextCategory);
    setServiceId(nextService?.id || '');
    setApplianceType('');
    setApplianceCapacity('');
  }

  function toggleAddon(addonId: string) {
    setSelectedAddons((current) => (current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId]));
  }

  async function handleSubmit(formData: FormData) {
    setStatus('saving');

    const selectedAddonLabels = selectedAddonItems.map((addon) => `${addon.label}${addon.price ? ` (+BDT ${addon.price})` : ''}`);
    const payload = {
      customerName: String(formData.get('customerName') || ''),
      customerPhone: String(formData.get('customerPhone') || ''),
      address: String(formData.get('address') || ''),
      preferredDate: String(formData.get('preferredDate') || ''),
      preferredTime: String(formData.get('preferredTime') || ''),
      notes: String(formData.get('notes') || ''),
      serviceId,
      quantity,
      applianceType,
      applianceCapacity,
      selectedAddons: selectedAddonLabels,
      estimatedPrice,
      source: 'website'
    };

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setStatus('error');
      return;
    }

    const result = (await response.json()) as { whatsappUrl: string };
    setStatus('saved');
    window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-[#2EA9D6]/20 bg-[#F0F9FC] p-4">
        <div className="flex items-center gap-2">
          <Wrench className="size-5 text-[#2EA9D6]" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Choose service</p>
            <h3 className="text-lg font-extrabold text-[#0B2A4A]">Build your booking</h3>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {serviceCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeCategory(item.id)}
              className={`min-h-[46px] rounded-xl border px-3 text-sm font-bold transition ${
                category === item.id
                  ? 'border-[#2EA9D6] bg-white text-[#0B2A4A] shadow-sm'
                  : 'border-transparent bg-white/60 text-gray-500 hover:bg-white hover:text-[#0B2A4A]'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">Specific service</span>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:ring-2 focus:ring-[#2EA9D6]/20"
          >
            {categoryServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} - {typeof service.price === 'number' ? `BDT ${service.price}` : service.price}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-[1fr_150px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Selected service</p>
          <h3 className="mt-1 font-extrabold text-[#0B2A4A]">{selectedService.title}</h3>
          <p className="mt-1 text-sm font-medium text-gray-500">{selectedService.description}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Unit</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex size-10 items-center justify-center rounded-xl border border-gray-200 text-[#0B2A4A]">
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="text-2xl font-extrabold text-[#0B2A4A]">{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))} className="flex size-10 items-center justify-center rounded-xl border border-gray-200 text-[#0B2A4A]">
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <SelectField label={currentApplianceOptions.typeLabel} value={applianceType} onChange={setApplianceType} options={currentApplianceOptions.types} />
        <SelectField label={currentApplianceOptions.detailLabel} value={applianceCapacity} onChange={setApplianceCapacity} options={currentApplianceOptions.details} />
      </section>

      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Optional add-ons</p>
        <div className="grid gap-3">
          {addons.map((addon) => {
            const checked = selectedAddons.includes(addon.id);
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                  checked ? 'border-[#2EA9D6] bg-[#F0F9FC]' : 'border-gray-100 bg-white hover:border-[#2EA9D6]/40'
                }`}
              >
                <span>
                  <span className="block text-sm font-extrabold text-[#0B2A4A]">{addon.label}</span>
                  <span className="mt-1 block text-xs font-medium text-gray-500">{addon.helper}</span>
                </span>
                <span className="flex items-center gap-2 text-sm font-extrabold text-[#2EA9D6]">
                  {addon.price ? `+BDT ${addon.price}` : 'No fee now'}
                  {checked ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#0B2A4A]/10 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Estimated price</p>
            <p className="mt-1 text-sm font-semibold text-gray-500">{selectedService.title} x {quantity}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-[#0B2A4A]">{estimatedPrice ? `৳${estimatedPrice.toLocaleString('en')}` : 'On inspection'}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">Final after inspection</p>
          </div>
        </div>
      </section>

      <Field icon={<User size={18} />} name="customerName" placeholder="Your Full Name" required />
      <Field icon={<Phone size={18} />} name="customerPhone" placeholder="Phone Number (e.g. 017...)" required type="tel" />
      <Field icon={<MapPin size={18} />} name="address" placeholder="House No, Road No, Area..." required textarea />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field icon={<Calendar size={18} />} name="preferredDate" required type="date" min={new Date().toISOString().split('T')[0]} />
        <label className="relative block">
          <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"><Clock size={18} /></span>
          <select name="preferredTime" required className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white focus:ring-2 focus:ring-[#2EA9D6]/20">
            <option value="">Select Time</option>
            {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </label>
      </div>

      <Field icon={<FileText size={18} />} name="notes" placeholder="Any specific issues or instructions? (Optional)" textarea />

      <button
        type="submit"
        disabled={status === 'saving'}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <MessageCircle size={20} className="fill-white" />
        {status === 'saving' ? 'Saving Booking...' : 'Confirm via WhatsApp'}
      </button>

      {status === 'error' ? (
        <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
          Booking could not be saved. Please call {business.phoneDisplay}.
        </p>
      ) : null}

      {status === 'saved' ? (
        <p className="rounded-xl bg-green-50 p-3 text-center text-sm font-bold text-green-700">
          Booking saved. WhatsApp has opened with your order details.
        </p>
      ) : null}

      <p className="text-center text-[10px] font-medium text-gray-400">
        No advance payment required. Admin confirms details before technician assignment.
      </p>
    </form>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#0B2A4A] outline-none focus:border-[#2EA9D6] focus:bg-white focus:ring-2 focus:ring-[#2EA9D6]/20"
      >
        <option value="">Select option</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Field({
  icon,
  textarea,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  textarea?: boolean;
}) {
  const className = 'w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 font-medium text-[#0B2A4A] outline-none transition placeholder:text-gray-400 focus:border-[#2EA9D6] focus:bg-white focus:ring-2 focus:ring-[#2EA9D6]/20';

  return (
    <label className="relative block">
      <span className="absolute left-4 top-3.5 text-gray-400">{icon}</span>
      {textarea ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={2}
          className={`${className} resize-none`}
        />
      ) : (
        <input {...props} className={className} />
      )}
    </label>
  );
}
