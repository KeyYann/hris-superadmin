import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
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
    const { data: timeOffRequests, error: timeOffError } = await supabaseAdmin
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
        user_id,
        users (
          name,
          avatar,
          department_id,
          roles (name)
        )
      `)
      .order('submitted_at', { ascending: false });

    if (timeOffError) {
      console.error('Time off requests error:', timeOffError);
    }

    // Fetch overtime requests (gracefully handle if table doesn't exist)
    const { data: overtimeRequests, error: overtimeError } = await supabaseAdmin
      .from('overtime_requests')
      .select(`
        id,
        overtime_date,
        start_time,
        end_time,
        hours,
        approval_type,
        reason,
        status,
        submitted_at,
        user_id,
        users (
          name,
          avatar,
          department_id,
          roles (name)
        )
      `)
      .order('submitted_at', { ascending: false });

    if (overtimeError) {
      console.error('Overtime requests error:', overtimeError);
    }

    // Fetch official business requests (gracefully handle if table doesn't exist)
    const { data: officialBusinessRequests, error: obError } = await supabaseAdmin
      .from('official_business_requests')
      .select(`
        id,
        start_date,
        end_date,
        destination,
        purpose,
        status,
        submitted_at,
        user_id,
        users (
          name,
          avatar,
          department_id,
          roles (name)
        )
      `)
      .order('submitted_at', { ascending: false });

    if (obError) {
      console.error('Official business requests error:', obError);
    }

    // Fetch offset requests (gracefully handle if table doesn't exist)
    const { data: offsetRequests, error: offsetError } = await supabaseAdmin
      .from('offset_requests')
      .select(`
        id,
        excess_hours,
        applied_leave_date,
        applied_leave_hours,
        justification,
        status,
        submitted_at,
        user_id,
        users (
          name,
          avatar,
          department_id,
          roles (name)
        )
      `)
      .order('submitted_at', { ascending: false });

    if (offsetError) {
      console.error('Offset requests error:', offsetError);
    }

    // Filter by department for regular admins (not Super Admin)
    const filterByDepartment = (requests: any[]) => {
      if (!requests) return [];
      if (userRole === 'Super Admin' || !departmentId) return requests;
      return requests.filter(req => {
        const user = Array.isArray(req.users) ? req.users[0] : req.users;
        return user?.department_id === departmentId;
      });
    };

    const filteredTimeOff = filterByDepartment(timeOffRequests || []);
    const filteredOvertime = filterByDepartment(overtimeRequests || []);
    const filteredOfficialBusiness = filterByDepartment(officialBusinessRequests || []);
    const filteredOffset = filterByDepartment(offsetRequests || []);

    // Format the data to match frontend expectations
    const formattedTimeOff = filteredTimeOff.map(req => {
      const user = Array.isArray(req.users) ? req.users[0] : req.users;
      const role = user?.roles ? (Array.isArray(user.roles) ? user.roles[0] : user.roles) : null;
      
      return {
        id: req.id,
        user: user?.name || 'Unknown',
        avatar: user?.avatar || 'UK',
        role: role?.name || 'Employee',
        submitted: new Date(req.submitted_at).toISOString().split('T')[0],
        leaveDate: req.leave_date,
        endDate: req.end_date,
        type: req.leave_type,
        status: req.status,
        duration: `${req.duration} ${req.duration === 1 ? 'Day' : 'Days'}`,
        isHalfDay: req.is_half_day,
        halfDayPeriod: req.half_day_period,
        message: req.message,
        category: 'leave'
      };
    });

    const formattedOvertime = filteredOvertime.map(req => {
      const user = Array.isArray(req.users) ? req.users[0] : req.users;
      const role = user?.roles ? (Array.isArray(user.roles) ? user.roles[0] : user.roles) : null;
      
      return {
        id: req.id,
        user: user?.name || 'Unknown',
        avatar: user?.avatar || 'UK',
        role: role?.name || 'Employee',
        submitted: new Date(req.submitted_at).toISOString().split('T')[0],
        date: req.overtime_date,
        startTime: req.start_time,
        endTime: req.end_time,
        hours: req.hours.toString(),
        approvalType: req.approval_type,
        reason: req.reason,
        status: req.status,
        category: 'overtime'
      };
    });

    const formattedOfficialBusiness = filteredOfficialBusiness.map(req => {
      const user = Array.isArray(req.users) ? req.users[0] : req.users;
      const role = user?.roles ? (Array.isArray(user.roles) ? user.roles[0] : user.roles) : null;
      
      return {
        id: req.id,
        user: user?.name || 'Unknown',
        avatar: user?.avatar || 'UK',
        role: role?.name || 'Employee',
        submitted: new Date(req.submitted_at).toISOString().split('T')[0],
        startDate: req.start_date,
        endDate: req.end_date,
        destination: req.destination,
        purpose: req.purpose,
        status: req.status,
        category: 'official-business'
      };
    });

    const formattedOffset = filteredOffset.map(req => {
      const user = Array.isArray(req.users) ? req.users[0] : req.users;
      const role = user?.roles ? (Array.isArray(user.roles) ? user.roles[0] : user.roles) : null;
      
      return {
        id: req.id,
        user: user?.name || 'Unknown',
        avatar: user?.avatar || 'UK',
        role: role?.name || 'Employee',
        submitted: new Date(req.submitted_at).toISOString().split('T')[0],
        excessHours: req.excess_hours.toString(),
        appliedLeaveDate: req.applied_leave_date,
        appliedLeaveHours: req.applied_leave_hours.toString(),
        justification: req.justification,
        status: req.status,
        category: 'offset'
      };
    });

    return NextResponse.json({
      timeOff: formattedTimeOff,
      overtime: formattedOvertime,
      officialBusiness: formattedOfficialBusiness,
      offset: formattedOffset
    });

  } catch (error: any) {
    console.error('Error fetching approvals:', error);
    console.error('Error details:', error?.message, error?.code);
    return NextResponse.json(
      { 
        error: 'Failed to fetch approvals',
        details: error?.message || 'Unknown error',
        timeOff: [],
        overtime: [],
        officialBusiness: [],
        offset: []
      },
      { status: 500 }
    );
  }
}
