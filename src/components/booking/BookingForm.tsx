'use client';

import { useState } from 'react';
import { Calendar, Clock, FileText, MapPin, MessageCircle, Phone, User } from 'lucide-react';
import { services } from '@/data/services';
import { business } from '@/data/business';

const timeSlots = [
  'Morning (9AM - 12PM)',
  'Afternoon (12PM - 4PM)',
  'Evening (4PM - 8PM)'
];

export function BookingForm({ selectedServiceId }: { selectedServiceId?: string }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const selectedService = services.find((service) => service.id === selectedServiceId);

  async function handleSubmit(formData: FormData) {
    setStatus('saving');

    const payload = {
      customerName: String(formData.get('customerName') || ''),
      customerPhone: String(formData.get('customerPhone') || ''),
      address: String(formData.get('address') || ''),
      preferredDate: String(formData.get('preferredDate') || ''),
      preferredTime: String(formData.get('preferredTime') || ''),
      notes: String(formData.get('notes') || ''),
      serviceId: String(formData.get('serviceId') || selectedServiceId || ''),
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
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="serviceId" value={selectedService?.id || ''} />

      {selectedService ? (
        <div className="flex items-center justify-between rounded-2xl border border-[#2EA9D6]/20 bg-[#F0F9FC] p-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Selected Service</p>
            <h3 className="font-bold text-[#0B2A4A]">{selectedService.title}</h3>
          </div>
          <span className="text-lg font-extrabold text-[#2EA9D6]">
            {typeof selectedService.price === 'number' ? `৳${selectedService.price}` : selectedService.price}
          </span>
        </div>
      ) : null}

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

      <p className="text-center text-[10px] font-medium text-gray-400">
        No payment required now. You pay after service completion.
      </p>
    </form>
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
