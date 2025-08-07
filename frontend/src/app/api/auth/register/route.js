import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, firstName, lastName, phoneNumber, password } = await request.json();
    
    // Basic validation
    if (!email || !firstName || !lastName || !phoneNumber || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate email format
    // 2. Check if email already exists
    // 3. Hash password
    // 4. Save to database
    // 5. Send verification email
    
    // For now, return a demo response
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: Date.now().toString(),
          email,
          firstName,
          lastName,
          phoneNumber,
          createdAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
