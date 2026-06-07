# Production Notes

## Decisions Made

These decisions were applied from the previous website and competitor research:

- Keep customers account-free to reduce booking friction.
- Use email/password login only for staff.
- Admin creates technician accounts and gives technicians their login credentials.
- Save every booking before opening WhatsApp.
- Use 45-day warranty messaging from the previous site because competitors usually show shorter/basic warranty promises.
- Keep longer support hours from the previous public header: `9:00 AM - 10:00 PM`.
- Use the public UI address from the previous site: `56, Arzotpara, Mohakhali, Tejgaon, Dhaka 1215, Bangladesh`.
- Preserve the previous visual identity instead of redesigning.

Competitor patterns considered:

- Sheba-style scheduled booking and formal order flow.
- UrbanQuick-style trust metrics, verified experts, warranty, and popular services.
- 1000FiX-style technician/service credibility, parts/warranty positioning, and operations seriousness.

## First Admin Setup

Supabase Auth users must exist before they can receive an admin profile.

1. In Supabase Dashboard, go to Authentication -> Users.
2. Create the first admin user with email/password.
3. Copy that user's UUID.
4. Run:

```sql
insert into public.profiles (id, full_name, phone, role, status)
values (
  'PASTE_AUTH_USER_UUID_HERE',
  'Admin Name',
  '01605564270',
  'admin',
  'active'
)
on conflict (id) do update set role = 'admin', status = 'active';
```

After that, the admin can sign in at `/login`, open `/admin/technicians`, and create technician accounts.

## Required Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://www.luckyservicescentre.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_META_PIXEL_ID=1878669712790622
NEXT_PUBLIC_GA_MEASUREMENT_ID=
WHATSAPP_BOOKING_NUMBER=8801605564270
```

## Production Checklist

- Run Supabase migration.
- Run seed SQL.
- Create first admin.
- Add Vercel environment variables.
- Deploy from GitHub to Vercel.
- Test public booking.
- Test WhatsApp opening.
- Test admin login.
- Test technician creation.
- Test technician login.
- Test booking confirm/assign/status update.
- Submit sitemap to Google Search Console.
- Make Google Business Profile NAP match website exactly.

## What To Adjust Later If Needed

- Address if the official Google Business Profile address is Mirpur instead of Mohakhali/Tejgaon.
- Working hours if the real support window is `9:00 AM - 6:00 PM`.
- Warranty duration if 45 days is too strong operationally.
- Technician skills/areas once the real technician roster is known.
