import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const radiusParam = searchParams.get('radius');
    const isAllClubs = radiusParam === 'all';
    // Use a very large radius (40,000 miles, roughly Earth's diameter) to return all clubs
    const radius = isAllClubs ? 40000 : parseInt(radiusParam || '50', 10);

    // Get member's location
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('latitude, longitude')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member || !member.latitude || !member.longitude) {
      return NextResponse.json(
        { error: 'Member location not found. Please update your profile with your address.' },
        { status: 400 }
      );
    }

    // Call RPC function to get nearby clubs
    const { data: clubs, error } = await supabase
      .rpc('get_nearby_clubs', {
        member_lat: member.latitude,
        member_lon: member.longitude,
        radius_miles: radius,
      });

    if (error) {
      console.error('Error fetching nearby clubs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch nearby clubs' },
        { status: 500 }
      );
    }

    // Fetch wines for all clubs
    const clubsWithWines = await Promise.all(
      (clubs || []).map(async (club: any) => {
        const { data: wines, error: winesError } = await supabase
          .from('wines')
          .select('*')
          .eq('host_id', club.host_id)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);

        if (winesError) {
          console.error(`Error fetching wines for club ${club.host_id}:`, winesError);
        }

        // Find hero wine (most recently featured)
        const heroWine = wines?.find(w => w.is_featured) || null;

        // Get featured wines (excluding hero)
        const featuredWines = wines?.filter(w => w.is_featured && w.id !== heroWine?.id).slice(0, 3) || [];

        return {
          ...club,
          hero_wine: heroWine,
          featured_wines: featuredWines,
        };
      })
    );

    return NextResponse.json({ clubs: clubsWithWines });
  } catch (error) {
    console.error('Nearby clubs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
