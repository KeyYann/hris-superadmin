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

// GET - Fetch eligible employees (non-admin users) and admin roles
export async function GET() {
  try {
    // Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
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
      .order('name', { ascending: true });

    if (usersError) throw usersError;

    // Fetch all admin roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('id, name, description')
      .ilike('name', '%Admin%')
      .order('name', { ascending: true });

    if (rolesError) throw rolesError;

    // Filter eligible employees (non-admin users)
    const eligibleEmployees = users?.filter(
      user => !user.roles?.name?.includes('Admin')
    ).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.roles?.name
    })) || [];

    return NextResponse.json({
      employees: eligibleEmployees,
      adminRoles: roles || []
    });

  } catch (error: any) {
    console.error('Error fetching eligible data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error?.message },
      { status: 500 }
    );
  }
}
