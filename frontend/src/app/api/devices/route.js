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
    // 2. Get user devices from database
    // 3. Return device list
    
    // For now, return demo devices
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'device1',
          userId: '1',
          deviceCode: 'DEMO123',
          name: 'My First Plush',
          photo: '/placeholder-plush.jpg',
          language: 'tr',
          settings: {
            coin: 'BTC',
            lowerThreshold: 30000,
            upperThreshold: 70000,
            twitterFollow: {
              enabled: false,
              url: ''
            },
            voice: 'voice1'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Activation code is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify activation code
    // 2. Create device in database
    // 3. Link to user account
    
    // For now, return demo device
    const newDevice = {
      id: Date.now().toString(),
      userId: '1',
      deviceCode: code,
      name: `Plush Device ${code}`,
      language: 'tr',
      settings: {
        coin: 'BTC',
        voice: 'voice1'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newDevice
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
