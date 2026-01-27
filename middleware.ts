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

    // Optional: Add role-based routing
    // Fetch user profile to check role and redirect if accessing wrong dashboard
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData) {
      // If host trying to access member dashboard, redirect to host dashboard
      if (userData.role === 'host' && request.nextUrl.pathname.startsWith('/dashboard/member')) {
        return NextResponse.redirect(new URL('/dashboard/host', request.url));
      }
      // If member trying to access host dashboard, redirect to member dashboard
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
