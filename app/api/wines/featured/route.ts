import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch featured wines
    const { data: wines, error } = await supabase
      .from('wines')
      .select('*')
      .eq('is_featured', true)
      .order('featured_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured wines:', error);
      return NextResponse.json(
        { error: 'Failed to fetch featured wines' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wines: wines || [] });
  } catch (error) {
    console.error('Featured wines fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
