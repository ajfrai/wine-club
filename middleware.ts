import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Only check auth for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check for dual-role status by querying both hosts and members tables
    const [{ data: hostProfile }, { data: memberProfile }, { data: userData }] = await Promise.all([
      supabase.from('hosts').select('id').eq('user_id', user.id).single(),
      supabase.from('members').select('id').eq('user_id', user.id).single(),
      supabase.from('users').select('role').eq('id', user.id).single(),
    ]);

    const hasHostProfile = !!hostProfile;
    const hasMemberProfile = !!memberProfile;
    const isDualRole = hasHostProfile && hasMemberProfile;

    // Dual-role users can access both dashboards - skip redirects
    if (isDualRole) {
      return response;
    }

    // Single-role users: redirect if accessing wrong dashboard
    if (userData) {
      // If host (without member profile) trying to access member dashboard
      if (userData.role === 'host' && request.nextUrl.pathname.startsWith('/dashboard/member')) {
        return NextResponse.redirect(new URL('/dashboard/host', request.url));
      }
      // If member (without host profile) trying to access host dashboard
      if (userData.role === 'member' && request.nextUrl.pathname.startsWith('/dashboard/host')) {
        return NextResponse.redirect(new URL('/dashboard/member', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match only dashboard routes
     */
    '/dashboard/:path*',
  ],
};
