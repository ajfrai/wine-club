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

    // Check for capability-based access by querying hosts and members tables
    // This replaces role-based checks - capabilities are determined by table presence
    const [{ data: hostProfile }, { data: memberProfile }] = await Promise.all([
      supabase.from('hosts').select('id').eq('user_id', user.id).single(),
      supabase.from('members').select('id').eq('user_id', user.id).single(),
    ]);

    const hasHostProfile = !!hostProfile;
    const hasMemberProfile = !!memberProfile;
    const isDualRole = hasHostProfile && hasMemberProfile;

    // Dual-role users can access both dashboards - skip redirects
    if (isDualRole) {
      return response;
    }

    // Capability-based routing: redirect if accessing dashboard they don't have access to
    // User with only host profile trying to access member dashboard
    if (hasHostProfile && !hasMemberProfile && request.nextUrl.pathname.startsWith('/dashboard/member')) {
      return NextResponse.redirect(new URL('/dashboard/host', request.url));
    }
    // User with only member profile trying to access host dashboard
    if (hasMemberProfile && !hasHostProfile && request.nextUrl.pathname.startsWith('/dashboard/host')) {
      return NextResponse.redirect(new URL('/dashboard/member', request.url));
    }
    // User with no profiles - redirect to signup (shouldn't happen, but handle gracefully)
    if (!hasHostProfile && !hasMemberProfile) {
      return NextResponse.redirect(new URL('/signup', request.url));
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
