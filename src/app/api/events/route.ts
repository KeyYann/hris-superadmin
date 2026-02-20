import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET - Fetch all calendar events
export async function GET() {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;

    // Format events for frontend
    const formattedEvents = events?.map(event => ({
      id: event.id,
      title: event.title,
      date: event.event_date,
      type: event.event_type || 'event',
      description: event.description || ''
    })) || [];

    return NextResponse.json({ events: formattedEvents });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const { title, date, description, type } = await request.json();

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .insert({
        title,
        event_date: date,
        event_type: type || 'event',
        description: description || ''
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, event: data });

  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
