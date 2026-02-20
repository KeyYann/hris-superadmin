import { NextResponse } from 'next/server';
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

export async function GET(request: Request) {
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
        leave_type,
        leave_date,
        end_date,
        duration,
        is_half_day,
        half_day_period,
        status,
        message,
        submitted_at,
        updated_at,
        user_id,
        users (
          name,
          avatar,
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
      user: (req.users as any)?.name || 'Unknown',
      avatar: (req.users as any)?.avatar || 'UK',
      role: (req.users as any)?.roles?.name || 'Employee',
      submitted: new Date(req.submitted_at).toISOString().split('T')[0],
      leaveDate: req.leave_date,
      endDate: req.end_date,
      type: req.leave_type,
      status: req.status,
      duration: `${req.duration} ${req.duration === 1 ? 'Day' : 'Days'}`,
      isHalfDay: req.is_half_day,
      halfDayPeriod: req.half_day_period,
      message: req.message,
      updatedAt: req.updated_at
    }));

    return NextResponse.json({
      requests: formattedRequests
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
