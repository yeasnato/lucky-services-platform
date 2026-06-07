export const business = {
  name: 'Lucky Services Centre',
  legalName: 'Lucky Services Centre',
  phoneDisplay: '01605564270',
  phoneInternational: '+8801605564270',
  whatsappNumber: process.env.WHATSAPP_BOOKING_NUMBER || '8801605564270',
  email: 'support@luckyservicescentre.com',
  website: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.luckyservicescentre.com',
  address: {
    street: '56, Arzotpara, Mohakhali, Tejgaon',
    city: 'Dhaka',
    postalCode: '1215',
    country: 'Bangladesh',
    full: '56, Arzotpara, Mohakhali, Tejgaon, Dhaka 1215, Bangladesh'
  },
  hours: {
    display: '9:00 AM - 10:00 PM',
    schemaOpen: '09:00',
    schemaClose: '22:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  trust: {
    families: '1000+',
    warranty: '45 Days',
    responseWindow: '2-4 hour arrival window'
  },
  serviceAreas: [
    'Mirpur',
    'Uttara',
    'Dhanmondi',
    'Gulshan',
    'Banani',
    'Mohakhali',
    'Tejgaon',
    'Mohammadpur',
    'Bashundhara',
    'Badda',
    'Rampura',
    'Shyamoli',
    'Farmgate',
    'Dhaka'
  ]
} as const;
