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

// PUT - Update department
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { name, status, description } = await request.json();
    const { id: deptId } = await context.params;

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('departments')
      .update({
        name,
        status: status || 'Active',
        description: description || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', deptId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, department: data });

  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE - Delete department
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deptId } = await context.params;

    // Check if department has users
    const { data: users, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('department_id', deptId)
      .limit(1);

    if (checkError) throw checkError;

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with active members. Please reassign users first.' },
        { status: 400 }
      );
    }

    // Delete department
    const { error } = await supabaseAdmin
      .from('departments')
      .delete()
      .eq('id', deptId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete department' },
      { status: 500 }
    );
  }
}
