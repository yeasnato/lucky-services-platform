import type { ServiceCategory, ServiceItem } from '@/types/core';

export const serviceCategories: Array<{
  id: ServiceCategory;
  title: string;
  subtitle: string;
  slug: string;
  image: string;
  alt: string;
}> = [
  {
    id: 'ac',
    title: 'AC Service',
    subtitle: 'Installation & Repair',
    slug: 'ac-repair-service-dhaka',
    image: 'https://ik.imagekit.io/v4mlqlybs/Image/AC.png?updatedAt=1771331451317',
    alt: 'AC repair service Dhaka by Lucky Services Centre'
  },
  {
    id: 'fridge',
    title: 'Refrigerator',
    subtitle: 'Service & Repair',
    slug: 'refrigerator-repair-dhaka',
    image: 'https://ik.imagekit.io/v4mlqlybs/IMG_0515-removebg-preview.jpg',
    alt: 'Refrigerator repair service in Dhaka'
  },
  {
    id: 'washing',
    title: 'Washing Machine',
    subtitle: 'Full Service',
    slug: 'washing-machine-repair-dhaka',
    image: 'https://ik.imagekit.io/v4mlqlybs/IMG_0516-removebg-preview.jpg',
    alt: 'Washing machine repair service in Dhaka'
  },
  {
    id: 'microwave',
    title: 'Microwave Oven',
    subtitle: 'Repair & Parts',
    slug: 'microwave-oven-repair-dhaka',
    image: 'https://ik.imagekit.io/v4mlqlybs/IMG_0517-removebg-preview.jpg',
    alt: 'Microwave oven repair service in Dhaka'
  },
  {
    id: 'geyser',
    title: 'Geyser',
    subtitle: 'Install & Fix',
    slug: 'geyser-repair-dhaka',
    image: 'https://ik.imagekit.io/v4mlqlybs/Image/Gyser.jpg?updatedAt=1771331477846',
    alt: 'Geyser repair and installation service in Dhaka'
  },
  {
    id: 'hood',
    title: 'Kitchen Hood',
    subtitle: 'Deep Cleaning',
    slug: 'kitchen-hood-repair-dhaka',
    image: 'https://ik.imagekit.io/v4mlqlybs/Image/Kitchen%20hood.png?updatedAt=1771331342113',
    alt: 'Kitchen hood repair and cleaning service in Dhaka'
  }
];

