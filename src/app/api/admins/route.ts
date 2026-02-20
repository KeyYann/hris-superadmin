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

// GET - Fetch all admin users
export async function GET() {
  try {
    // Fetch all users with admin roles
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar,
        status,
        roles (
          id,
          name
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Filter admin users (roles that include 'Admin')
    const adminUsers = users?.filter(user => {
      const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
      return role?.name?.includes('Admin');
    }) || [];

    // Format the response
    const formattedAdmins = adminUsers.map(user => {
      const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: role?.name || 'Unknown',
        roleId: role?.id,
        status: user.status
      };
    });

    return NextResponse.json({ admins: formattedAdmins });

  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins', details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Create new admin (promote user to admin role + create auth account)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, roleId, password } = body;

    console.log('=== CREATE ADMIN REQUEST ===');
    console.log('User ID:', userId);
    console.log('Role ID:', roleId);
    console.log('Password provided:', !!password);

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'User ID and Role ID are required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required for new admin accounts' },
        { status: 400 }
      );
    }

    // Get user details
    console.log('Looking up user with ID:', userId);
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar')
      .eq('id', userId)
      .single();

    console.log('User lookup result:', user);
    console.log('User lookup error:', userError);

    if (userError || !user) {
      console.error('User lookup failed:', userError);
      return NextResponse.json(
        { error: 'User not found', details: `No user found with ID: ${userId}. The user may have been deleted or the ID is incorrect.` },
        { status: 404 }
      );
    }

    // Create Supabase Auth account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        avatar: user.avatar
      }
    });

    if (authError) {
      // If user already exists in auth, try to update their password
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('User already has auth account, updating password...');
        
        // First, try to get the auth user by email
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = authUsers.users.find(u => u.email === user.email);
        
        if (existingAuthUser) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingAuthUser.id,
            { password }
          );
          
          if (updateError) {
            console.error('Error updating password:', updateError);
            throw updateError;
          }
        } else {
          console.error('Auth user not found by email');
          throw new Error('Auth account exists but could not be found. Please contact support.');
        }
      } else {
        throw authError;
      }
    }

    // Update user's role to admin role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role_id: roleId })
      .eq('id', userId)
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

    if (updateError) throw updateError;

    const role = Array.isArray(updatedUser.roles) ? updatedUser.roles[0] : updatedUser.roles;

    return NextResponse.json({
      admin: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: role?.name,
        roleId: role?.id
      },
      message: 'Admin account created successfully. User can now log in.'
    });

  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin', details: error?.message },
      { status: 500 }
    );
  }
}
