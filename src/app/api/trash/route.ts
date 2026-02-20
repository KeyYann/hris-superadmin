import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// GET - Fetch all trash items
export async function GET() {
  try {
    const { data: trashItems, error } = await supabaseAdmin
      .from('trash')
      .select('*')
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    const formattedTrash = trashItems?.map(item => ({
      trashId: item.id,
      type: item.item_type,
      data: item.item_data,
      deletedAt: new Date(item.deleted_at).toLocaleDateString(),
      deletedBy: item.deleted_by
    })) || [];

    return NextResponse.json({ trash: formattedTrash });

  } catch (error: any) {
    console.error('Error fetching trash:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch trash' },
      { status: 500 }
    );
  }
}

// POST - Restore item from trash
export async function POST(request: NextRequest) {
  try {
    const { trashId } = await request.json();

    if (!trashId) {
      return NextResponse.json(
        { error: 'Trash ID is required' },
        { status: 400 }
      );
    }

    // Get the trash item
    const { data: trashItem, error: fetchError } = await supabaseAdmin
      .from('trash')
      .select('*')
      .eq('id', trashId)
      .single();

    if (fetchError) throw fetchError;
    if (!trashItem) {
      return NextResponse.json(
        { error: 'Trash item not found' },
        { status: 404 }
      );
    }

    // Restore based on item type
    const itemType = trashItem.item_type;
    const itemData = trashItem.item_data;

    let restoreError = null;

    switch (itemType) {
      case 'User':
        // Restore user by removing deleted_at timestamp
        const { error: userError } = await supabaseAdmin
          .from('users')
          .update({ deleted_at: null })
          .eq('id', itemData.id);
        restoreError = userError;
        break;

      case 'Department':
        // Re-insert department
        const { error: deptError } = await supabaseAdmin
          .from('departments')
          .insert({
            id: itemData.id,
            name: itemData.name,
            description: itemData.description
          });
        restoreError = deptError;
        break;

      case 'Role':
        // Re-insert role
        const { error: roleError } = await supabaseAdmin
          .from('roles')
          .insert({
            id: itemData.id,
            name: itemData.name,
            description: itemData.description
          });
        restoreError = roleError;
        break;

      case 'Request':
        // Re-insert time off request
        const { error: requestError } = await supabaseAdmin
          .from('time_off_requests')
          .insert({
            id: itemData.id,
            user_id: itemData.userId,
            leave_type: itemData.type,
            leave_date: itemData.leaveDate,
            end_date: itemData.endDate,
            duration: itemData.duration,
            is_half_day: itemData.isHalfDay,
            half_day_period: itemData.halfDayPeriod,
            status: itemData.status,
            message: itemData.message,
            submitted_at: itemData.submitted
          });
        restoreError = requestError;
        break;

      case 'Event':
        // Re-insert event
        const { error: eventError } = await supabaseAdmin
          .from('events')
          .insert({
            id: itemData.id,
            title: itemData.title,
            date: itemData.date,
            type: itemData.type,
            description: itemData.description
          });
        restoreError = eventError;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown item type: ${itemType}` },
          { status: 400 }
        );
    }

    if (restoreError) throw restoreError;

    // Delete from trash after successful restore
    const { error: deleteError } = await supabaseAdmin
      .from('trash')
      .delete()
      .eq('id', trashId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error restoring item:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to restore item' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete item from trash
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trashId = searchParams.get('id');

    if (!trashId) {
      return NextResponse.json(
        { error: 'Trash ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('trash')
      .delete()
      .eq('id', trashId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting trash item:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}
