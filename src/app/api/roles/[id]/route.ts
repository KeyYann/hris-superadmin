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

// PUT - Update role
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description } = body;
    const roleId = params.id;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if another role with this name exists
    const { data: existingRole } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', name)
      .neq('id', roleId)
      .single();

    if (existingRole) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 400 }
      );
    }

    // Update role
    const { data: updatedRole, error } = await supabaseAdmin
      .from('roles')
      .update({
        name,
        description: description || ''
      })
      .eq('id', roleId)
      .select('id, name, description')
      .single();

    if (error) throw error;

    return NextResponse.json({ role: updatedRole });

  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete role
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = params.id;

    // Check if any users are assigned to this role
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', roleId);

    if (countError) throw countError;

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete role. ${count} user(s) are currently assigned to this role.` },
        { status: 400 }
      );
    }

    // Delete role
    const { error } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Role deleted successfully',
      id: roleId 
    });

  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role', details: error?.message },
      { status: 500 }
    );
  }
}
