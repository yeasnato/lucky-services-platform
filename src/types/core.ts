export type UserRole = 'admin' | 'technician' | 'customer';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'accepted'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceCategory =
  | 'ac'
  | 'fridge'
  | 'washing'
  | 'microwave'
  | 'geyser'
  | 'hood';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  price: number | 'On Inspection';
  type: 'service' | 'repair';
  description: string;
  popular?: boolean;
}

export interface BookingRequest {
  customerName: string;
  customerPhone: string;
  address: string;
  serviceId?: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  source?: string;
}
