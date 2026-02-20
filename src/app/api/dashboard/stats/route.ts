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

    // Get all users count (filter by department for regular admins)
    let usersQuery = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userRole !== 'Super Admin' && departmentId) {
      usersQuery = usersQuery.eq('department_id', departmentId);
    }

    const { count: totalUsers, error: usersError } = await usersQuery;

    if (usersError) throw usersError;

    // Get all time off requests for filtering
    const { data: allTimeOffRequests, error: allRequestsError } = await supabaseAdmin
      .from('time_off_requests')
      .select(`
        id,
        status,
        submitted_at,
        user_id,
        users (
          department_id
        )
      `);

    if (allRequestsError) throw allRequestsError;

    // Filter by department for regular admins
    const filterByDepartment = (requests: any[]) => {
      if (!requests) return [];
      if (userRole === 'Super Admin' || !departmentId) return requests;
      return requests.filter(req => (req.users as any)?.department_id === departmentId);
    };

    const filteredRequests = filterByDepartment(allTimeOffRequests || []);

    // Get approved time offs count
    const approvedTimeOffs = filteredRequests.filter(req => req.status === 'Approved').length;

    // Get pending leaves count
    const pendingLeaves = filteredRequests.filter(req => req.status === 'Pending').length;

    // Get recent notifications (last 3 time off requests, filtered by department)
    const recentRequests = filteredRequests
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, 3);

    // Fetch full details for recent requests
    const recentRequestIds = recentRequests.map(r => r.id);
    const { data: recentRequestsDetails, error: notifError } = await supabaseAdmin
      .from('time_off_requests')
      .select(`
        id,
        leave_type,
        submitted_at,
        users (
          name,
          avatar,
          roles (name)
        )
      `)
      .in('id', recentRequestIds.length > 0 ? recentRequestIds : ['']);

    if (notifError) throw notifError;

    // Format notifications
    const notifications = recentRequestsDetails?.map((req, index) => ({
      id: req.id,
      type: 'leave',
      user: req.users?.name || 'Unknown',
      action: 'submitted a',
      target: req.leave_type,
      time: getTimeAgo(req.submitted_at),
      timestamp: req.submitted_at,
      isRead: false,
      avatarColor: getAvatarColor(index),
      initials: req.users?.avatar || 'UK'
    })) || [];

    // Get monthly leave applications for the current year (filtered by department)
    const currentYear = new Date().getFullYear();
    const yearFilteredRequests = filteredRequests.filter(req => {
      const reqYear = new Date(req.submitted_at).getFullYear();
      return reqYear === currentYear;
    });

    // Group by month
    const monthlyData = Array(12).fill(0);
    yearFilteredRequests.forEach(req => {
      const month = new Date(req.submitted_at).getMonth();
      monthlyData[month]++;
    });

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      approvedTimeOffs: approvedTimeOffs || 0,
      pendingLeaves: pendingLeaves || 0,
      notifications,
      monthlyApplications: monthlyData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getAvatarColor(index: number): string {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-orange-100 text-orange-600'
  ];
  return colors[index % colors.length];
}
