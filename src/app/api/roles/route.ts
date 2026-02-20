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

// GET - Fetch all roles
export async function GET() {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from('roles')
      .select('id, name, description')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ roles: roles || [] });

  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles', details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Create new role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const { data: existingRole } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', name)
      .single();

    if (existingRole) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 400 }
      );
    }

    // Create new role
    const { data: newRole, error } = await supabaseAdmin
      .from('roles')
      .insert({
        name,
        description: description || ''
      })
      .select('id, name, description')
      .single();

    if (error) throw error;

    return NextResponse.json({ role: newRole });

  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role', details: error?.message },
      { status: 500 }
    );
  }
}
