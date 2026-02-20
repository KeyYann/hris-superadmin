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

// GET - Fetch all time-off requests (all types)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const departmentId = searchParams.get('departmentId');

    // Fetch all time off requests with user details
    const { data: timeOffRequests, error } = await supabaseAdmin
      .from('time_off_requests')
      .select(`
        id,
        request_number,
        leave_type,
        leave_date,
        end_date,
        duration,
        is_half_day,
        half_day_period,
        status,
        message,
        submitted_at,
        user_id,
        users (
          name,
          avatar,
          email,
          department_id,
          roles (name)
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    // Filter by department for regular admins (not Super Admin)
    let filteredRequests = timeOffRequests || [];
    if (userRole !== 'Super Admin' && departmentId) {
      filteredRequests = timeOffRequests?.filter(req => 
        (req.users as any)?.department_id === departmentId
      ) || [];
    }

    // Format the data
    const formattedRequests = filteredRequests.map(req => ({
      id: req.id,
      requestNumber: req.request_number || 'N/A',
      user: (req.users as any)?.name || 'Unknown',
      avatar: (req.users as any)?.avatar || 'UK',
      email: (req.users as any)?.email || '',
      role: (req.users as any)?.roles?.name || 'Employee',
      submitted: new Date(req.submitted_at).toISOString().split('T')[0],
      leaveDate: req.leave_date,
      endDate: req.end_date,
      type: req.leave_type,
      status: req.status,
      duration: req.duration,
      isHalfDay: req.is_half_day,
      halfDayPeriod: req.half_day_period,
      message: req.message
    }));

    return NextResponse.json({ requests: formattedRequests });

  } catch (error) {
    console.error('Error fetching time-off requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time-off requests', requests: [] },
      { status: 500 }
    );
  }
}

// DELETE - Delete time-off request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('time_off_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting time-off request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}

// PUT - Update time-off request status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['Approved', 'Declined', 'Pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (Approved, Declined, or Pending)' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('time_off_requests')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error updating time-off request:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}
