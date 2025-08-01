import { NextResponse } from 'next/server';
import BigBlueButtonAPI from '@/lib/bigbluebutton';
import { getConfig } from '@/config/bigbluebutton';

export async function POST(request) {
  try {
    const { meetingID, fullName, role } = await request.json();

    if (!meetingID || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: meetingID, fullName' },
        { status: 400 }
      );
    }

    const config = getConfig();
    const bbb = new BigBlueButtonAPI(config.serverUrl, config.sharedSecret);

    // Check if meeting is running
    const isRunning = await bbb.isMeetingRunning(meetingID);
    
    if (!isRunning.running) {
      return NextResponse.json(
        { error: 'Meeting is not currently running' },
        { status: 404 }
      );
    }

    // Determine password based on role
    const password = role === 'moderator' 
      ? config.defaultSettings.moderatorPW 
      : config.defaultSettings.attendeePW;

    // Generate join URL
    const joinUrl = bbb.generateJoinUrl(meetingID, fullName, password);

    return NextResponse.json({
      success: true,
      joinUrl,
      meetingID,
      fullName,
      role,
      message: 'Join URL generated successfully'
    });

  } catch (error) {
    console.error('Error joining meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join meeting' },
      { status: 500 }
    );
  }
}