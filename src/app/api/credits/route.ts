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

// GET - Fetch user credits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: credits, error } = await supabaseAdmin
      .from('user_leave_credits')
      .select(`
        id,
        entitled,
        balance,
        leave_types (
          id,
          name,
          is_unlimited,
          display_order
        )
      `)
      .eq('user_id', userId)
      .order('leave_types(display_order)');

    if (error) throw error;

    // Sort by display_order from the nested leave_types
    const sortedCredits = credits?.sort((a, b) => {
      const orderA = (a.leave_types as any)?.display_order || 999;
      const orderB = (b.leave_types as any)?.display_order || 999;
      return orderA - orderB;
    });

    const formattedCredits = sortedCredits?.map(credit => ({
      id: credit.id,
      type: (credit.leave_types as any)?.name || 'Unknown',
      leaveTypeId: (credit.leave_types as any)?.id,
      entitled: (credit.leave_types as any)?.is_unlimited || credit.entitled === -1 ? '∞' : credit.entitled,
      balance: (credit.leave_types as any)?.is_unlimited || credit.balance === -1 ? '∞' : credit.balance,
      isUnlimited: (credit.leave_types as any)?.is_unlimited || credit.entitled === -1
    })) || [];

    return NextResponse.json({ credits: formattedCredits });

  } catch (error: any) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}

// PUT - Update user credits
export async function PUT(request: NextRequest) {
  try {
    const { userId, credits } = await request.json();

    if (!userId || !credits || !Array.isArray(credits)) {
      return NextResponse.json(
        { error: 'User ID and credits array are required' },
        { status: 400 }
      );
    }

    // Update each credit
    for (const credit of credits) {
      // Skip unlimited leave types
      if (credit.isUnlimited) continue;

      const { error } = await supabaseAdmin
        .from('user_leave_credits')
        .update({
          entitled: parseFloat(credit.entitled) || 0,
          balance: parseFloat(credit.balance) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', credit.id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error updating credits:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update credits' },
      { status: 500 }
    );
  }
}
