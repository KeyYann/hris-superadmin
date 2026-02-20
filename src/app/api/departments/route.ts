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

// GET - Fetch all departments with member counts
export async function GET() {
  try {
    // First get all departments
    const { data: departments, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('id, name, status, description')
      .order('name', { ascending: true });

    if (deptError) throw deptError;

    // Get role IDs for Admin and Super Admin (fetch once)
    const { data: adminRoles } = await supabaseAdmin
      .from('roles')
      .select('id')
      .in('name', ['Admin', 'Super Admin']);

    const adminRoleIds = adminRoles?.map(r => r.id) || [];

    // Then get user counts for each department (excluding Admin and Super Admin)
    const departmentsWithCounts = await Promise.all(
      (departments || []).map(async (dept) => {
        let query = supabaseAdmin
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('department_id', dept.id);

        // Exclude admin roles if we have any
        if (adminRoleIds.length > 0) {
          query = query.not('role_id', 'in', `(${adminRoleIds.join(',')})`);
        }

        const { count, error: countError } = await query;

        if (countError) console.error('Error counting users:', countError);

        return {
          id: dept.id,
          name: dept.name,
          status: dept.status,
          description: dept.description || '',
          memberCount: count || 0
        };
      })
    );

    return NextResponse.json({ departments: departmentsWithCounts });

  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(request: NextRequest) {
  try {
    const { name, status, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('departments')
      .insert({
        name,
        status: status || 'Active',
        description: description || ''
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, department: data });

  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create department' },
      { status: 500 }
    );
  }
}
