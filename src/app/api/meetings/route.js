import { NextResponse } from 'next/server';
import BigBlueButtonAPI from '@/lib/bigbluebutton';
import { getConfig } from '@/config/bigbluebutton';

export async function GET() {
  try {
    const config = getConfig();
    const bbb = new BigBlueButtonAPI(config.serverUrl, config.sharedSecret);

    // Get all meetings
    const result = await bbb.getMeetings();

    if (result.success) {
      return NextResponse.json({
        success: true,
        meetings: result.meetings || [],
        message: 'Meetings retrieved successfully'
      });
    } else {
      return NextResponse.json({
        success: true,
        meetings: [],
        message: 'No meetings found'
      });
    }

  } catch (error) {
    console.error('Error getting meetings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get meetings' },
      { status: 500 }
    );
  }
}