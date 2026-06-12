import { business } from '@/data/business';
import { services } from '@/data/services';
import type { BookingRequestInput } from '@/lib/validations/booking';

export function createOrderId() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `LSC-${year}${month}${day}-${rand}`;
}

export function createWhatsAppUrl(input: BookingRequestInput, orderId: string) {
  const service = input.serviceId ? services.find((item) => item.id === input.serviceId) : null;
  const serviceName = service?.title || 'General Inquiry';
  const servicePrice = service
    ? typeof service.price === 'number'
      ? `BDT ${service.price}`
      : service.price
    : '';

  const lines = [
    '*BOOKING REQUEST*',
    `Order: #${orderId}`,
    '',
    '*SERVICE*',
    `Name     : ${serviceName}`,
    ...(servicePrice ? [`Price    : ${servicePrice}`] : []),
    '',
    '*CUSTOMER*',
    `Name     : ${input.customerName}`,
    `Phone    : ${input.customerPhone}`,
    `Address  : ${input.address}`,
    '',
    '*SCHEDULE*',
    `Date     : ${input.preferredDate}`,
    `Time     : ${input.preferredTime}`,
    ...(input.notes?.trim() ? ['', '*NOTE*', input.notes.trim()] : [])
  ];

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}