export const services: ServiceItem[] = [
  { id: 'ac-checkup', slug: 'ac-basic-servicing', title: 'AC Basic Servicing (1-1.5 Ton)', price: 399, type: 'service', category: 'ac', description: 'Basic cleaning and health checkup.' },
  { id: 'ac-jet', slug: 'ac-jet-wash', title: 'AC Jet Wash (1-1.5 Ton)', price: 950, type: 'service', category: 'ac', popular: true, description: 'Deep cleaning with high pressure jet.' },
  { id: 'ac-master', slug: 'ac-master-wash', title: 'AC Master Wash (1-1.5 Ton)', price: 1600, type: 'service', category: 'ac', description: 'Complete dismantling and cleaning of indoor/outdoor units.' },
  { id: 'ac-water', slug: 'ac-water-drop-solution', title: 'Water Drop Solution (1-1.5 Ton)', price: 900, type: 'repair', category: 'ac', description: 'Fixing water leakage from indoor unit.' },
  { id: 'ac-hanging', slug: 'ac-hanging-charge', title: 'Hanging Charge', price: 300, type: 'service', category: 'ac', description: 'Up to 8th floor.' },
  { id: 'ac-shifting', slug: 'ac-shifting', title: 'AC Shifting (1-1.5 Ton)', price: 4000, type: 'service', category: 'ac', description: 'Professional shifting: dismantle and installation.' },
  { id: 'ac-install', slug: 'ac-installation', title: 'AC Installation (1-1.5 Ton)', price: 2200, type: 'service', category: 'ac', description: 'Installation of Split AC unit.' },
  { id: 'ac-uninstall', slug: 'ac-uninstallation', title: 'AC Uninstallation (1-1.5 Ton)', price: 1800, type: 'service', category: 'ac', description: 'Safe removal of AC unit.' },
  { id: 'ac-nitrogen', slug: 'ac-nitrogen-wash', title: 'Nitrogen Wash (1-1.5 Ton)', price: 1200, type: 'service', category: 'ac', description: 'Condenser coil cleaning with nitrogen.' },
  { id: 'ac-leak', slug: 'ac-leak-repair', title: 'Leak Repair (1-1.5 Ton)', price: 1900, type: 'repair', category: 'ac', description: 'Welding and fixing leakage in pipes.' },
  { id: 'ac-circuit', slug: 'ac-circuit-repair', title: 'Circuit Repair (1-1.5 Ton)', price: 3500, type: 'repair', category: 'ac', description: 'PCB board repair. Final price may vary by fault.' },
  { id: 'ac-cap', slug: 'ac-capacitor-replacement', title: 'Capacitor Replacement (1-1.5 Ton)', price: 750, type: 'repair', category: 'ac', description: 'Replacing faulty capacitor.' },
  { id: 'ac-r410-half', slug: 'ac-r410-gas-half', title: 'R410 Gas Half (1-1.5 Ton)', price: 1700, type: 'repair', category: 'ac', description: 'Top-up R410 refrigerant.' },
  { id: 'ac-gas-r410', slug: 'ac-r410-gas-refill', title: 'R410 Gas Full (1-1.5 Ton)', price: 3500, type: 'repair', category: 'ac', description: 'Full charge R410 refrigerant.' },
  { id: 'ac-r22-half', slug: 'ac-r22-gas-half', title: 'R22 Gas Half (1-1.5 Ton)', price: 2400, type: 'repair', category: 'ac', description: 'Top-up R22 refrigerant.' },
  { id: 'ac-r22-full', slug: 'ac-r22-gas-full', title: 'R22 Gas Full (1-1.5 Ton)', price: 5000, type: 'repair', category: 'ac', description: 'Full charge R22 refrigerant.' },
  { id: 'ac-r32-half', slug: 'ac-r32-gas-half', title: 'R32 Gas Half (1-1.5 Ton)', price: 1800, type: 'repair', category: 'ac', description: 'Top-up R32 refrigerant.' },
  { id: 'ac-r32-full', slug: 'ac-r32-gas-full', title: 'R32 Gas Full (1-1.5 Ton)', price: 3200, type: 'repair', category: 'ac', description: 'Full charge R32 refrigerant.' },
  { id: 'fridge-checkup', slug: 'fridge-checkup', title: 'Fridge Checkup', price: 350, type: 'service', category: 'fridge', description: 'Diagnosis of refrigerator problems.' },
  { id: 'fridge-master', slug: 'fridge-master-servicing', title: 'Master Servicing', price: 1500, type: 'service', category: 'fridge', description: 'Deep cleaning and maintenance.' },
  { id: 'fridge-water', slug: 'fridge-water-lining', title: 'Water Lining', price: 1100, type: 'repair', category: 'fridge', description: 'Clearing blocked water drain lines.' },
  { id: 'fridge-thermostat', slug: 'fridge-thermostat-change', title: 'Thermostat Change', price: 1700, type: 'repair', category: 'fridge', description: 'Replacing faulty thermostat.' },
  { id: 'fridge-gasket', slug: 'fridge-gasket-change', title: 'Gasket Change', price: 3500, type: 'repair', category: 'fridge', description: 'Door rubber replacement. Final price may vary by model.' },
  { id: 'fridge-gas', slug: 'fridge-gas-charge', title: 'Gas Charge', price: 1800, type: 'repair', category: 'fridge', description: 'Refrigerant refill. Final price depends on model and issue.' },
  { id: 'fridge-circuit', slug: 'fridge-circuit-repair', title: 'Circuit Repair', price: 4000, type: 'repair', category: 'fridge', description: 'PCB/kit repair. Final price may vary by fault.' },
  { id: 'wm-checkup', slug: 'washing-machine-checkup', title: 'Washing Machine Checkup', price: 450, type: 'service', category: 'washing', description: 'Diagnosis of washing machine issues.' },
  { id: 'wm-service', slug: 'washing-machine-servicing', title: 'Washing Machine Servicing', price: 1200, type: 'service', category: 'washing', description: 'Complete cleaning and servicing.' },
  { id: 'mw-checkup', slug: 'microwave-checkup', title: 'Microwave Checkup', price: 350, type: 'service', category: 'microwave', description: 'Diagnosis of microwave problems.' },
  { id: 'mw-service', slug: 'microwave-servicing', title: 'Microwave Servicing', price: 500, type: 'service', category: 'microwave', description: 'General cleaning and servicing.' },
  { id: 'mw-circuit', slug: 'microwave-circuit-repair', title: 'Circuit Repair', price: 3000, type: 'repair', category: 'microwave', description: 'Main board repair.' },
  { id: 'mw-magnetron', slug: 'microwave-magnetron-replacement', title: 'Magnetron Replace', price: 7000, type: 'repair', category: 'microwave', description: 'Replacing the heating element.' },
  { id: 'hood-checkup', slug: 'kitchen-hood-checkup', title: 'Kitchen Hood Checkup', price: 350, type: 'service', category: 'hood', description: 'Diagnosis of kitchen hood issues.' },
  { id: 'hood-service', slug: 'kitchen-hood-servicing', title: 'Kitchen Hood Servicing', price: 1000, type: 'service', category: 'hood', description: 'General cleaning.' },
  { id: 'hood-master', slug: 'kitchen-hood-master-servicing', title: 'Master Servicing', price: 1500, type: 'service', category: 'hood', description: 'Deep cleaning of filters and motor.' },
  { id: 'geyser-checkup', slug: 'geyser-checkup', title: 'Geyser Checkup', price: 350, type: 'service', category: 'geyser', description: 'Diagnosis of water heater.' },
  { id: 'geyser-master', slug: 'geyser-master-servicing', title: 'Master Servicing', price: 1300, type: 'service', category: 'geyser', description: 'Descaling and cleaning.' },
  { id: 'geyser-install', slug: 'geyser-installation', title: 'Geyser Installation', price: 950, type: 'service', category: 'geyser', description: 'Wall mounting and connection.' },
  { id: 'geyser-uninstall', slug: 'geyser-uninstallation', title: 'Geyser Uninstallation', price: 650, type: 'service', category: 'geyser', description: 'Safe removal.' },
  { id: 'geyser-shifting', slug: 'geyser-shifting', title: 'Geyser Shifting', price: 1500, type: 'service', category: 'geyser', description: 'Remove and install at new location.' }
];

export const getServicesByCategory = (category: ServiceCategory) =>
  services.filter((service) => service.category === category);
