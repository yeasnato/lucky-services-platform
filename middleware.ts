import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = ['/admin', '/technician'];
const publicDashboardAuthPaths = ['/admin/login', '/technician/login'];

export async function middleware(request: NextRequest) {
  if (publicDashboardAuthPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const needsAuth = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!needsAuth || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.startsWith('/technician') ? '/technician/login' : '/admin/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', user.id).single();
  const path = request.nextUrl.pathname;

  if (!profile || profile.status !== 'active') {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.startsWith('/technician') ? '/technician/login' : '/admin/login';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  if (path.startsWith('/admin') && profile.role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = profile.role === 'technician' ? '/technician/dashboard' : '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (path.startsWith('/technician') && profile.role !== 'technician' && profile.role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/technician/:path*']
};
