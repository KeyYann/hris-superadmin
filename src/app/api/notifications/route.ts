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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch notifications for the user
    let notificationsQuery = supabaseAdmin
      .from('notifications')
      .select(`
        *,
        time_off_requests (
          user_id,
          users (
            department_id
          )
        )
      `)
      .eq('user_id', userId);

    const { data: notifications, error } = await notificationsQuery
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter by department for regular admins (not Super Admin)
    let filteredNotifications = notifications || [];
    if (userRole !== 'Super Admin' && departmentId) {
      filteredNotifications = notifications?.filter(notif => {
        // If notification has a related time_off_request, check department
        if (notif.time_off_requests) {
          const requestUser = (notif.time_off_requests as any)?.users;
          return requestUser?.department_id === departmentId;
        }
        // Keep notifications without time_off_request relation
        return true;
      }) || [];
    }

    // Format notifications
    const formattedNotifications = filteredNotifications.map(notif => ({
      id: notif.id,
      type: notif.notification_type,
      message: notif.message,
      isRead: notif.is_read,
      timestamp: notif.created_at,
      time: getTimeAgo(notif.created_at)
    })) || [];

    // Count unread
    const unreadCount = formattedNotifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
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
