import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Get user from database
    // 3. Return user data
    
    // For now, return demo user
    return NextResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+90 555 123 4567',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
