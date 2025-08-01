import { NextResponse } from 'next/server';
import BigBlueButtonAPI from '@/lib/bigbluebutton';
import { getConfig } from '@/config/bigbluebutton';

export async function POST(request) {
  try {
    const { meetingID } = await request.json();

    if (!meetingID) {
      return NextResponse.json(
        { error: 'Missing required field: meetingID' },
        { status: 400 }
      );
    }

    const config = getConfig();
    const bbb = new BigBlueButtonAPI(config.serverUrl, config.sharedSecret);

    // End the meeting using moderator password
    const result = await bbb.endMeeting(meetingID, config.defaultSettings.moderatorPW);

    if (result.success) {
      return NextResponse.json({
        success: true,
        meetingID,
        message: 'Meeting ended successfully'
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to end meeting' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error ending meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to end meeting' },
      { status: 500 }
    );
  }
}