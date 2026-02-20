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

// PUT - Update user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { name, email, department, employmentStatus } = await request.json();
    const { id: userId } = await context.params;

    // Get department ID
    const { data: deptData } = await supabaseAdmin
      .from('departments')
      .select('id')
      .eq('name', department)
      .single();

    // Generate new avatar if name changed
    const nameParts = name.split(' ');
    const avatar = nameParts.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    // Update user
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        name,
        email,
        avatar,
        department_id: deptData?.id,
        employment_status: employmentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (move to trash)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;

    console.log('=== DELETE USER START ===');
    console.log('Attempting to delete user:', userId);

    // Get user data before deleting
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'User not found', details: JSON.stringify(fetchError) },
        { status: 404 }
      );
    }

    console.log('User found:', userData.name);

    // Delete any existing trash records for this user first (to avoid foreign key constraint)
    console.log('Cleaning up old trash records...');
    const { error: cleanupError } = await supabaseAdmin
      .from('trash')
      .delete()
      .eq('deleted_by', userId);
    
    if (cleanupError) {
      console.error('Error cleaning up trash:', cleanupError);
    }

    if (userData) {
      // Add to trash (use NULL for deleted_by to avoid foreign key constraint)
      console.log('Adding to trash...');
      const { error: trashError } = await supabaseAdmin
        .from('trash')
        .insert({
          original_id: userId,
          item_type: 'User',
          item_data: userData,
          deleted_by: null // Use NULL to avoid foreign key constraint when deleting user
        });

      if (trashError) {
        console.error('Error adding to trash:', trashError);
        // Continue anyway - trash is not critical
      } else {
        console.log('Added to trash successfully');
      }
    }

    // Delete related records first (to avoid foreign key constraints)
    console.log('Deleting related records...');
    
    const { error: timeOffError } = await supabaseAdmin.from('time_off_requests').delete().eq('user_id', userId);
    if (timeOffError) console.error('Error deleting time_off_requests:', timeOffError);
    
    const { error: overtimeError } = await supabaseAdmin.from('overtime_requests').delete().eq('user_id', userId);
    if (overtimeError) console.error('Error deleting overtime_requests:', overtimeError);
    
    const { error: obError } = await supabaseAdmin.from('official_business_requests').delete().eq('user_id', userId);
    if (obError) console.error('Error deleting official_business_requests:', obError);
    
    const { error: offsetError } = await supabaseAdmin.from('offset_requests').delete().eq('user_id', userId);
    if (offsetError) console.error('Error deleting offset_requests:', offsetError);
    
    const { error: creditsError } = await supabaseAdmin.from('user_credits').delete().eq('user_id', userId);
    if (creditsError) console.error('Error deleting user_credits:', creditsError);

    console.log('Related records deleted');

    // Delete from users table
    console.log('Deleting from users table...');
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user from users table:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user from database', details: JSON.stringify(deleteError) },
        { status: 500 }
      );
    }

    console.log('Deleted from users table');

    // Delete from Supabase Auth
    console.log('Deleting from Supabase Auth...');
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Don't fail the request if auth delete fails - user is already deleted from database
      console.log('User deleted from database but auth deletion failed');
    } else {
      console.log('Deleted from Supabase Auth');
    }

    console.log('=== DELETE USER SUCCESS ===');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('=== DELETE USER ERROR ===');
    console.error('Error deleting user:', error);
    console.error('Error message:', error?.message);
    console.error('Error details:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
