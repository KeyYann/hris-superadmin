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

// GET - Fetch all users (including admins)
export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar,
        employment_status,
        status,
        roles (name),
        departments (name),
        companies (name, domain)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Include ALL users (employees and admins)
    const allUsers = users?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: (user.roles as any)?.name || 'Employee',
      department: (user.departments as any)?.name || 'General',
      employmentStatus: user.employment_status,
      status: user.status,
      company: (user.companies as any)?.name || 'ABBE'
    })) || [];

    return NextResponse.json({ users: allUsers });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { name, email, department, employmentStatus } = await request.json();

    console.log('Creating user:', { name, email, department, employmentStatus });

    if (!name || !email || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get company from email domain
    const emailDomain = email.split('@')[1]?.toLowerCase();
    let companyId;
    
    if (emailDomain?.includes('abbeconsult')) {
      const { data, error: companyError } = await supabaseAdmin.from('companies').select('id').eq('domain', 'abbeconsult.com').single();
      if (companyError) console.error('Company lookup error:', companyError);
      companyId = data?.id;
    } else if (emailDomain?.includes('bequik')) {
      const { data, error: companyError } = await supabaseAdmin.from('companies').select('id').eq('domain', 'bequik.com').single();
      if (companyError) console.error('Company lookup error:', companyError);
      companyId = data?.id;
    } else {
      const { data, error: companyError } = await supabaseAdmin.from('companies').select('id').eq('domain', 'abbe.com').single();
      if (companyError) console.error('Company lookup error:', companyError);
      companyId = data?.id;
    }

    console.log('Company ID:', companyId);

    // Get department ID
    const { data: deptData, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('id')
      .eq('name', department)
      .single();

    if (deptError) {
      console.error('Department lookup error:', deptError);
      return NextResponse.json(
        { error: `Department not found: ${department}` },
        { status: 400 }
      );
    }

    console.log('Department ID:', deptData?.id);

    // Regular employees don't have roles - only admins do
    // So we set role_id to NULL for regular employees
    const roleId = null;

    console.log('Role ID for regular employee:', roleId);

    // Generate avatar from name
    const nameParts = name.split(' ');
    const avatar = nameParts.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    console.log('Avatar:', avatar);

    // Step 1: Create user in Supabase Auth first
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'; // Generate random password
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        avatar
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log('Auth user created:', authUser.user.id);

    // Step 2: Insert user into users table with the auth user ID
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id, // Use the auth user ID
        name,
        email,
        avatar,
        role_id: roleId, // NULL for regular employees
        department_id: deptData?.id,
        company_id: companyId,
        employment_status: employmentStatus || 'Regular Employee',
        status: 'Active'
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      // If users table insert fails, delete the auth user to keep things clean
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

    console.log('User created successfully:', newUser);

    return NextResponse.json({ success: true, user: newUser });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
