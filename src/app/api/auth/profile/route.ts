import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'No active login session found.' }, { status: 401 });
  }

  try {
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('id, full_name, phone, role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: `No staff profile found for this login. User ID: ${user.id}. Add this user to public.profiles as admin or technician.`
        },
        { status: 404 }
      );
    }

    if (profile.status !== 'active') {
      return NextResponse.json({ error: 'Your staff profile is not active. Please contact admin.' }, { status: 403 });
    }

    return NextResponse.json({ profile });
  } catch {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Staff profile could not be resolved. Check SUPABASE_SERVICE_ROLE_KEY in Vercel.' },
        { status: 500 }
      );
    }

    if (profile.status !== 'active') {
      return NextResponse.json({ error: 'Your staff profile is not active. Please contact admin.' }, { status: 403 });
    }

    return NextResponse.json({ profile });
  }
}
