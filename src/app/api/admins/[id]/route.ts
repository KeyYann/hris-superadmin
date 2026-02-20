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

// PUT - Update admin role
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { roleId } = body;
    const { id: adminId } = await context.params;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Update user's role
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ role_id: roleId })
      .eq('id', adminId)
      .select(`
        id,
        name,
        email,
        avatar,
        roles (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    const role = Array.isArray(updatedUser.roles) ? updatedUser.roles[0] : updatedUser.roles;

    return NextResponse.json({
      admin: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: role?.name,
        roleId: role?.id
      }
    });

  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE - Demote admin (remove admin role, keep as regular employee)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: adminId } = await context.params;

    console.log('=== DEMOTE ADMIN START ===');
    console.log('Admin ID:', adminId);

    // Clean up any trash records that reference this admin as deleted_by
    console.log('Cleaning up trash records...');
    const { error: cleanupError } = await supabaseAdmin
      .from('trash')
      .delete()
      .eq('deleted_by', adminId);
    
    if (cleanupError) {
      console.error('Error cleaning up trash:', cleanupError);
    }

    // Remove admin role (set to NULL) - user keeps their department
    console.log('Removing admin role...');
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role_id: null })
      .eq('id', adminId);

    if (updateError) {
      console.error('Error removing admin role:', updateError);
      throw updateError;
    }

    console.log('=== DEMOTE ADMIN SUCCESS ===');
    return NextResponse.json({ 
      message: 'Admin demoted successfully',
      id: adminId 
    });

  } catch (error: any) {
    console.error('=== DEMOTE ADMIN ERROR ===');
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin', details: error?.message },
      { status: 500 }
    );
  }
}
